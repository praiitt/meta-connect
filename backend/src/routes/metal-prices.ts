import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, requireApproved, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get All Current Metal Prices
router.get('/current', authenticate, requireApproved, async (req, res) => {
  try {
    // Get the most recent price for each metal type
    const metalTypes = ["STEEL", "ALUMINIUM", "BRASS", "COPPER", "BRONZE", "IRON"];
    const currentPrices = [];

    for (const type of metalTypes) {
      const price = await prisma.metalPrice.findFirst({
        where: { metalType: type },
        orderBy: { effectiveDate: 'desc' },
      });
      if (price) currentPrices.push(price);
    }
    
    res.json(currentPrices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// Get Current Price for Specific Metal Type
router.get('/current/:metalType', authenticate, requireApproved, async (req, res) => {
  try {
    const { metalType } = req.params;
    const currentPrice = await prisma.metalPrice.findFirst({
      where: { metalType: metalType.toUpperCase() },
      orderBy: { effectiveDate: 'desc' },
    });
    
    if (!currentPrice) {
      return res.status(404).json({ message: `No price configured for ${metalType}` });
    }
    
    res.json(currentPrice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// Admin: Get All Price History (All Types)
router.get('/history-all', authenticate, requireAdmin, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const history = await prisma.metalPrice.findMany({
      orderBy: { effectiveDate: 'desc' },
      take: limit,
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get Price History for specific metal type
router.get('/history/:metalType', authenticate, requireAdmin, async (req, res) => {
  try {
    const { metalType } = req.params;
    const limit = Number(req.query.limit) || 30;
    const history = await prisma.metalPrice.findMany({
      where: { metalType: metalType.toUpperCase() },
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
    const { metalType, pricePerKg, effectiveDate, notifyRetailers } = req.body;
    
    if (!pricePerKg || !metalType) {
      return res.status(400).json({ message: 'metalType and pricePerKg are required' });
    }

    const newPrice = await prisma.metalPrice.create({
      data: {
        metalType: metalType.toUpperCase(),
        pricePerKg: parseFloat(pricePerKg),
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        createdBy: req.user?.id,
      },
    });

    res.status(201).json(newPrice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

export default router;
