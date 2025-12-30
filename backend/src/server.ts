import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { errorHandler } from './middlewares/errorHandler';

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

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  // TODO: Add socket event handlers for real-time features
  // - Order status updates
  // - New order notifications
  // - Bill split notifications
});

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
