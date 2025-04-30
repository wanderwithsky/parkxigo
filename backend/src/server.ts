import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { errorHandler } from './middleware/errorHandler';
import path from 'path';
import ensureUploadsDir from './config/setupUploads';

import authRoutes from './routes/auth';
import parkingSpotRoutes from './routes/parkingspot';
import bookingRoutes from './routes/booking';
import contactRoutes from './routes/contact';
import reviewRoutes from './routes/reviewRoutes';

dotenv.config();
connectDB();

// Ensure uploads directory exists
ensureUploadsDir();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/parkingspots', parkingSpotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewRoutes);

app.use(errorHandler);

// Use a different port to avoid conflicts
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 