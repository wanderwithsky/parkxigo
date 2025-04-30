// Direct server file for Render deployments
console.log('Starting ParkXiGo direct server...');

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration with specific origins
const corsOptions = {
  origin: [
    'https://parkxigo.netlify.app',
    'http://localhost:5173', // For local development
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS with options
app.use(cors(corsOptions));
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ParkXiGo API is running (root server)',
    environment: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API endpoint for frontend
app.get('/api/auth/ping', (req, res) => {
  res.json({ status: 'ok', message: 'Authentication service is running' });
});

// Mock auth endpoints
app.post('/api/auth/login', (req, res) => {
  res.json({
    user: {
      id: 'user123',
      name: 'Demo User',
      email: req.body.email || 'user@example.com',
      role: 'user'
    },
    token: 'mock-token-12345'
  });
});

// Mock parking spots endpoint
app.get('/api/parkingspots', (req, res) => {
  res.json([
    {
      id: 'spot1',
      title: 'Downtown Parking',
      description: 'Convenient downtown parking spot',
      address: '123 Main St, Downtown',
      location: {
        type: 'Point',
        coordinates: [72.8777, 19.0760] // Mumbai coordinates
      },
      price: 5.99,
      totalSpots: 10,
      availableSpots: 5,
      features: ['Covered', 'Security', '24/7 Access'],
      ownerId: 'user123',
      images: ['https://placehold.co/600x400?text=Parking+Spot']
    },
    {
      id: 'spot2',
      title: 'Mall Parking',
      description: 'Secure parking near shopping mall',
      address: '456 Market Ave, City Center',
      location: {
        type: 'Point',
        coordinates: [72.8856, 19.0822]
      },
      price: 4.50,
      totalSpots: 15,
      availableSpots: 8,
      features: ['Covered', 'EV Charging'],
      ownerId: 'user456',
      images: ['https://placehold.co/600x400?text=Mall+Parking']
    }
  ]);
});

// Start server
app.listen(PORT, () => {
  console.log(`ParkXiGo server running on port ${PORT}`);
  console.log('CORS enabled for:', corsOptions.origin.join(', '));
}); 