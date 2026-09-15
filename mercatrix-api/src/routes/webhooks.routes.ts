import { Router } from 'express';
import { razorpayWebhook } from '../controllers/webhooks.controller';

const router = Router();

// POST /api/webhooks/razorpay
router.post('/razorpay', razorpayWebhook);

export default router;