import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from workspace root if running inside backend/ or backend/dist/
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // also load local .env if it exists

import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';
import buildRoutes from './routes/builds';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/builds', buildRoutes);

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Metal Connect API is running', timestamp: new Date().toISOString() });
});

// Basic endpoint to check DB connection
app.get('/api/db-check', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', message: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Serve Admin Web Dashboard (Vite build output)
const webDistPath = path.join(__dirname, '../../web/dist');
app.use(express.static(webDistPath));

// Fallback for React Router (Single Page Application)
// Ensures any non-API routes serve the index.html file
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(webDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
