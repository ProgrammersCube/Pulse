// THIS MUST BE THE VERY FIRST LINE
import dotenv from 'dotenv';
dotenv.config();

// Validate JWT_SECRET
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("❌ JWT_SECRET must be defined in .env file and at least 32 characters long");
  process.exit(1);
}
if (process.env.NODE_ENV === 'production') {
  if (!process.env.SHARED_SECRET_For_PRIVATE_KEY || process.env.SHARED_SECRET_For_PRIVATE_KEY.length < 32) {
    console.error("❌ SHARED_SECRET_For_PRIVATE_KEY must be defined in .env file and at least 32 characters long (production)");
    process.exit(1);
  }
}
import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { seedAdmin,createSettings } from './scripts/seedAdmin';
// import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { Server as SocketServer } from 'socket.io';

// Import routes
import walletRoutes from './routes/wallet.routes';
import priceRoutes from './routes/price.routes';
import gameRoutes from './routes/game.routes';
import adminRoutes from './routes/admin.routes';

// Import socket controller
import { setupSocketControllers } from './controllers/socket.controller';

// Import Swagger
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Load environment variables
// dotenv.config();

// Initialize Express app
const app: Application = express();
const server = http.createServer(app);

// Setup Socket.io with proper CORS for production
const io = new SocketServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_PRODUCTION_URL 
      :"*",
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Setup socket controllers
setupSocketControllers(io);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_PRODUCTION_URL
    : ["http://localhost:3000", "http://localhost:5000", "http://localhost:7000"], // Allow common dev ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan('dev'));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Pulse API Documentation'
}));

// Routes
app.use('/api/wallet', walletRoutes);
app.use('/api/price', priceRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/admin', adminRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 environment:
 *                   type: string
 *                   example: development
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'okk', 
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API server information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pulse API Server
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 environment:
 *                   type: string
 *                   example: development
 */
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Pulse API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      
      // Display CORS configuration
      const allowedOrigin = process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_PRODUCTION_URL 
        : 'http://localhost:3000';
      console.log(`🔗 CORS/Socket.IO allowed origin: ${allowedOrigin}`);
      
      if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_PRODUCTION_URL) {
        console.warn('⚠️  WARNING: FRONTEND_PRODUCTION_URL not set in production mode!');
      }
      // seedAdmin()
      //createSettings()
    });
  })
  .catch(error => {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled rejection:', err);
  process.exit(1);
});

export { io };