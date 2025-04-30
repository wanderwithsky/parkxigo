import express from 'express';
import { validateToken } from '../middleware/auth';
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking
} from '../controllers/bookingController';

const router = express.Router();

// All routes are protected
router.use(validateToken);

router.get('/', getBookings);
router.get('/:id', getBooking);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

export default router; 