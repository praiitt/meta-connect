# Implementation Plan: Phase 6 — CSV Export

## 📊 Overview
Add CSV export functionality to the admin dashboard, allowing admins to download orders and user data for reporting, accounting, and analysis purposes.

---

## 🎯 Features to Implement

### 1. **Orders CSV Export**
**Location**: `web/src/pages/Orders.tsx`

**CSV Columns**:
- Order ID
- Customer Name
- Company Name
- Phone Number
- Total Amount (₹)
- Status
- Order Date
- Number of Items
- Order Items (Product names & quantities)

**Button**: "Export Orders to CSV" in the top-right corner

---

### 2. **Users CSV Export**
**Location**: `web/src/pages/Users.tsx`

**CSV Columns**:
- User ID
- Full Name
- Company Name
- Phone Number
- GST Number
- Status (PENDING/APPROVED/REJECTED)
- Registered Date
- Total Orders (count)
- Total Revenue (sum of all their orders)

**Button**: "Export Users to CSV" in the top-right corner

---

## 🛠️ Implementation Steps

### **Step 1: Install Dependencies**
```bash
cd web
npm install papaparse
npm install --save-dev @types/papaparse
```

### **Step 2: Create CSV Utility**
**File**: `web/src/utils/csvExport.ts`

Functions:
- `exportOrdersToCSV(orders: Order[]): void`
- `exportUsersToCSV(users: User[]): void`
- Helper: `downloadCSV(csv: string, filename: string)`

### **Step 3: Update Orders Page**
**File**: `web/src/pages/Orders.tsx`

- Add "Export to CSV" button with Download icon
- Wire button to `exportOrdersToCSV()`
- Pass current filtered orders (respects search/filter state)

### **Step 4: Update Users Page**
**File**: `web/src/pages/Users.tsx`

- Add "Export to CSV" button with Download icon
- Wire button to `exportUsersToCSV()`
- Include aggregated metrics (total orders, revenue) if available

### **Step 5: Optional Backend Enhancement**
If we want total orders/revenue per user in the Users CSV:
- Create `GET /api/users/with-stats` endpoint
- Return user data with aggregated order counts and revenue

---

## 📁 File Changes Summary

### **NEW Files**:
- `web/src/utils/csvExport.ts` — CSV generation utilities

### **MODIFIED Files**:
- `web/src/pages/Orders.tsx` — Add export button
- `web/src/pages/Users.tsx` — Add export button
- `web/package.json` — Add papaparse dependency

### **OPTIONAL NEW**:
- `backend/src/routes/users.ts` — Add `/with-stats` endpoint (if enhanced metrics needed)

---

## 🎨 UI Design

### Export Button Style:
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
  <Download size={18} />
  Export to CSV
</button>
```

### Filename Format:
- Orders: `metal-connect-orders-{YYYY-MM-DD}.csv`
- Users: `metal-connect-users-{YYYY-MM-DD}.csv`

---

## ⏱️ Estimated Time: **1-2 hours**

### Breakdown:
- Install dependencies & create utility (30 min)
- Update Orders page (20 min)
- Update Users page (20 min)
- Testing & polish (20 min)

---

## 🧪 Testing Checklist

- [ ] Orders CSV exports correctly with all columns
- [ ] Users CSV exports correctly with all columns
- [ ] Exported files have correct date in filename
- [ ] CSV respects current filters (search, status, etc.)
- [ ] Empty state handling (no orders/users to export)
- [ ] CSV opens correctly in Excel/Google Sheets
- [ ] Special characters handled properly (commas in names, etc.)

---

## ✅ Success Criteria

1. Admin can export all orders to CSV with one click
2. Admin can export all users to CSV with one click
3. CSV files are properly formatted and open in spreadsheet apps
4. Export respects current filters/search state
5. Filename includes current date for easy organization

---

**Ready to implement!**
