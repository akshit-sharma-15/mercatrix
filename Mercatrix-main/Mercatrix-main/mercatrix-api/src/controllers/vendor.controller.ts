import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { z } from 'zod';

/**
 * Helper to get the VendorProfile from authenticated user
 */
const getVendorProfileFromUser = async (userId: string) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { user_id: userId }
  });
  return vendorProfile;
};

/**
 * GET /api/vendor/profile
 */
export const getVendorProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { user_id: userId },
      include: {
        user: { select: { name: true, email: true, phone: true, avatar_url: true } }
      }
    });

    if (!vendorProfile) {
      res.status(404).json({ error: 'Vendor profile not found' });
      return;
    }

    res.json({ vendorProfile });
  } catch (error) {
    next(error);
  }
};

const updateVendorProfileSchema = z.object({
  business_name: z.string().min(2).optional(),
  gst_vat_number: z.string().optional(),
  tax_id: z.string().optional(),
  phone: z.string().optional(),
});

/**
 * PUT /api/vendor/profile
 */
export const updateVendorProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { business_name, gst_vat_number, tax_id, phone } = updateVendorProfileSchema.parse(req.body);

    const profile = await getVendorProfileFromUser(userId);
    if (!profile) {
      res.status(404).json({ error: 'Vendor profile not found' });
      return;
    }

    const updatedProfile = await prisma.vendorProfile.update({
      where: { id: profile.id },
      data: {
        ...(business_name ? { business_name } : {}),
        ...(gst_vat_number !== undefined ? { gst_vat_number } : {}),
        ...(tax_id !== undefined ? { tax_id } : {}),
      },
      include: {
        user: { select: { name: true, email: true, phone: true, avatar_url: true } }
      }
    });

    if (phone) {
      await prisma.user.update({
        where: { id: userId },
        data: { phone }
      });
    }

    res.json({ message: 'Store profile updated successfully', vendorProfile: updatedProfile });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/vendor/stats
 */
export const getVendorDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await getVendorProfileFromUser(userId);

    if (!profile) {
      res.status(404).json({ error: 'Vendor profile not found' });
      return;
    }

    // 1. All sub-orders for this vendor
    const subOrders: any[] = await prisma.subOrder.findMany({
      where: { vendor_id: profile.id },
      include: {
        order: { select: { payment_status: true, created_at: true, customer: { select: { name: true, email: true } } } },
        orderItems: true
      },
      orderBy: { id: 'desc' }
    });

    const totalRevenue = subOrders
      .filter((so: any) => so.status !== 'CANCELLED')
      .reduce((sum: number, so: any) => sum + Number(so.sub_total), 0);

    const activeOrdersCount = subOrders.filter((so: any) => ['PENDING', 'PROCESSING', 'SHIPPED'].includes(so.status)).length;
    const deliveredOrdersCount = subOrders.filter((so: any) => so.status === 'DELIVERED').length;

    // 2. Products count
    const productsCount = await prisma.product.count({
      where: { vendor_id: profile.id }
    });

    // 3. Recent 5 orders
    const recentOrders = subOrders.slice(0, 5).map((so: any) => ({
      id: so.id,
      orderId: so.order_id,
      customerName: so.order.customer.name || so.order.customer.email.split('@')[0],
      customerEmail: so.order.customer.email,
      total: Number(so.sub_total),
      commissionDeducted: Number(so.commission_deducted),
      status: so.status,
      trackingId: so.tracking_id,
      deliveryPartner: so.delivery_partner,
      date: so.order.created_at,
      itemsCount: so.orderItems.length,
    }));

    res.json({
      stats: {
        totalRevenue,
        activeOrdersCount,
        deliveredOrdersCount,
        productsCount,
        isApproved: profile.is_approved,
        isBlocked: profile.is_blocked,
        businessName: profile.business_name,
      },
      recentOrders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/vendor/orders
 * Returns all sub-orders for this vendor with customer delivery address snapshot & tracking info
 */
export const getVendorOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await getVendorProfileFromUser(userId);

    if (!profile) {
      res.status(404).json({ error: 'Vendor profile not found' });
      return;
    }

    const subOrders = await prisma.subOrder.findMany({
      where: { vendor_id: profile.id },
      include: {
        order: {
          select: {
            id: true,
            created_at: true,
            payment_status: true,
            shipping_address: true,
            customer: {
              select: { id: true, name: true, email: true, phone: true }
            }
          }
        },
        orderItems: {
          include: {
            variant: {
              include: {
                product: {
                  select: { id: true, title: true, images: true }
                }
              }
            }
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    const formattedOrders = (subOrders as any[]).map((so: any) => ({
      id: so.id,
      orderId: so.order.id,
      date: so.order.created_at,
      status: so.status,
      subTotal: Number(so.sub_total),
      commissionDeducted: Number(so.commission_deducted),
      netPayout: Number(so.sub_total) - Number(so.commission_deducted),
      trackingId: so.tracking_id,
      deliveryPartner: so.delivery_partner,
      paymentStatus: so.order.payment_status,
      customer: {
        name: so.order.customer.name || so.order.customer.email.split('@')[0],
        email: so.order.customer.email,
        phone: so.order.customer.phone || 'N/A',
      },
      shippingAddress: so.order.shipping_address,
      items: (so.orderItems as any[]).map((item: any) => ({
        id: item.id,
        title: item.variant.product.title,
        sku: item.variant.sku,
        attributes: item.variant.attributes,
        quantity: item.quantity,
        price: Number(item.price_at_purchase),
        image: item.variant.product.images?.[0]?.image_url || null,
      }))
    }));

    res.json({ orders: formattedOrders });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  tracking_id: z.string().optional(),
  delivery_partner: z.string().optional(),
});

/**
 * PUT /api/vendor/orders/:subOrderId/status
 * Vendor updates fulfillment status and enters carrier tracking info
 */
export const updateVendorOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await getVendorProfileFromUser(userId);

    if (!profile) {
      res.status(404).json({ error: 'Vendor profile not found' });
      return;
    }

    const subOrderId = String(req.params.subOrderId);
    const { status, tracking_id, delivery_partner } = updateOrderStatusSchema.parse(req.body);

    // Ensure sub-order belongs to this vendor
    const existingSubOrder = await prisma.subOrder.findFirst({
      where: { id: subOrderId, vendor_id: profile.id }
    });

    if (!existingSubOrder) {
      res.status(404).json({ error: 'Sub-order not found or unauthorized' });
      return;
    }

    let finalTrackingId = tracking_id;
    let finalPartner = delivery_partner;

    // Automatic AWB generation if vendor marks as SHIPPED without manual input
    if (status === 'SHIPPED') {
      if (!finalPartner) {
        finalPartner = 'Blue Dart Express';
      }
      if (!finalTrackingId) {
        const randNum = Math.floor(10000000 + Math.random() * 90000000);
        finalTrackingId = `BD-${randNum}`;
      }
    }

    const updatedSubOrder = await prisma.subOrder.update({
      where: { id: subOrderId },
      data: {
        status,
        ...(finalTrackingId !== undefined ? { tracking_id: finalTrackingId || null } : {}),
        ...(finalPartner !== undefined ? { delivery_partner: finalPartner || null } : {}),
      }
    });

    res.json({
      message: 'Order fulfillment status updated successfully',
      subOrder: updatedSubOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/vendor/products
 */
export const getVendorProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await getVendorProfileFromUser(userId);

    if (!profile) {
      res.status(404).json({ error: 'Vendor profile not found' });
      return;
    }

    const products = await prisma.product.findMany({
      where: { vendor_id: profile.id },
      include: {
        category: true,
        images: true,
        variants: true,
      },
      orderBy: { id: 'desc' }
    });

    res.json({ products });
  } catch (error) {
    next(error);
  }
};
