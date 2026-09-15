import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { z } from 'zod';

export const getAdminStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Calculate GMV (Total successful order volume)
    const paidOrders = await prisma.order.findMany({
      where: { payment_status: 'SUCCESS' },
      select: { total_amount: true, created_at: true }
    });

    const totalGmv = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const totalOrdersCount = await prisma.order.count();

    // 2. Orders by status breakdown
    const pendingOrdersCount = await prisma.order.count({ where: { payment_status: 'PENDING' } });
    const processingSubOrdersCount = await prisma.subOrder.count({ where: { status: 'PROCESSING' } });
    const shippedSubOrdersCount = await prisma.subOrder.count({ where: { status: 'SHIPPED' } });
    const deliveredSubOrdersCount = await prisma.subOrder.count({ where: { status: 'DELIVERED' } });

    // 3. Vendor status pipeline
    const totalVendors = await prisma.user.count({ where: { role: 'VENDOR' } });
    const pendingVendors = await prisma.vendorProfile.count({
      where: { is_approved: false, is_blocked: false }
    });
    const approvedVendors = await prisma.vendorProfile.count({
      where: { is_approved: true, is_blocked: false }
    });
    const blockedVendors = await prisma.vendorProfile.count({
      where: { is_blocked: true }
    });

    // 4. Platform customers & products
    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalProducts = await prisma.product.count();

    // 5. Recent 7-Day Revenue Velocity
    const last7Days: { date: string; revenue: number; orders: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      const dayOrders = paidOrders.filter(
        o => o.created_at >= dayStart && o.created_at <= dayEnd
      );

      const dayRevenue = dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      last7Days.push({
        date: dayStr,
        revenue: dayRevenue,
        orders: dayOrders.length,
      });
    }

    // 6. Recent Orders Feed
    const recentOrders: any[] = await prisma.order.findMany({
      take: 6,
      orderBy: { created_at: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        subOrders: {
          include: {
            vendor: { select: { business_name: true } },
            orderItems: true
          }
        }
      }
    });

    res.json({
      stats: {
        totalGmv,
        totalOrders: totalOrdersCount,
        pendingOrders: pendingOrdersCount,
        processingOrders: processingSubOrdersCount,
        shippedOrders: shippedSubOrdersCount,
        deliveredOrders: deliveredSubOrdersCount,
        totalVendors,
        pendingVendors,
        approvedVendors,
        blockedVendors,
        totalCustomers,
        totalProducts,
        last7Days,
      },
      recentOrders: recentOrders.map((o: any) => ({
        id: o.id,
        customerName: o.customer?.name || o.customer?.email?.split('@')[0] || 'Customer',
        customerEmail: o.customer?.email || '',
        totalAmount: Number(o.total_amount),
        paymentStatus: o.payment_status,
        shippingAddress: o.shipping_address,
        subOrdersCount: o.subOrders?.length || 0,
        itemsCount: o.subOrders?.reduce((sum: number, so: any) => sum + (so.orderItems?.length || 0), 0) || 0,
        createdAt: o.created_at,
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const getVendors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vendors = await prisma.user.findMany({
      where: { role: 'VENDOR' },
      include: { vendorProfile: true },
      orderBy: { created_at: 'desc' }
    });

    res.json({ vendors });
  } catch (error) {
    next(error);
  }
};

export const approveVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    
    const vendorProfile = await prisma.vendorProfile.findUnique({ where: { user_id: id } });
    if (!vendorProfile) {
      res.status(404).json({ message: 'Vendor not found' });
      return;
    }

    await prisma.vendorProfile.update({
      where: { user_id: id },
      data: { is_approved: true, is_blocked: false }
    });

    res.json({ message: 'Vendor approved successfully' });
  } catch (error) {
    next(error);
  }
};

const blockSchema = z.object({
  reason: z.string().min(3)
});

export const blockVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { reason } = blockSchema.parse(req.body);

    const vendorProfile = await prisma.vendorProfile.findUnique({ where: { user_id: id } });
    if (!vendorProfile) {
      res.status(404).json({ message: 'Vendor not found' });
      return;
    }

    await prisma.vendorProfile.update({
      where: { user_id: id },
      data: { is_blocked: true, block_reason: reason }
    });

    res.json({ message: 'Vendor blocked successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAdminOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        shippingAddress: true,
        subOrders: {
          include: {
            vendor: {
              select: {
                id: true,
                business_name: true,
                user: { select: { email: true } }
              }
            },
            orderItems: {
              include: {
                variant: {
                  include: {
                    product: { select: { id: true, title: true, images: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      res.status(400).json({ error: 'Invalid order status' });
      return;
    }

    const subOrder = await prisma.subOrder.update({
      where: { id },
      data: { status }
    });

    res.json({ message: 'Sub-order status updated', subOrder });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

const categorySchema = z.object({
  name: z.string().min(2),
  commission_rate: z.number().min(0).max(100).default(10.0),
  parent_id: z.string().optional().nullable(),
});

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, commission_rate, parent_id } = categorySchema.parse(req.body);

    const category = await prisma.category.create({
      data: {
        name,
        commission_rate,
        parent_id: parent_id || null,
      } as any
    });

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
