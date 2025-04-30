// Fallback server file for Render deployments
console.log('Starting fallback server...');

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ParkXiGo API is running (fallback server)',
    environment: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Fallback server running on port ${PORT}`);
}); 