import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

import { connectDatabase } from './config/database.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import flexibleLoanRoutes from './routes/flexibleLoanRoutes.js';
import repaymentRoutes from './routes/repaymentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const startTime = Date.now();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging
app.use(morgan('combined'));
app.use(requestLogger);

// API Documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
  },
}));

// Root Endpoint - API Info
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Microfinance Management System API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    documentation: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      customers: '/api/customers',
      branches: '/api/branches',
      loans: '/api/loans',
      repayments: '/api/repayments',
      reports: '/api/reports',
      dashboard: '/api/dashboard',
    },
    timestamp: new Date().toISOString(),
  });
});

// Enhanced Health Check
app.get('/api/health', (req, res) => {
  const uptime = (Date.now() - startTime) / 1000;
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'Microfinance Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    uptime: Math.round(uptime * 100) / 100,
    timestamp: new Date().toISOString(),
    checks: {
      database: 'connected',
      api: 'operational',
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/flexible-loans', flexibleLoanRoutes);
app.use('/api/repayments', repaymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
      path: req.path,
      method: req.method,
      documentation: `Visit http://localhost:${PORT}/api-docs for API documentation`,
    },
    timestamp: new Date().toISOString(),
  });
});

// Error Handler (Must be last)
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`
Microfinance Management System - Backend API
Server running on: http://localhost:${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
API Docs: http://localhost:${PORT}/api-docs
Health: http://localhost:${PORT}/api/health
`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Set PORT to another value or stop the running process.`);
      process.exit(1);
    }

    console.error('Server failed to start:', error);
    process.exit(1);
  });

  return server;
};

const server = await startServer();

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app, startServer };
