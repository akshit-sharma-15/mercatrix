import { Router } from 'express';
import { getProducts, getProductById, getProductVariants } from '../controllers/customer.controller';
import { 
  getAddresses, 
  getAddressById, 
  createAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress 
} from '../controllers/address.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { prisma } from '../config/db';

const router = Router();

// Public Product routes
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/products/:productId/variants', getProductVariants);

// Authenticated Customer Address routes
router.get('/addresses', authenticate, getAddresses);
router.get('/addresses/:id', authenticate, getAddressById);
router.post('/addresses', authenticate, createAddress);
router.put('/addresses/:id', authenticate, updateAddress);
router.delete('/addresses/:id', authenticate, deleteAddress);
router.patch('/addresses/:id/default', authenticate, setDefaultAddress);

// Cart routes
router.get('/cart', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const cartItems = await prisma.cartItem.findMany({
      where: { user_id: userId },
      include: {
        variant: {
          include: {
            product: {
              include: { images: true, vendor: true }
            }
          }
        }
      },
      orderBy: { added_at: 'desc' }
    });
    res.json(cartItems);
  } catch (error) {
    next(error);
  }
});

// Authenticated Customer Orders
router.get('/orders', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const orders = await prisma.order.findMany({
      where: { customer_id: userId },
      include: {
        shippingAddress: true,
        subOrders: {
          include: {
            vendor: true,
            orderItems: {
              include: {
                variant: {
                  include: { product: { include: { images: true } } }
                }
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Authenticated Customer Order by ID
router.get('/orders/:id', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const order = await prisma.order.findFirst({
      where: { id, customer_id: userId },
      include: {
        shippingAddress: true,
        subOrders: {
          include: {
            vendor: true,
            orderItems: {
              include: {
                variant: {
                  include: { product: { include: { images: true } } }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// Reviews route
router.post('/reviews', authenticate, (req, res) => {
  res.json({ message: 'Create review' });
});

export default router;