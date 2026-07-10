import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-for-dev';
const token = jwt.sign({ id: 'admin-id', role: 'ADMIN', status: 'APPROVED' }, JWT_SECRET);

async function run() {
  try {
    const res = await axios.get('http://localhost:5000/api/metal-price/current', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Success! Current Price:', res.data);
  } catch (e: any) {
    console.error('Request failed:', e.message);
    if (e.response) {
      console.error('Response Data:', e.response.data);
    }
  }
}
run();
