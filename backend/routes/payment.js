import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  processPayment, 
  getPaymentDetails, 
  getUserPayments, 
  refundPayment 
} from '../controllers/paymentController.js';

const router = express.Router();

// Process a new payment
router.post('/', protect, processPayment);

// Get details of a specific payment
router.get('/:id', protect, getPaymentDetails);

// Get all payments for the authenticated user
router.get('/', protect, getUserPayments);

// Request a refund
router.post('/:id/refund', protect, refundPayment);

export default router; 