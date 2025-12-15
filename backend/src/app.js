const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { testConnection } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { logTransaction } = require('./middleware/logger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const logRoutes = require('./routes/logRoutes');
const transactionRoutes = require('./routes/transactions');
const alertRoutes = require('./routes/alertRoutes');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS middleware - allow frontend to access API
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Transaction logger middleware - logs all requests
app.use(logTransaction);

// Health check endpoint - shows if API and DB are working
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    database: dbStatus ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Grip Invest API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      products: '/api/products',
      investments: '/api/investments',
      logs: '/api/logs',
      transactions: '/api/transactions'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/alerts', alertRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
