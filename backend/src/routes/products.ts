import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, requireApproved } from '../middleware/auth';
import { notifyAllRetailersNewProduct } from '../utils/notifications';

const router = Router();
const prisma = new PrismaClient();

// Helper to attach calculated dynamic price if needed
async function applyDynamicPricing(product: any) {
  if (product.useMetalPrice && product.weightKg) {
    const currentPrice = await prisma.metalPrice.findFirst({
      orderBy: { effectiveDate: 'desc' },
    });
    if (currentPrice) {
      const baseMetalCost = currentPrice.pricePerKg * product.weightKg;
      const markup = product.markupAmount || 0;
      product.calculatedPrice = baseMetalCost + markup;
      product.currentMetalPrice = currentPrice.pricePerKg;
      product.price = product.calculatedPrice; // Override the static price
    }
  }
  return product;
}

// Get all products (Public/Registered)
router.get('/', authenticate, requireApproved, async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = categoryId ? { categoryId: String(categoryId) } : {};
    
    const products = await prisma.product.findMany({
      where: filter,
      include: {
        category: true
      }
    });
    
    // Apply dynamic pricing
    const productsWithPricing = await Promise.all(
      products.map(applyDynamicPricing)
    );
    
    res.json(productsWithPricing);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// Get single product
router.get('/:id', authenticate, requireApproved, async (req, res) => {
  try {
    let product = await prisma.product.findUnique({ 
      where: { id: req.params.id },
      include: { category: true }
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    product = await applyDynamicPricing(product);
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Create product
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { 
      name, description, price, pricePerKg, isPricePerKg, 
      moq, sku, inStock, imageUrl, weightKg, categoryId, notifyRetailers,
      useMetalPrice, markupAmount
    } = req.body;
    
    const product = await prisma.product.create({
      data: { 
        name, description, price: price || 0, pricePerKg, isPricePerKg, 
        moq, sku, inStock, imageUrl, weightKg, categoryId,
        useMetalPrice: useMetalPrice || false,
        markupAmount: markupAmount || null
      },
    });

    if (notifyRetailers) {
      await notifyAllRetailersNewProduct(product.name);
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// Admin: Update product
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.price === undefined && data.useMetalPrice) {
      // Don't overwrite existing price if only toggling modes
    }
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
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
