import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  parkingSpotId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    parkingSpotId: {
      type: String,
      required: true,
      ref: 'ParkingSpot'
    },
    userId: {
      type: String,
      required: true,
      ref: 'User'
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
BookingSchema.index({ parkingSpotId: 1, startTime: 1 });
BookingSchema.index({ userId: 1, status: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema); 