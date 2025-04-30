import express from 'express';
import { validateToken } from '../middleware/auth';
import {
  getParkingSpots,
  getParkingSpot,
  createParkingSpot,
  updateParkingSpot,
  deleteParkingSpot
} from '../controllers/parkingSpotController';
import { upload } from '../controllers/parkingSpotController';

const router = express.Router();

// Public routes
router.get('/', getParkingSpots);
router.get('/:id', getParkingSpot);

// Protected routes
router.post('/', validateToken, upload.array('images'), createParkingSpot);
router.put('/:id', validateToken, updateParkingSpot);
router.delete('/:id', validateToken, deleteParkingSpot);

export default router; 