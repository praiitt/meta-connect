import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, requireApproved, AuthRequest } from '../middleware/auth';
import { notifyAllRetailersNewProduct } from '../utils/notifications'; // Let's create a generic notification if needed or just use push

const router = Router();
const prisma = new PrismaClient();

// Get Current Metal Price (Public/Registered)
router.get('/current', authenticate, requireApproved, async (req, res) => {
  try {
    const currentPrice = await prisma.metalPrice.findFirst({
      orderBy: { effectiveDate: 'desc' },
    });
    
    if (!currentPrice) {
      return res.status(404).json({ message: 'No metal price configured' });
    }
    
    res.json(currentPrice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// Admin: Get Price History
router.get('/history', authenticate, requireAdmin, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 30;
    const history = await prisma.metalPrice.findMany({
      orderBy: { effectiveDate: 'desc' },
      take: limit,
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update Metal Price
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { pricePerKg, effectiveDate, notifyRetailers } = req.body;
    
    if (!pricePerKg) {
      return res.status(400).json({ message: 'pricePerKg is required' });
    }

    const newPrice = await prisma.metalPrice.create({
      data: {
        pricePerKg: parseFloat(pricePerKg),
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        createdBy: req.user?.id,
      },
    });

    if (notifyRetailers) {
      // You can implement notifyAllRetailersPriceChange later if needed
    }

    res.status(201).json(newPrice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

export default router;
