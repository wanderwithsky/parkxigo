import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  parkingSpotId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpot' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startTime: Date,
  endTime: Date,
  totalCost: Number,
  status: { type: String, enum: ['confirmed', 'completed', 'cancelled'], default: 'confirmed' },
  qrCode: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Booking', bookingSchema); 