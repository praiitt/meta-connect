import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-for-dev';

// Disable public registration, return 403 or just keep for legacy? We will disable it.
router.post('/register', async (req, res) => {
  res.status(403).json({ message: 'Self-registration is disabled. Please contact your wholesaler for an invite.' });
});

// Login (Handles both Admin Email/Pass and Retailer Phone/Code)
router.post('/login', async (req, res) => {
  const { email, password, phone, loginCode } = req.body;

  try {
    let user;

    // Admin Flow: Email + Password
    if (email && password) {
      user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    } 
    // Retailer Flow: Phone + LoginCode
    else if (phone && loginCode) {
      user = await prisma.user.findUnique({ where: { phone } });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
      
      if (user.loginCode !== loginCode) return res.status(400).json({ message: 'Invalid credentials' });
    } 
    else {
      return res.status(400).json({ message: 'Please provide email/password or phone/loginCode' });
    }

    if (user.status !== 'APPROVED' && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Your account is pending approval or disabled.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, status: user.status }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status, phone: user.phone, company: user.company, gst: user.gst } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// Get Current User Profile
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { id: true, email: true, name: true, role: true, status: true, phone: true, company: true, gst: true, createdAt: true },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;