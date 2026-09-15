import { Router } from 'express';
import { 
  getAdminStats, 
  getVendors, 
  approveVendor, 
  blockVendor, 
  getAdminOrders, 
  updateOrderStatus, 
  getCategories, 
  createCategory, 
  deleteCategory 
} from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Only SUPER_ADMIN can access these routes
router.use(authenticate, requireRole(['SUPER_ADMIN']));

// GET /api/admin/stats -> Dashboard metrics & analytics
router.get('/stats', getAdminStats);

// Vendors management
router.get('/vendors', getVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/block', blockVendor);

// Orders management
router.get('/orders', getAdminOrders);
router.put('/orders/suborders/:id/status', updateOrderStatus);

// Categories management
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

export default router;