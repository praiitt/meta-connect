# Metal Connect — Next Phase Development Plan

## Current Implementation Status ✅

### Completed Features:
1. **Backend API** (Node.js + Express + Prisma)
   - ✅ Authentication (Admin email/password, Retailer phone/loginCode)
   - ✅ User management routes (GET, POST /invite, PATCH status)
   - ✅ Product management routes (CRUD operations)
   - ✅ Order management routes (Create, List, Update status)
   - ✅ Authorization middleware (Admin & Approved user roles)

2. **Admin Web Dashboard** (React + Vite + TypeScript + Tailwind)
   - ✅ Login page with authentication
   - ✅ Protected routes & layout with sidebar
   - ✅ User Management (List, Invite retailers, Approve/Reject)
   - ✅ Product Management (CRUD with kg-wise pricing support)
   - ✅ Order Management (List orders, Update fulfillment status)
   - ✅ Build History page (for mobile builds)

3. **Mobile App** (Expo + React Native)
   - ✅ Phone + Login Code authentication
   - ✅ Pending approval screen
   - ✅ Product catalog with MOQ display
   - ✅ Cart management (Zustand store)
   - ✅ Checkout flow (Order placement)

---

## Next Phase: Enhanced Features & Production Readiness

### Phase 1: Order History & Tracking (Mobile App)
**Priority: HIGH** — Retailers need to see their order history and track fulfillment status.

#### Tasks:
1. **Backend**: Verify `GET /api/orders/my-orders` returns complete data with product details
2. **Mobile App**:
   - Create `app/(tabs)/orders.tsx` screen
   - Display user's order history with:
     - Order ID
     - Total amount
     - Order date
     - Status badges (PENDING, CONFIRMED, SHIPPED, DELIVERED)
     - Expandable order items list
   - Add pull-to-refresh functionality
   - Add filter by status (All, Pending, Confirmed, etc.)

**Estimated Time**: 2-3 hours

---

### Phase 2: Product Search & Filtering (Mobile + Web)
**Priority: MEDIUM** — As the catalog grows, users need better discovery.

#### Tasks:
1. **Mobile App (Catalog Screen)**:
   - Add search bar at the top
   - Implement real-time client-side filtering by product name/SKU
   - Add category filter chips (optional if categories are added to schema)
   - Add "In Stock Only" toggle

2. **Admin Web Dashboard (Products Page)**:
   - Add search input above the products table
   - Add filter by stock status (All, In Stock, Out of Stock)

**Estimated Time**: 2-3 hours

---

### Phase 3: Image Upload for Products
**Priority: MEDIUM** — Currently images are URL-based; enable direct uploads.

#### Tasks:
1. **Backend**:
   - Install `multer` for file uploads
   - Create `/api/upload` route that:
     - Accepts image files
     - Stores them in `backend/uploads/` (or cloud storage like S3/Cloudinary)
     - Returns the public URL
   
2. **Admin Web Dashboard**:
   - Replace `imageUrl` text input with a file upload button
   - Show image preview before saving
   - Display uploaded image in the products table

3. **Mobile App**:
   - Display product images from uploaded URLs

**Estimated Time**: 3-4 hours

---

### Phase 4: Notifications (Push Notifications)
**Priority: HIGH** — Critical for real-time business updates.

#### Use Cases:
- Admin notifies retailer when order status changes (Confirmed → Shipped → Delivered)
- Admin notifies all retailers when new products are added
- Retailer gets notified when their account is approved

#### Tasks:
1. **Backend**:
   - Install `expo-server-sdk` (for Expo push notifications)
   - Add `pushToken` field to User model in Prisma schema
   - Create `POST /api/users/register-push-token` route
   - Create notification utility functions:
     - `sendOrderStatusNotification(userId, orderId, newStatus)`
     - `sendNewProductNotification(allApprovedUsers, productName)`
     - `sendAccountApprovedNotification(userId)`

2. **Mobile App**:
   - Request notification permissions on login
   - Register Expo push token with backend
   - Handle incoming notifications with `expo-notifications`

3. **Admin Dashboard**:
   - Add "Send Notification" button on order status update
   - Add "Notify All Retailers" button on new product creation

**Estimated Time**: 4-5 hours

---

### Phase 5: Enhanced Dashboard Analytics
**Priority: MEDIUM** — Admin needs business insights.

#### Tasks:
1. **Backend**:
   - Create `GET /api/analytics/overview` route:
     - Total retailers (approved/pending/rejected)
     - Total products (in stock vs out of stock)
     - Total orders this month
     - Revenue this month
     - Top 5 best-selling products

2. **Admin Web Dashboard**:
   - Enhance `Dashboard.tsx` with:
     - KPI cards (metrics from above)
     - Simple bar chart for orders over time (last 7 days)
     - Revenue trend (optional: use Chart.js or Recharts)

**Estimated Time**: 3-4 hours

---

### Phase 6: Export Orders to CSV/Excel
**Priority: LOW** — Useful for admin reporting.

#### Tasks:
1. **Admin Web Dashboard**:
   - Add "Export to CSV" button on Orders page
   - Generate CSV client-side using `papaparse` library
   - Include columns: Order ID, Customer Name, Company, Total, Status, Date

**Estimated Time**: 1-2 hours

---

### Phase 7: Product Categories & Better Organization
**Priority: MEDIUM** — Organize products into categories (e.g., Utensils, Cookware, Serving Items).

#### Tasks:
1. **Backend**:
   - Add `Category` model to Prisma schema
   - Add `categoryId` foreign key to Product model
   - Create CRUD routes for categories (`/api/categories`)

2. **Admin Dashboard**:
   - Create Categories management page
   - Add category dropdown in Product form

3. **Mobile App**:
   - Add category tabs/filters in Catalog screen

**Estimated Time**: 4-5 hours

---

### Phase 8: Retailer Profile Management (Mobile)
**Priority: LOW** — Let retailers view/edit their profile.

#### Tasks:
1. **Backend**:
   - Create `PATCH /api/users/me` route (authenticated user can update their own profile)

2. **Mobile App**:
   - Create `app/(tabs)/profile.tsx` screen
   - Display user info (name, company, GST, phone)
   - Allow editing name, company, GST (phone should be immutable)
   - Add logout button

**Estimated Time**: 2-3 hours

---

### Phase 9: Testing & Deployment
**Priority: HIGH** — Ensure production stability.

#### Tasks:
1. **Backend**:
   - Write basic unit tests for critical routes (auth, orders)
   - Set up environment variables for production (DATABASE_URL, JWT_SECRET)
   - Deploy backend to production server

2. **Admin Dashboard**:
   - Build production bundle (`npm run build`)
   - Test on staging/production URL
   - Verify all API endpoints work with production backend

3. **Mobile App**:
   - Update `API_URL` in `.env` to production backend
   - Trigger AAB (Android App Bundle) build for Play Store
   - Submit to Google Play Console

**Estimated Time**: 4-6 hours

---

## Recommended Execution Order

### Sprint 1 (Week 1): Core User Experience
1. ✅ Order History & Tracking (Mobile)
2. ✅ Product Search & Filtering
3. ✅ Retailer Profile Management

### Sprint 2 (Week 2): Business Operations
4. ✅ Push Notifications
5. ✅ Image Upload for Products
6. ✅ Dashboard Analytics

### Sprint 3 (Week 3): Polish & Launch
7. ✅ Product Categories
8. ✅ Export Orders to CSV
9. ✅ Testing & Production Deployment

---

## Which Phase Should We Start With?

I recommend starting with **Phase 1: Order History & Tracking (Mobile App)** because:
- It's a critical missing feature for retailers
- It's high-impact and relatively straightforward
- It doesn't require database schema changes
- It sets the foundation for push notifications later

**Would you like me to proceed with Phase 1, or would you prefer to start with a different phase?**
