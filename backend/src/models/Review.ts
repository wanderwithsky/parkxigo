import mongoose, { Document, Schema } from 'mongoose';

export interface IReaction {
  userId: string;
  action: 'like' | 'dislike';
}

export interface IReview extends Document {
  parkingSpotId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  likes: number;
  dislikes: number;
  reactions: IReaction[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
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
    userName: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    likes: {
      type: Number,
      default: 0
    },
    dislikes: {
      type: Number,
      default: 0
    },
    reactions: [{
      userId: {
        type: String,
        required: true,
        ref: 'User'
      },
      action: {
        type: String,
        required: true,
        enum: ['like', 'dislike']
      }
    }]
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
ReviewSchema.index({ parkingSpotId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema); 