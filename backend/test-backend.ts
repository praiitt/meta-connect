import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-for-dev';
const token = jwt.sign({ id: 'admin-id', role: 'ADMIN', status: 'APPROVED' }, JWT_SECRET);

async function run() {
  try {
    const res = await axios.get('http://localhost:5000/api/metal-price/current', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Current:', res.data);
  } catch (e: any) {
    console.error('Error fetching current:', e.response?.status, e.response?.data);
  }
}
run();
