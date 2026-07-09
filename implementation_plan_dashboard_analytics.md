# Implementation Plan: Dashboard Analytics (Option 1)

## 📊 Overview
Add comprehensive business analytics to the admin dashboard with key metrics, charts, and insights for data-driven decision making.

---

## 🎯 Key Metrics to Display

### 1. **Revenue Analytics**
- Total revenue (all time)
- Revenue by order status (Pending, Confirmed, Shipped, Delivered)
- Revenue trend (last 7 days, 30 days)
- Average order value (AOV)

### 2. **Order Analytics**
- Total orders count
- Orders by status breakdown
- Order fulfillment rate
- Recent orders timeline

### 3. **Customer Analytics**
- Total retailers (approved)
- Pending approvals count
- Top customers by order value
- Customer acquisition trend

### 4. **Product Analytics**
- Total products count
- In-stock vs out-of-stock ratio
- Top selling products (by quantity & revenue)
- Low stock alerts (MOQ-based)

### 5. **Time-based Analytics**
- Daily/Weekly/Monthly revenue trends
- Order velocity (orders per day/week)
- Peak ordering times

---

## 🛠️ Implementation Steps

### **Part 1: Backend API Endpoints**

#### 1.1 Create Analytics Route (`backend/src/routes/analytics.ts`)
```typescript
GET /api/analytics/overview
  → Returns:
    - totalRevenue
    - totalOrders
    - totalCustomers
    - pendingOrders
    - revenueByStatus
    - ordersToday
    - ordersThisWeek
    - ordersThisMonth

GET /api/analytics/revenue-trend?days=30
  → Returns daily revenue data for charts

GET /api/analytics/top-products?limit=5
  → Returns top products by revenue & quantity

GET /api/analytics/top-customers?limit=5
  → Returns top customers by total order value

GET /api/analytics/order-status-distribution
  → Returns count of orders by each status
```

#### 1.2 Add Prisma Aggregation Queries
- Use `prisma.order.aggregate()` for revenue calculations
- Use `prisma.order.groupBy()` for status distribution
- Use raw SQL queries for complex time-based analytics

#### 1.3 Middleware
- Protect all analytics routes with `authenticate` + `requireAdmin`

---

### **Part 2: Frontend Dashboard UI**

#### 2.1 Install Charting Library
```bash
npm install recharts --save
```
- Recharts is React-friendly, lightweight, and composable

#### 2.2 Create Analytics Components

**File: `web/src/components/MetricCard.tsx`**
- Reusable card component for displaying single metrics
- Props: title, value, icon, trend (optional), color

**File: `web/src/components/RevenueChart.tsx`**
- Line/Area chart showing revenue over time
- Uses Recharts `<AreaChart>` or `<LineChart>`

**File: `web/src/components/OrderStatusChart.tsx`**
- Pie or Doughnut chart showing order distribution
- Uses Recharts `<PieChart>`

**File: `web/src/components/TopProductsTable.tsx`**
- Table listing top 5 products by revenue
- Columns: Product Name, Units Sold, Revenue

**File: `web/src/components/TopCustomersTable.tsx`**
- Table listing top 5 customers by order value
- Columns: Customer Name, Total Orders, Total Spent

#### 2.3 Update Dashboard Page (`web/src/pages/Dashboard.tsx`)

**Layout Structure:**
```
┌─────────────────────────────────────────────────┐
│  Revenue Analytics Section                      │
│  [Total Revenue] [Avg Order] [Orders Today]     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Revenue Trend Chart (Last 30 Days)             │
│  [Line Chart]                                    │
└─────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────┐
│ Order Status Dist.   │  Top Products            │
│ [Pie Chart]          │  [Table]                 │
└──────────────────────┴──────────────────────────┘

┌──────────────────────┬──────────────────────────┐
│ Top Customers        │  Quick Stats             │
│ [Table]              │  [Metric Cards]          │
└──────────────────────┴──────────────────────────┘
```

**Features:**
- Skeleton loaders while data fetches
- Error handling with retry button
- Refresh button to reload analytics
- Date range selector (7d, 30d, 90d)

---

### **Part 3: API Integration**

#### 3.1 Create Analytics API Client (`web/src/api/analytics.ts`)
```typescript
export const fetchOverview = () => apiClient.get('/analytics/overview');
export const fetchRevenueTrend = (days: number) => apiClient.get(`/analytics/revenue-trend?days=${days}`);
export const fetchTopProducts = () => apiClient.get('/analytics/top-products');
export const fetchTopCustomers = () => apiClient.get('/analytics/top-customers');
```

#### 3.2 State Management
- Use React `useState` + `useEffect` for data fetching
- Option: Create custom hook `useAnalytics()` for reusability

---

## 📁 File Changes Summary

### **NEW Files:**
- `backend/src/routes/analytics.ts` — Analytics API endpoints
- `web/src/api/analytics.ts` — Frontend API client
- `web/src/components/MetricCard.tsx` — Reusable metric display
- `web/src/components/RevenueChart.tsx` — Revenue trend chart
- `web/src/components/OrderStatusChart.tsx` — Order distribution chart
- `web/src/components/TopProductsTable.tsx` — Top products table
- `web/src/components/TopCustomersTable.tsx` — Top customers table

### **MODIFIED Files:**
- `backend/src/index.ts` — Register analytics routes
- `web/src/pages/Dashboard.tsx` — Complete redesign with analytics
- `web/package.json` — Add `recharts` dependency

---

## 🎨 UI/UX Design Notes

### Color Scheme:
- **Revenue**: Green (#10b981)
- **Orders**: Blue (#3b82f6)
- **Customers**: Purple (#8b5cf6)
- **Products**: Orange (#f59e0b)

### Typography:
- Large numbers: `text-3xl font-bold`
- Metric labels: `text-sm text-gray-500`
- Trend indicators: `text-xs` with ↑/↓ arrows

### Responsiveness:
- Grid layout on desktop (2-3 columns)
- Stacked layout on mobile
- Charts auto-resize with container

---

## ⏱️ Estimated Time: **4-5 hours**

### Breakdown:
- Backend API (1.5 hours)
- Frontend Components (2 hours)
- Integration & Testing (1 hour)
- UI Polish (0.5 hours)

---

## 🧪 Testing Checklist

- [ ] Analytics API returns correct aggregated data
- [ ] Charts render properly with real data
- [ ] Empty state handling (no orders yet)
- [ ] Loading states display correctly
- [ ] Mobile responsive layout works
- [ ] Date range selector updates charts
- [ ] Refresh button reloads data
- [ ] Admin-only access enforced

---

## 🚀 Future Enhancements (Out of Scope)

- Export analytics to PDF/Excel
- Real-time dashboard updates (WebSockets)
- Predictive analytics (demand forecasting)
- Retailer-level analytics (self-service)
- Custom date range picker
- Drill-down capabilities (click chart → detailed view)

---

## ✅ Success Criteria

1. Admin can see total revenue, orders, and customer counts at a glance
2. Revenue trend chart displays last 30 days of data
3. Order status distribution visible in pie chart
4. Top 5 products and customers displayed
5. Dashboard loads in under 2 seconds
6. All metrics update when new orders are placed

---

**Ready to implement? Reply "Yes, proceed" to start building!**
