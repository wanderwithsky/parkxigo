const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: {
    type: Number,
    required: true
  },
  totalSpots: {
    type: Number,
    required: true
  },
  availableSpots: {
    type: Number,
    required: true
  },
  features: [{
    type: String
  }],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerEmail: {
    type: String
  },
  images: [{
    type: String
  }],
  availability: {
    from: {
      type: Date,
      required: true
    },
    to: {
      type: Date,
      required: true
    }
  }
}, {
  timestamps: true
});

// Create a 2dsphere index for location-based queries
parkingSpotSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ParkingSpot', parkingSpotSchema); 