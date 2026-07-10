# Multiple Metal Types — Implementation Plan

---

## 🎯 **Objective**
Extend the Metal Price Management system to support multiple metal types (Steel, Aluminium, Brass, Copper, etc.) with individual pricing for each type.

---

## 📐 **Business Logic**

### **Current System:**
- Single global metal price (₹/kg)
- Products use: `(Metal Price × Weight) + Markup`

### **New System:**
- Multiple metal types, each with its own price
- Products link to a specific metal type
- Formula: `(Metal Type Price × Weight) + Markup`

**Example:**
- **Steel:** ₹450/kg
- **Aluminium:** ₹280/kg
- **Brass:** ₹520/kg
- **Copper:** ₹750/kg

**Product Examples:**
- Steel Plate (2 kg) → (450 × 2) + 100 = ₹1,000
- Brass Bowl (0.5 kg) → (520 × 0.5) + 50 = ₹310

---

## 🗄️ **Database Schema Changes**

### **Update `MetalPrice` Model:**
```prisma
model MetalPrice {
  id          String   @id @default(uuid())
  metalType   String   // "STEEL", "ALUMINIUM", "BRASS", "COPPER", "BRONZE", "IRON"
  pricePerKg  Float
  effectiveDate DateTime @default(now())
  createdBy   String?
  createdAt   DateTime @default(now())
  
  @@map("metal_prices")
  @@index([metalType, effectiveDate])
}
```

### **Update `Product` Model:**
```prisma
model Product {
  id           String   @id @default(uuid())
  name         String
  description  String?
  price        Float    @default(0)
  moq          Int      @default(1)
  sku          String?  @unique
  inStock      Boolean  @default(true)
  imageUrl     String?
  
  // Pricing configuration
  useMetalPrice Boolean  @default(false)
  metalType     String?  // "STEEL", "ALUMINIUM", "BRASS", etc.
  weightKg      Float?
  markupAmount  Float?
  
  categoryId   String?
  category     Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  orderItems   OrderItem[]
}
```

### **Metal Types Enum (in code):**
```typescript
export enum MetalType {
  STEEL = 'STEEL',
  ALUMINIUM = 'ALUMINIUM',
  BRASS = 'BRASS',
  COPPER = 'COPPER',
  BRONZE = 'BRONZE',
  IRON = 'IRON',
}
```

---

## 📡 **Backend API Changes**

### **Update `/api/metal-price` Routes:**

#### **1. Get All Current Metal Prices**
```typescript
GET /api/metal-price/current
Response: [
  { metalType: "STEEL", pricePerKg: 450, effectiveDate: "..." },
  { metalType: "ALUMINIUM", pricePerKg: 280, effectiveDate: "..." },
  { metalType: "BRASS", pricePerKg: 520, effectiveDate: "..." },
  { metalType: "COPPER", pricePerKg: 750, effectiveDate: "..." }
]
```

#### **2. Get Current Price for Specific Metal Type**
```typescript
GET /api/metal-price/current/:metalType
Response: { metalType: "STEEL", pricePerKg: 450, effectiveDate: "..." }
```

#### **3. Update Metal Price (Admin Only)**
```typescript
POST /api/metal-price
Body: { 
  metalType: "STEEL", 
  pricePerKg: 460, 
  effectiveDate?: "2024-07-10",
  notifyRetailers?: true 
}
Response: { id: "...", metalType: "STEEL", pricePerKg: 460, ... }
```

#### **4. Get Price History for Metal Type**
```typescript
GET /api/metal-price/history/:metalType?limit=30
Response: [
  { id: "...", metalType: "STEEL", pricePerKg: 460, effectiveDate: "2024-07-10" },
  { id: "...", metalType: "STEEL", pricePerKg: 450, effectiveDate: "2024-07-09" },
  ...
]
```

#### **5. Get All Price History (All Types)**
```typescript
GET /api/metal-price/history-all?limit=30
Response: [
  { metalType: "STEEL", pricePerKg: 460, effectiveDate: "2024-07-10" },
  { metalType: "BRASS", pricePerKg: 525, effectiveDate: "2024-07-10" },
  ...
]
```

---

## 🎨 **Admin Dashboard Changes**

### **Updated Page: Metal Price Management (`/metal-price`)**

**New UI Design:**

```
┌────────────────────────────────────────────────────────────────┐
│  💰 Metal Price Management                                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Current Metal Prices (₹/kg)                                   │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │   STEEL     │  ALUMINIUM  │    BRASS    │   COPPER    │   │
│  │   ₹450      │    ₹280     │    ₹520     │    ₹750     │   │
│  │   ↑ 2.3%    │   ↓ 1.5%    │   → 0%      │   ↑ 5.2%    │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┘   │
│                                                                │
│  ┌─────────────┬─────────────┐                                │
│  │   BRONZE    │    IRON     │                                │
│  │   ₹420      │    ₹380     │                                │
│  │   ↓ 0.5%    │   ↑ 1.8%    │                                │
│  └─────────────┴─────────────┘                                │
│                                                                │
│  Update Metal Price                                            │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ Metal Type:        [Steel ▼]                         │     │
│  │ Price per Kg (₹):  [460_____________]                │     │
│  │ Effective Date:    [2024-07-10 ▼]                   │     │
│  │ ☐ Notify retailers of price change                   │     │
│  │ [Update Price]                                       │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
│  Price History                                                 │
│  Filter by: [All Types ▼] | Last: [30 Days ▼] | [Export CSV] │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ Date       │ Metal Type │ Price  │ Change │ Updated By│    │
│  │ 2024-07-10 │ STEEL      │ ₹460   │ +2.3%  │ Admin    │    │
│  │ 2024-07-10 │ BRASS      │ ₹525   │ +1.0%  │ Admin    │    │
│  │ 2024-07-09 │ STEEL      │ ₹450   │ -1.1%  │ Admin    │    │
│  │ 2024-07-09 │ COPPER     │ ₹750   │ +5.2%  │ Admin    │    │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- 📊 **Grid of current prices** for all metal types (cards with color coding)
- 📈 **% change indicators** (green ↑, red ↓, gray →)
- 🎨 **Visual distinction** between metal types (icons/colors)
- ✏️ **Dropdown selector** to choose metal type to update
- 📋 **Unified price history table** with metal type column
- 🔍 **Filter history** by metal type or date range
- 📥 **Export CSV** with all metal types

---

### **Update Products Page:**

**Enhanced "Dynamic Pricing" Section:**

```
Price Configuration:
( ) Fixed Price        (●) Dynamic (Metal Price Based)

[If Dynamic selected:]
  Metal Type:   [Steel ▼]  (Aluminium, Brass, Copper, Bronze, Iron)
  Weight (kg):  [2.5_______]
  Markup (₹):   [100______]
  
  ─────────────────────────────────
  Current Steel Price: ₹450/kg
  Calculated Price: ₹1,225
  (450 × 2.5) + 100 = ₹1,225
  ─────────────────────────────────
```

**Display in Products List:**
```
Steel Plate
SKU: SP-001
💰 ₹1,225 (Dynamic: Steel 2.5kg + ₹100)
MOQ: 10
```

---

## 📱 **Mobile App Changes**

### **Update Catalog Screen (`catalog.tsx`):**

**Enhanced Metal Price Banner:**

```
┌─────────────────────────────────────────────────┐
│  📊 Today's Metal Prices (₹/kg)                 │
│  Steel: ₹450  │  Aluminium: ₹280  │  Brass: ₹520│
│  [View All >]                                   │
└─────────────────────────────────────────────────┘
```

**Product Cards:**
```
┌──────────────────────────┐
│  Steel Mixing Bowl       │
│  ₹1,225                  │
│  🔩 Steel • 2.5kg        │
│  MOQ: 10                 │
│  [Add to Cart]           │
└──────────────────────────┘
```

---

## 🔧 **Implementation Steps**

### **Phase 1: Database Migration** ⏱️ 30 min
1. Add `metalType` column to `MetalPrice` table
2. Add `metalType` column to `Product` table
3. Migrate existing single price to "STEEL" type (backward compatibility)
4. Seed initial prices for all metal types
5. Run migration: `npx prisma migrate dev --name add-metal-types`

### **Phase 2: Backend API** ⏱️ 1-2 hours
1. Update `metal-prices.ts` routes to handle metal types
2. Add metal type validation middleware
3. Update product pricing calculation logic
4. Add metal type filtering in history queries
5. Update notification system to mention specific metal type

### **Phase 3: Admin Dashboard** ⏱️ 2-3 hours
1. Update `MetalPrice.tsx` page:
   - Grid layout for current prices
   - Metal type dropdown in update form
   - Filter controls for history table
   - Color-coded price cards
2. Update `Products.tsx`:
   - Metal type dropdown in product form
   - Dynamic price preview with metal type
   - Display metal type badge in product list
3. Update API client types (`metalPrice.ts`)

### **Phase 4: Mobile App** ⏱️ 1 hour
1. Update `catalog.tsx`:
   - Fetch all metal prices
   - Display compact price banner
   - Show metal type in product cards
2. Update product type interfaces

### **Phase 5: Testing** ⏱️ 1 hour
1. Test multi-metal price updates
2. Verify product price calculations for each metal type
3. Test CSV export with multiple metal types
4. Test mobile app banner and product display
5. Test push notifications

---

## 🎯 **Success Criteria**

✅ Admin can set individual prices for 6 metal types  
✅ Each metal type has independent price history  
✅ Products can be linked to specific metal types  
✅ Dynamic pricing calculates correctly per metal type  
✅ Mobile app displays all metal prices in banner  
✅ Product cards show metal type badge  
✅ CSV export includes metal type column  
✅ Price change notifications mention specific metal type  
✅ Backward compatibility: existing single-price products still work  

---

## 📝 **Files to Create/Modify**

### **Backend:**
- `backend/prisma/schema.prisma` — Add metalType to MetalPrice and Product
- `backend/prisma/migrations/` — New migration
- `backend/prisma/seed-metal-types.ts` — NEW (seed all 6 metal types)
- `backend/src/routes/metal-prices.ts` — MODIFY (add metal type handling)
- `backend/src/routes/products.ts` — MODIFY (update price calculation)
- `backend/src/types/metal.ts` — NEW (MetalType enum)

### **Frontend:**
- `web/src/api/metalPrice.ts` — MODIFY (add metal type params)
- `web/src/pages/MetalPrice.tsx` — MAJOR UPDATE (grid layout, filters)
- `web/src/pages/Products.tsx` — MODIFY (add metal type dropdown)
- `web/src/types/metal.ts` — NEW (shared types)
- `web/src/components/MetalPriceCard.tsx` — NEW (reusable price card)

### **Mobile:**
- `app/(tabs)/catalog.tsx` — MODIFY (multi-metal price banner)
- `app/types/metal.ts` — NEW (shared types)

---

## ⏱️ **Estimated Time**
**6-8 hours** for complete implementation and testing

---

## 🎨 **Metal Type Color Coding (UI)**

| Metal Type  | Color     | Icon |
|-------------|-----------|------|
| Steel       | Gray      | 🔩   |
| Aluminium   | Silver    | ⚙️   |
| Brass       | Gold      | 🎺   |
| Copper      | Orange    | 🔶   |
| Bronze      | Brown     | 🥉   |
| Iron        | Dark Gray | ⚫   |

---

## 🚀 **Ready to Implement?**

This will transform your Metal Connect platform into a **multi-metal wholesale system** with full price tracking for each metal type!

**Should I proceed with the implementation?**

Options:
1. ✅ **Yes, implement all phases now**
2. 🎯 **Start with Phase 1 & 2 (Backend only)**
3. ✏️ **Modify the plan first** (add/remove features)

Let me know how you'd like to proceed! 🚀
