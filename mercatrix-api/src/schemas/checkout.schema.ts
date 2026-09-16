import { z } from 'zod';
import { addressSchema } from './address.schema';

export const checkoutItemSchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  price: z.number().positive().optional(),
});

export const checkoutSummarySchema = z.object({
  items: z.array(checkoutItemSchema).optional(),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Invalid PIN code').optional(),
});

export const createOrderSchema = z.object({
  items: z.array(checkoutItemSchema).optional(),
  addressId: z.string().min(1, 'Invalid address ID').optional(),
  newAddress: addressSchema.optional(),
}).refine((data) => Boolean(data.addressId || data.newAddress), {
  message: 'Delivery address is required for checkout. Please select a saved address or enter a new address.',
  path: ['addressId'],
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().optional(),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
