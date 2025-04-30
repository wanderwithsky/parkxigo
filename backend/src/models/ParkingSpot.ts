import { Schema, model, Document } from 'mongoose';

export interface IParkingSpot extends Document {
  id: string;
  _id: string;
  title: string;
  description: string;
  location: {
    type: string;
    coordinates: number[];
  };
  address: string;
  price: number;
  totalSpots: number;
  availableSpots: number;
  ownerId: string;
  ownerEmail?: string;
  availability: {
    from: Date;
    to: Date;
  };
  images: string[];
  features?: any;
  createdAt: Date;
  updatedAt: Date;
}

const ParkingSpotSchema = new Schema<IParkingSpot>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    address: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalSpots: {
      type: Number,
      required: true,
      min: 1,
    },
    availableSpots: {
      type: Number,
      required: true,
      min: 0,
    },
    ownerId: {
      type: String,
      required: true,
      ref: 'User',
    },
    ownerEmail: {
      type: String,
    },
    availability: {
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
        required: true,
      },
    },
    images: [{
      type: String,
    }],
    features: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Create a geospatial index on the location field
ParkingSpotSchema.index({ location: '2dsphere' });

export const ParkingSpot = model<IParkingSpot>('ParkingSpot', ParkingSpotSchema); 