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
    '*' // Allow all origins temporarily for debugging
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS with options
app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ParkXiGo API is running (root server)',
    environment: process.env.NODE_ENV,
    time: new Date().toISOString(),
    routes: [
      { path: '/auth/login', method: 'POST', description: 'User login' },
      { path: '/auth/register', method: 'POST', description: 'User registration' },
      { path: '/parkingspots', method: 'GET', description: 'Get parking spots' }
    ],
    adminCredentials: {
      email: 'admin@parkxigo.com',
      password: 'admin123'
    }
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

// Auth endpoints - handle both /api/auth/ and /auth/ paths
const handleLogin = (req, res) => {
  console.log('Login request received:', req.body);
  
  // Check if it's the admin credentials
  if (req.body.email === 'admin@parkxigo.com' && req.body.password === 'admin123') {
    return res.json({
      user: {
        id: 'admin001',
        name: 'Admin User',
        email: 'admin@parkxigo.com',
        role: 'admin'
      },
      token: 'admin-token-xyz-12345'
    });
  }
  
  // Regular user login
  res.json({
    user: {
      id: 'user123',
      name: 'Demo User',
      email: req.body.email || 'user@example.com',
      role: 'user'
    },
    token: 'mock-token-12345'
  });
};

app.post('/api/auth/login', handleLogin);
app.post('/auth/login', handleLogin);

const handleRegister = (req, res) => {
  console.log('Register request received:', req.body);
  res.json({
    user: {
      id: 'user456',
      name: req.body.name || 'New User',
      email: req.body.email || 'newuser@example.com',
      role: 'user'
    },
    token: 'mock-token-67890'
  });
};

app.post('/api/auth/register', handleRegister);
app.post('/auth/register', handleRegister);

// Admin-only endpoints
app.get('/api/admin/dashboard', (req, res) => {
  // Simple auth check (in production, you'd verify the token)
  const token = req.headers.authorization;
  if (!token || !token.includes('admin-token')) {
    return res.status(401).json({ status: 'error', message: 'Admin access required' });
  }
  
  res.json({
    status: 'ok',
    stats: {
      totalUsers: 256,
      totalParkingSpots: 124,
      activeBookings: 45,
      revenue: 12520
    },
    recentBookings: [
      { id: 'b1', userId: 'user123', spotId: 'spot1', amount: 25.99, status: 'active' },
      { id: 'b2', userId: 'user456', spotId: 'spot2', amount: 15.50, status: 'completed' }
    ]
  });
});

// Mock parking spots handler
const handleParkingSpots = (req, res) => {
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
};

// Support both path patterns for parking spots
app.get('/api/parkingspots', handleParkingSpots);
app.get('/parkingspots', handleParkingSpots);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: err.message
  });
});

// Catch-all for non-existent routes
app.use((req, res) => {
  console.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.url}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`ParkXiGo server running on port ${PORT}`);
  console.log('CORS enabled for:', corsOptions.origin.join(', '));
  console.log('Admin credentials: admin@parkxigo.com / admin123');
}); 