import { Router } from 'express';
import { getCheckoutSummary, createOrder, verifyPayment } from '../controllers/checkout.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/checkout/summary -> Price breakdown, shipping calculation, and stock verification
router.post('/summary', authenticate, getCheckoutSummary);

// POST /api/checkout -> Order creation with mandatory delivery address and Razorpay split payment
router.post('/', authenticate, createOrder);

// POST /api/checkout/verify -> Client payment verification & stock decrement
router.post('/verify', authenticate, verifyPayment);

export default router;