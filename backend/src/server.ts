import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { errorHandler } from './middlewares/errorHandler';
import { initializeSocket, TypedSocketServer } from './socket';

// Routes
import authRoutes from './modules/auth/auth.routes';
import restaurantsRoutes from './modules/restaurants/restaurants.routes';
import menuRoutes from './modules/menu/menu.routes';
import ordersRoutes from './modules/orders/orders.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import tablesRoutes from './modules/tables/tables.routes';
import reviewsRoutes from './modules/reviews/reviews.routes';
import adminRoutes from './modules/admin/admin.routes';
import kitchenRoutes from './modules/kitchen/kitchen.routes';
import waiterRoutes from './modules/waiter/waiter.routes';
import consultantRoutes from './modules/consultant/consultant.routes';
import customersRoutes from './modules/customers/customers.routes';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration - supports multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://app-restaurantes.vercel.app',
  process.env.CORS_ORIGIN,
].filter(Boolean) as string[];

// Dynamic CORS origin check for Vercel preview deployments
const corsOriginCheck = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  // Allow requests with no origin (mobile apps, curl, etc.)
  if (!origin) {
    callback(null, true);
    return;
  }

  // Check if origin is in allowed list
  if (allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  // Allow any Vercel preview deployment for this project
  if (origin.includes('vinicius-almeidas-projects') && origin.includes('vercel.app')) {
    callback(null, true);
    return;
  }

  // Block other origins
  callback(new Error('Not allowed by CORS'));
};

// Socket.IO setup with all handlers
const io: TypedSocketServer = initializeSocket(httpServer, corsOriginCheck);

// Middleware
app.use(cors({
  origin: corsOriginCheck,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: '🍽️ TabSync API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      restaurants: '/api/restaurants',
      menu: '/api/menu',
      orders: '/api/orders',
      payments: '/api/payments',
      inventory: '/api/inventory',
      tables: '/api/tables',
      reviews: '/api/reviews',
      suggestions: '/api/suggestions',
      complaints: '/api/complaints',
      nps: '/api/nps',
      admin: '/api/admin',
      kitchen: '/api/kitchen',
      waiter: '/api/waiter',
      consultant: '/api/consultant',
      customers: '/api/customers',
    },
  });
});

// Module routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantsRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api', reviewsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/waiter', waiterRoutes);
app.use('/api/consultant', consultantRoutes);
app.use('/api/customers', customersRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`
  🍽️  TabSync Backend API
  🚀 Server running on http://localhost:${PORT}
  📡 Socket.IO enabled for real-time updates
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app, io };
