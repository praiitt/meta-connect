# Metal Price Management — Implementation Plan

---

## 🎯 **Objective**
Allow admin to update the daily base metal price (per kg), which will be used to calculate product prices dynamically based on weight and markup.

---

## 📐 **Business Logic**

### **Price Calculation Formula:**
```
Final Product Price = (Metal Price per Kg × Product Weight in Kg) + Markup
```

**Example:**
- Metal Price: ₹500/kg (updated daily by admin)
- Product Weight: 2.5 kg
- Markup: ₹100
- **Final Price:** (500 × 2.5) + 100 = ₹1,350

---

## 🗄️ **Database Schema Changes**

### **New Model: `MetalPrice`**
```prisma
model MetalPrice {
  id          String   @id @default(uuid())
  pricePerKg  Float    // Base metal price per kg
  effectiveDate DateTime @default(now()) // Date this price is effective
  createdBy   String?  // Admin user ID who updated it
  createdAt   DateTime @default(now())
  
  @@map("metal_prices")
}
```

### **Update Product Model (Optional):**
```prisma
model Product {
  // ... existing fields
  weightKg       Float?   // Already exists
  markupAmount   Float?   // Fixed markup amount to add on top of metal cost
  useMetalPrice  Boolean  @default(false) // If true, calculate price dynamically
  
  // If useMetalPrice = false, use the fixed 'price' field
  // If useMetalPrice = true, calculate: (metalPrice × weightKg) + markupAmount
}
```

---

## 📡 **Backend API Changes**

### **New Routes: `/api/metal-price`**

#### **1. Get Current Metal Price**
```typescript
GET /api/metal-price/current
Response: { pricePerKg: 500, effectiveDate: "2024-07-10T08:00:00Z" }
```

#### **2. Update Metal Price (Admin Only)**
```typescript
POST /api/metal-price
Body: { pricePerKg: 520, notifyRetailers?: boolean }
Response: { id: "...", pricePerKg: 520, effectiveDate: "..." }
```

#### **3. Get Price History (Admin Only)**
```typescript
GET /api/metal-price/history?limit=30
Response: [
  { id: "...", pricePerKg: 520, effectiveDate: "2024-07-10" },
  { id: "...", pricePerKg: 500, effectiveDate: "2024-07-09" },
  ...
]
```

### **Update Product Routes:**

#### **Modify `GET /api/products`**
- For products with `useMetalPrice = true`:
  - Fetch current metal price
  - Calculate dynamic price: `(metalPrice × weightKg) + markupAmount`
  - Return calculated price in response

#### **Modify `POST/PATCH /api/products`**
- Accept new fields: `useMetalPrice`, `markupAmount`
- Validate: if `useMetalPrice = true`, require `weightKg` and `markupAmount`

---

## 🎨 **Admin Dashboard Changes**

### **New Page: Metal Price Management (`/metal-price`)**

**Features:**
- 📊 **Current Price Card**
  - Display current metal price per kg
  - Effective date
  - Large, prominent display

- ✏️ **Update Price Section**
  - Input field for new price
  - Date picker (default: today)
  - Checkbox: "Notify all retailers via push notification"
  - "Update Price" button

- 📈 **Price History Table**
  - Date | Price | Updated By | Actions
  - Last 30 days of price changes
  - Export to CSV option

**UI Mock:**
```
┌────────────────────────────────────────────┐
│  💰 Metal Price Management                 │
├────────────────────────────────────────────┤
│                                            │
│  Current Metal Price                       │
│  ┌──────────────────────┐                 │
│  │   ₹ 500 / kg         │                 │
│  │   Effective: Today    │                 │
│  └──────────────────────┘                 │
│                                            │
│  Update Price                              │
│  ┌────────────────────────────────────┐   │
│  │ New Price (₹/kg): [520________]    │   │
│  │ Effective Date:   [2024-07-10 ▼]  │   │
│  │ ☐ Notify all retailers             │   │
│  │ [Update Price]                     │   │
│  └────────────────────────────────────┘   │
│                                            │
│  Price History (Last 30 Days)              │
│  ┌────────────────────────────────────┐   │
│  │ Date       │ Price  │ Updated By   │   │
│  │ 2024-07-10 │ ₹520   │ Admin       │   │
│  │ 2024-07-09 │ ₹500   │ Admin       │   │
│  │ 2024-07-08 │ ₹495   │ Admin       │   │
│  └────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

### **Update Products Page:**

**Add "Price Mode" Toggle in Product Form:**
```
Price Configuration:
( ) Fixed Price        (●) Dynamic (Metal Price Based)

[If Dynamic selected:]
  Weight (kg): [2.5________]
  Markup (₹):  [100_______]
  
  Calculated Price: ₹1,350
  (Based on current metal price: ₹500/kg)
```

### **Update Navigation:**
Add "Metal Price" link in AdminLayout sidebar (after Dashboard, before Users)

---

## 📱 **Mobile App Changes**

### **Update Catalog Screen:**
- No changes needed — products will show final calculated price from API
- Prices update automatically when metal price changes

### **Optional: Price Change Notifications**
- When admin updates metal price with "Notify Retailers" enabled:
  - Send push notification: "Metal prices updated! Check new product prices."
  - Opens catalog screen when tapped

---

## 🔧 **Implementation Steps**

### **Step 1: Database Migration**
1. Create `MetalPrice` model
2. Add `markupAmount`, `useMetalPrice` fields to `Product`
3. Run migration: `npx prisma migrate dev --name add-metal-price`
4. Seed initial metal price (₹500/kg)

### **Step 2: Backend API**
1. Create `backend/src/routes/metal-price.ts`
2. Implement CRUD routes with admin auth
3. Update product routes to calculate dynamic prices
4. Add notification trigger when price updates

### **Step 3: Admin Dashboard**
1. Create `web/src/pages/MetalPrice.tsx`
2. Create `web/src/api/metalPrice.ts` client
3. Update Products form with price mode toggle
4. Add "Metal Price" to sidebar navigation

### **Step 4: Testing**
1. Test price updates and history
2. Verify product price calculations
3. Test push notifications
4. Test CSV export with calculated prices

---

## 🎯 **Success Criteria**

✅ Admin can view current metal price per kg  
✅ Admin can update metal price daily  
✅ System stores price history (last 30 days minimum)  
✅ Products with dynamic pricing calculate correctly  
✅ Fixed-price products remain unaffected  
✅ Retailers receive push notification on price updates (optional)  
✅ CSV exports include correct calculated prices  
✅ Mobile app displays updated prices immediately  

---

## 📝 **Files to Create/Modify**

### **Backend:**
- `backend/prisma/schema.prisma` — Add MetalPrice model, update Product
- `backend/prisma/migrations/` — New migration
- `backend/src/routes/metal-price.ts` — NEW
- `backend/src/routes/products.ts` — MODIFY (add price calculation logic)
- `backend/src/index.ts` — MODIFY (register metal-price routes)

### **Frontend:**
- `web/src/api/metalPrice.ts` — NEW
- `web/src/pages/MetalPrice.tsx` — NEW
- `web/src/pages/Products.tsx` — MODIFY (add price mode toggle)
- `web/src/layouts/AdminLayout.tsx` — MODIFY (add nav link)
- `web/src/App.tsx` — MODIFY (add route)

### **Mobile:**
- No direct changes needed (prices come from API)

---

## ⏱️ **Estimated Time**
**3-4 hours** for complete implementation and testing

---

## 🚀 **Ready to Implement?**

This feature will give you full control over metal price fluctuations and automatic product pricing! Should I proceed with the implementation?
