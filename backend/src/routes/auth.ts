import express from 'express';
import { register, login, createAdmin, verifyAdmin } from '../controllers/authController';
import { validateToken } from '../middleware/auth';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/ping', (req, res) => res.status(200).json({ message: 'Server is online' }));

// Admin creation route (one-time setup)
router.post('/create-admin', createAdmin);

// Protected routes
router.get('/verify-admin', validateToken, verifyAdmin);

export default router; 