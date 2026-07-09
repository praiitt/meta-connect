import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/analytics/overview
router.get('/overview', authenticate, requireAdmin, async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    const allOrders = await prisma.order.findMany({ select: { status: true, totalAmount: true } });
    
    let totalRevenue = 0;
    const revenueByStatus = { PENDING: 0, CONFIRMED: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
    const statusCounts = { PENDING: 0, CONFIRMED: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };

    for (const order of allOrders) {
      if (order.status !== 'CANCELLED') {
        totalRevenue += order.totalAmount;
      }
      revenueByStatus[order.status] = (revenueByStatus[order.status] || 0) + order.totalAmount;
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    }

    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const pendingCustomers = await prisma.user.count({ where: { role: 'CUSTOMER', status: 'PENDING' } });

    res.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      pendingCustomers,
      statusCounts,
      revenueByStatus,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// GET /api/analytics/revenue-trend
router.get('/revenue-trend', authenticate, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' }
      },
      select: { totalAmount: true, createdAt: true }
    });

    const trend = Array.from({ length: days }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return {
        date: d.toISOString().split('T')[0],
        revenue: 0
      };
    });

    orders.forEach(o => {
      const dateStr = o.createdAt.toISOString().split('T')[0];
      const dayData = trend.find(t => t.date === dateStr);
      if (dayData) {
        dayData.revenue += o.totalAmount;
      }
    });

    res.json(trend);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// GET /api/analytics/top-products
router.get('/top-products', authenticate, requireAdmin, async (req, res) => {
  try {
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    const populated = await Promise.all(
      topProducts.map(async (p) => {
        const product = await prisma.product.findUnique({ where: { id: p.productId } });
        return {
          id: product?.id,
          name: product?.name,
          quantity: p._sum.quantity,
          revenue: (p._sum.quantity || 0) * (product?.price || 0)
        };
      })
    );

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

export default router;
