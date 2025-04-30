import express from 'express';
import { create, getUserBookings, getOwnerBookings, cancel } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, create);
router.get('/user', protect, getUserBookings);
router.get('/owner', protect, getOwnerBookings);
router.put('/:id/cancel', protect, cancel);

export default router; 