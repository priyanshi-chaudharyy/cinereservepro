import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);

// NOTE: The /webhook route is mounted directly in server.js BEFORE express.json()
// so that Razorpay's raw body is preserved for crypto signature validation.

export default router;
