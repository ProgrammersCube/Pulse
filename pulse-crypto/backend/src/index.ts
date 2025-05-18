import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { Server as SocketServer } from 'socket.io';

// Import routes
import walletRoutes from './routes/wallet.routes';
import priceRoutes from './routes/price.routes';

// Import socket controller
import { setupSocketControllers } from './controllers/socket.controller';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new SocketServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://www.thepulse.bet' 
      : 'http://localhost:3002',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup socket controllers
setupSocketControllers(io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://www.thepulse.bet' 
    : 'http://localhost:3002',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/wallet', walletRoutes);
app.use('/api/price', priceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pulse';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

export { io };
