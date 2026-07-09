import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Admin: Get all users
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        phone: true,
        company: true,
        gst: true,
        loginCode: true, // Only admins should see this to share with retailers
        createdAt: true,
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all users with order statistics (for CSV export)
router.get('/with-stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        phone: true,
        company: true,
        gst: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        },
        orders: {
          where: { status: { not: 'CANCELLED' } },
          select: { totalAmount: true }
        }
      }
    });

    const usersWithStats = users.map(user => {
      const totalRevenue = user.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        phone: user.phone,
        company: user.company,
        gst: user.gst,
        createdAt: user.createdAt,
        _count: user._count,
        totalRevenue
      };
    });

    res.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users with stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Invite a new retailer
router.post('/invite', authenticate, requireAdmin, async (req, res) => {
  const { name, phone, company, gst } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: 'Name and phone are required.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this phone number already exists.' });
    }

    // Generate a random 6-digit code
    const loginCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        company,
        gst,
        loginCode,
        role: 'CUSTOMER',
        status: 'APPROVED', // Auto-approve since admin created them
      }
    });

    res.status(201).json({ message: 'Retailer invited successfully', user });
  } catch (error) {
    console.error('Invite Error:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// Admin: Update user status (approve/reject)
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body; // PENDING, APPROVED, REJECTED
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status },
      select: { id: true, email: true, status: true, phone: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User: Register Expo push token
router.post('/register-push-token', authenticate, async (req, res) => {
  const { pushToken } = req.body;
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { pushToken }
    });
    res.json({ message: 'Push token registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;