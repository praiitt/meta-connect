import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, requireApproved } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all products (Public/Registered)
router.get('/', authenticate, requireApproved, async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', authenticate, requireApproved, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Create product
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, moq, sku, inStock, imageUrl } = req.body;
    const product = await prisma.product.create({
      data: { name, description, price, moq, sku, inStock, imageUrl },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update product
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete product
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
