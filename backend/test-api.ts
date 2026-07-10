import express from 'express';
import request from 'supertest';
import authRoutes from './src/routes/auth';
import metalPriceRoutes from './src/routes/metal-prices';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/api/metal-price', metalPriceRoutes);

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-for-dev';

async function test() {
  const token = jwt.sign({ id: 'admin1', role: 'ADMIN', status: 'APPROVED' }, JWT_SECRET);
  console.log('Testing /current');
  const res1 = await request(app)
    .get('/api/metal-price/current')
    .set('Authorization', `Bearer ${token}`);
  console.log('current status:', res1.status, res1.body);

  console.log('Testing /history');
  const res2 = await request(app)
    .get('/api/metal-price/history')
    .set('Authorization', `Bearer ${token}`);
  console.log('history status:', res2.status, res2.body);
}
test();
