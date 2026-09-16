import { Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { prisma } from '../config/db';

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const hasRazorpayKeys = Boolean(
  razorpayKeyId &&
  razorpayKeySecret &&
  razorpayKeyId !== 'dummy_key' &&
  razorpayKeySecret !== 'dummy_secret'
);

const razorpay = new Razorpay({
  key_id: razorpayKeyId || 'dummy_key',
  key_secret: razorpayKeySecret || 'dummy_secret',
});

export const razorpayWebhook = async (req: Request, res: Response): Promise<void> => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'] as string;

  // 1. Signature Verification (if webhook secret configured)
  if (secret) {
    if (!signature) {
      res.status(400).json({ error: 'Missing x-razorpay-signature header' });
      return;
    }

    const payloadString = (req as any).rawBody 
      ? (req as any).rawBody.toString('utf8') 
      : JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    if (expectedSignature !== signature) {
      res.status(400).json({ error: 'Invalid webhook signature' });
      return;
    }
  }

  const event = req.body.event;

  // 2. Handle Payment Confirmation Events
  if (event === 'payment.captured' || event === 'order.paid') {
    // Safely extract razorpayOrderId for both payment.captured and order.paid event structures
    const razorpayOrderId = 
      req.body.payload?.payment?.entity?.order_id || 
      req.body.payload?.order?.entity?.id;

    const paymentEntityId = req.body.payload?.payment?.entity?.id;

    if (!razorpayOrderId) {
      res.status(400).json({ error: 'Missing order_id in webhook payload' });
      return;
    }

    try {
      await prisma.$transaction(async (tx: any) => {
        // Find Primary Order
        const existingOrder = await tx.order.findUnique({
          where: { razorpay_order_id: razorpayOrderId },
          include: { subOrders: { include: { orderItems: true } } }
        });

        if (!existingOrder) {
          console.warn(`Webhook: No order found matching razorpay_order_id: ${razorpayOrderId}`);
          return;
        }

        // Idempotency: If already confirmed by client-side verifyPayment, prevent duplicate inventory decrement
        if (existingOrder.payment_status === 'SUCCESS') {
          console.log(`Webhook: Order ${existingOrder.id} already marked SUCCESS. Skipping duplicate inventory deduction.`);
          return;
        }

        // Mark Primary Order as SUCCESS
        await tx.order.update({
          where: { id: existingOrder.id },
          data: { payment_status: 'SUCCESS' }
        });

        // Loop through SubOrders to safely lock and deduct stock
        for (const subOrder of existingOrder.subOrders) {
          let hasOutOfStockItem = false;

          for (const item of subOrder.orderItems) {
            // Raw Query for Row-Level Locking (Prevents Concurrency Race Conditions)
            const variantLock = await tx.$queryRaw<Array<{ stock_quantity: number }>>`
              SELECT stock_quantity FROM "ProductVariant" 
              WHERE id = ${item.variant_id} FOR UPDATE
            `;

            if (variantLock.length === 0 || variantLock[0].stock_quantity < item.quantity) {
              hasOutOfStockItem = true;
              console.warn(`Webhook: Insufficient stock for variant ${item.variant_id}`);

              // Trigger refund if live Razorpay keys are configured
              if (hasRazorpayKeys && paymentEntityId) {
                try {
                  await razorpay.payments.refund(paymentEntityId, {
                    amount: Math.round(Number(item.price_at_purchase) * item.quantity * 100),
                    notes: { reason: 'Out of stock concurrency race condition' }
                  });
                } catch (refundErr) {
                  console.error('Failed to trigger automatic partial refund:', refundErr);
                }
              }
              continue;
            }

            // Deduct Stock Safely
            await tx.productVariant.update({
              where: { id: item.variant_id },
              data: { stock_quantity: { decrement: item.quantity } }
            });
          }

          // Transition SubOrder status to PROCESSING (or CANCELLED if item was out of stock)
          await tx.subOrder.update({
            where: { id: subOrder.id },
            data: { status: hasOutOfStockItem ? 'CANCELLED' : 'PROCESSING' }
          });
        }
      });

      res.status(200).json({ status: 'ok', message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Internal server error processing webhook' });
    }
  } else {
    // Acknowledge other webhook events
    res.status(200).json({ status: 'ignored', message: `Event ${event} acknowledged` });
  }
};
