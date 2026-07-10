# Phase 8: Pre-Deployment Preparation & Integration Testing

## 🎯 Objective
Consolidate all completed features (Phases 1-7), conduct thorough integration testing across mobile, web, and backend, and prepare the environment for stable production deployment in Phase 9.

---

## 📋 Overview

### **Business Value:**
- Ensure all features work correctly together
- Catch and fix integration issues before production
- Validate production environment configuration
- Reduce deployment risks and downtime
- Ensure data integrity and security

### **Estimated Time:** 4-6 hours

---

## 🔧 Part 1: Environment Configuration Review

### **1.1 Backend Environment Variables**
**File:** `backend/.env`

**Required Variables:**
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Server
PORT=5000
NODE_ENV=production

# CORS (if needed)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Action Items:**
- ✅ Verify DATABASE_URL is production-ready (not local postgres)
- ✅ Ensure JWT_SECRET is strong (min 32 characters, random)
- ✅ Set NODE_ENV=production for production deployment
- ✅ Configure CORS for production domain

---

### **1.2 Admin Dashboard Environment Variables**
**File:** `web/.env`

**Required Variables:**
```env
# API Base URL (for development)
VITE_API_URL=http://localhost:5000/api

# For production builds, this should be relative:
# (Handled automatically in web/src/api/client.ts)
```

**Action Items:**
- ✅ Verify `web/src/api/client.ts` correctly uses relative path `/api` in production
- ✅ Test admin dashboard build with `npm run build`
- ✅ Verify production bundle size is reasonable

---

### **1.3 Mobile App Environment Variables**
**File:** `app/.env` or inline in code

**Current Configuration:**
- API URL is hardcoded in `api/client.ts`
- Currently points to: `https://metal-connect.dev.rraasi.com/api`

**Action Items:**
- ✅ Verify mobile app API URL points to correct backend
- ✅ For production, update to production backend URL
- ✅ Ensure push notifications are configured (Expo project ID)

---

## 🧪 Part 2: Integration Testing Checklist

### **2.1 Backend API Testing**

**Test all critical endpoints:**

#### **Authentication Routes:**
- [ ] `POST /api/auth/admin-login` — Admin login with email/password
- [ ] `POST /api/auth/retailer-login` — Retailer login with phone/loginCode
- [ ] Verify JWT tokens are issued correctly
- [ ] Test invalid credentials return 401

#### **User Management Routes:**
- [ ] `GET /api/users` — List all users (admin only)
- [ ] `GET /api/users/with-stats` — Users with order counts and revenue
- [ ] `POST /api/users/invite` — Invite new retailer
- [ ] `PATCH /api/users/:id/status` — Approve/Reject retailers
- [ ] `POST /api/users/register-push-token` — Register push notification token

#### **Product Routes:**
- [ ] `GET /api/products` — List all products
- [ ] `GET /api/products?categoryId=xxx` — Filter by category
- [ ] `POST /api/products` — Create product (admin only)
- [ ] `PATCH /api/products/:id` — Update product
- [ ] `DELETE /api/products/:id` — Delete product
- [ ] Verify `notifyRetailers` flag triggers push notifications

#### **Category Routes:**
- [ ] `GET /api/categories` — List all categories with product counts
- [ ] `GET /api/categories/:id` — Get single category
- [ ] `POST /api/categories` — Create category (admin only)
- [ ] `PATCH /api/categories/:id` — Update category
- [ ] `DELETE /api/categories/:id` — Delete (should fail if products exist)

#### **Order Routes:**
- [ ] `GET /api/orders` — List all orders (admin)
- [ ] `GET /api/orders/my-orders` — List user's orders (retailer)
- [ ] `POST /api/orders` — Create order
- [ ] `PATCH /api/orders/:id/status` — Update order status
- [ ] Verify `notifyUser` flag triggers push notifications

#### **Upload Routes:**
- [ ] `POST /api/upload/product-image` — Upload product image
- [ ] Verify file validation (type, size)
- [ ] Test static file serving from `/uploads/products/`
- [ ] `DELETE /api/upload/product-image` — Delete image

#### **Analytics Routes:**
- [ ] `GET /api/analytics/overview` — Dashboard KPIs
- [ ] `GET /api/analytics/revenue-trend?days=30` — Revenue chart data
- [ ] `GET /api/analytics/top-products` — Best-selling products

---

### **2.2 Admin Dashboard Testing**

**Test all pages and features:**

#### **Login Page:**
- [ ] Admin can log in with email/password
- [ ] Invalid credentials show error
- [ ] Successful login redirects to dashboard

#### **Dashboard Page:**
- [ ] KPI cards display correct metrics (Revenue, Orders, Customers, Pending Approvals)
- [ ] Revenue trend chart loads and displays data
- [ ] Order status distribution pie chart works
- [ ] Top products table shows correct data
- [ ] All links work (e.g., click "View Orders" navigates to Orders page)

#### **Users Page:**
- [ ] User list loads with all retailers
- [ ] Invite modal works (create new retailer)
- [ ] Approve/Reject buttons work
- [ ] Status badges display correctly (PENDING, APPROVED, REJECTED)
- [ ] CSV Export button generates correct file

#### **Categories Page:**
- [ ] Category cards display with product counts
- [ ] Create Category modal works
- [ ] Edit Category modal works
- [ ] Delete Category works (prevents if products exist)
- [ ] Empty state displays when no categories

#### **Products Page:**
- [ ] Product list loads correctly
- [ ] Search input filters products by name/SKU
- [ ] Stock status dropdown filters (All/In Stock/Out of Stock)
- [ ] Category column displays correctly
- [ ] Add Product modal works:
  - [ ] File upload for image works
  - [ ] Category dropdown populates
  - [ ] "Notify Retailers" checkbox works
- [ ] Edit Product modal works
- [ ] Delete Product confirmation works
- [ ] Image preview displays correctly

#### **Orders Page:**
- [ ] Order list loads with customer details
- [ ] Order items expand/collapse works
- [ ] Status dropdown updates order status
- [ ] Notification confirmation dialog appears
- [ ] CSV Export button generates correct file

---

### **2.3 Mobile App Testing**

**Test all screens and features:**

#### **Authentication:**
- [ ] Retailer can log in with phone + loginCode
- [ ] Invalid credentials show error
- [ ] Pending approval screen shows for PENDING users
- [ ] Approved users can access app
- [ ] Push notification token registers on login

#### **Catalog Screen:**
- [ ] Products load correctly
- [ ] Search bar filters by name/SKU
- [ ] "In Stock Only" toggle works
- [ ] Category filter chips work (ALL + individual categories)
- [ ] Product images display correctly
- [ ] MOQ display works
- [ ] "Add to Cart" button works
- [ ] Empty states display correctly

#### **Cart Screen:**
- [ ] Cart items display with quantities
- [ ] Increase/Decrease quantity works
- [ ] Remove item works
- [ ] Total price calculates correctly
- [ ] MOQ validation works
- [ ] "Proceed to Checkout" works

#### **Checkout Screen:**
- [ ] Order summary displays correctly
- [ ] "Place Order" creates order successfully
- [ ] Success message appears
- [ ] Cart clears after order placement
- [ ] Navigation to Orders screen works

#### **Orders Screen:**
- [ ] Order history loads correctly
- [ ] Status filter chips work (ALL, PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- [ ] Order items expand/collapse works
- [ ] Pull-to-refresh works
- [ ] Result count updates dynamically
- [ ] Empty states display correctly

#### **Push Notifications:**
- [ ] Permission request appears on first login
- [ ] Token registers with backend
- [ ] Receive notification when order status changes
- [ ] Receive notification when new product is added (if enabled by admin)

---

## 📦 Part 3: Build & Bundle Validation

### **3.1 Backend Build**
**Commands:**
```bash
cd backend
npm install
npm run build
```

**Verify:**
- [ ] `dist/` folder is created
- [ ] No TypeScript errors
- [ ] Prisma client is generated
- [ ] `node dist/index.js` starts server successfully

---

### **3.2 Admin Dashboard Build**
**Commands:**
```bash
cd web
npm install
npm run build
```

**Verify:**
- [ ] `dist/` folder is created
- [ ] No build errors or warnings
- [ ] Bundle size is reasonable (< 5MB)
- [ ] Test serving build locally:
  ```bash
  npx serve dist -p 3000
  ```
- [ ] Navigate to `http://localhost:3000` and test

---

### **3.3 Mobile App Build (Test APK)**
**Commands:**
```bash
# Test Expo prebuild
npx expo prebuild --platform android --clean

# Verify android/ folder is created
# (Full build will be done via Codemagic in Phase 9)
```

**Verify:**
- [ ] No prebuild errors
- [ ] `android/` folder is created
- [ ] `app.json` plugins are correct
- [ ] Native modules are linked correctly

---

## 🗄️ Part 4: Database Migration Preparation

### **4.1 Review Prisma Schema**
**File:** `backend/prisma/schema.prisma`

**Verify:**
- [ ] All models are correctly defined (User, Category, Product, Order, OrderItem)
- [ ] Relationships are correct
- [ ] Indexes are optimized (if needed for performance)
- [ ] No breaking changes since last migration

---

### **4.2 Test Migrations**
**Commands:**
```bash
cd backend

# Generate Prisma client
npx prisma generate

# Test migration (dry run)
npx prisma migrate dev --name final_pre_deployment_check

# Or push schema directly (for prototyping)
npx prisma db push
```

**Verify:**
- [ ] No migration errors
- [ ] Database schema is in sync with Prisma schema

---

### **4.3 Test Seed Data**
**Commands:**
```bash
cd backend

# Run category seed
npx ts-node prisma/seed-categories.ts

# Or run main seed file if you have one
npm run seed
```

**Verify:**
- [ ] Categories are seeded correctly
- [ ] No duplicate errors
- [ ] Sample data is appropriate for production

---

## 🐛 Part 5: Bug Fixes & Code Quality

### **5.1 Code Review Checklist**
- [ ] Remove all `console.log()` statements (or replace with proper logging)
- [ ] Remove unused imports and variables
- [ ] Ensure all error handling is robust
- [ ] Verify all API responses follow consistent format
- [ ] Check for hardcoded credentials or secrets
- [ ] Ensure CORS is properly configured
- [ ] Verify all authentication checks are in place

---

### **5.2 Known Issues (if any)**
**Document any known issues or limitations:**

1. **Issue:** [Describe issue]
   - **Impact:** [Low/Medium/High]
   - **Fix Plan:** [Describe fix or workaround]

---

## 📝 Part 6: Documentation Updates

### **6.1 Update PROJECT_STATUS.md**
- [ ] Mark Phase 7 as complete
- [ ] Add Phase 8 details
- [ ] Update project statistics
- [ ] Add deployment readiness checklist

---

### **6.2 Create Deployment Checklist**
**File:** `DEPLOYMENT_CHECKLIST.md`

**Contents:**
- Pre-deployment verification steps
- Database migration steps
- Environment variable configuration
- Server setup instructions
- Post-deployment verification steps
- Rollback plan

---

### **6.3 Update README.md (if needed)**
- [ ] Add production setup instructions
- [ ] Document environment variables
- [ ] Add troubleshooting section

---

## 🎯 Success Criteria

**Phase 8 is complete when:**
- ✅ All environment variables are reviewed and documented
- ✅ All backend API endpoints are tested and working
- ✅ Admin dashboard is tested end-to-end and builds successfully
- ✅ Mobile app is tested end-to-end on emulator/device
- ✅ Push notifications work on real devices
- ✅ Database migrations are tested and documented
- ✅ All known bugs are fixed or documented
- ✅ Deployment checklist is created
- ✅ PROJECT_STATUS.md is updated

---

## 🚀 Next Steps (Phase 9)

After Phase 8 is complete, proceed to **Phase 9: Production Deployment**:
1. Deploy backend to production VM
2. Deploy admin dashboard to production
3. Build and distribute mobile APK/AAB
4. Submit to Google Play Store

---

**Ready to begin Phase 8 implementation?**
