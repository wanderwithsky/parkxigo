import express from 'express';
import { getAll, getOne, create, update, remove } from '../controllers/parkingSpotController.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', protect, admin, upload.single('image'), create);
router.put('/:id', protect, admin, update);
router.delete('/:id', protect, admin, remove);

export default router; 