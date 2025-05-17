//server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { validationResult } = require('express-validator');
// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Response standardization
app.use((req, res, next) => {
  res.apiSuccess = (data, status = 200) => res.status(status).json({
    success: true,
    data
  });
  
  res.apiError = (message, status = 400) => res.status(status).json({
    success: false,
    error: message
  });
  
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', require('./middleware/authMiddleware').authenticate, cartRoutes);
app.use('/api/orders', require('./middleware/authMiddleware').authenticate, orderRoutes);
app.use('/api/users', require('./middleware/authMiddleware').authenticate, userRoutes);
app.use('/api/payments', require('./middleware/authMiddleware').authenticate, paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.apiSuccess({ status: 'OK', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.apiError('Endpoint not found', 404);
});

// Error handling
app.use((err, req, res, next) => {
  // Handle validation errors
  if (err.array) { // Check for express-validator errors
    return res.apiError(err.array(), 422);
  }
  
  // Handle JWT errors
  if (err.name === 'UnauthorizedError') {
    return res.apiError('Invalid authentication', 401);
  }

  console.error('[ERROR]', err);
  res.apiError('Internal server error', 500);
});

// Server start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});