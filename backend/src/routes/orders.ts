import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, requireApproved, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Place an order (Approved customers)
router.post('/', authenticate, requireApproved, async (req: AuthRequest, res) => {
  const { items } = req.body; 
  // items expected: [{ productId: '...', quantity: 100 }]
  
  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
      
      if (item.quantity < product.moq) {
        return res.status(400).json({ message: `Quantity for ${product.name} must be at least ${product.moq}` });
      }

      totalAmount += product.price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price, // snapshot
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        totalAmount,
        items: {
          create: orderItemsData,
        }
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's orders
router.get('/my-orders', authenticate, requireApproved, async (req: AuthRequest, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all orders
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update order status
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
