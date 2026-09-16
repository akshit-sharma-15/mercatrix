import { Router } from 'express';
import { 
  getVendorProfile, 
  updateVendorProfile,
  getVendorDashboardStats, 
  getVendorOrders, 
  updateVendorOrderStatus, 
  getVendorProducts 
} from '../controllers/vendor.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Protect all vendor routes
router.use(authenticate, requireRole(['VENDOR']));

// Profile & Stats
router.get('/profile', getVendorProfile);
router.put('/profile', updateVendorProfile);
router.get('/stats', getVendorDashboardStats);

// Products
router.get('/products', getVendorProducts);

// Orders & Fulfillment Tracking
router.get('/orders', getVendorOrders);
router.put('/orders/:subOrderId/status', updateVendorOrderStatus);

export default router;