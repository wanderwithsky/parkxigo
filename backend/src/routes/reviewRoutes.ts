import express from 'express';
import { validateToken } from '../middleware/auth';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  reactToReview
} from '../controllers/reviewController';

const router = express.Router();

// Public routes
router.get('/parking-spot/:parkingSpotId', getReviews);

// Protected routes
router.post('/', validateToken, createReview);
router.put('/:id', validateToken, updateReview);
router.delete('/:id', validateToken, deleteReview);
router.post('/:id/react', validateToken, reactToReview);

export default router; 