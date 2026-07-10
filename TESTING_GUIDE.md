# 🧪 Metal Connect - Testing Guide

## Quick Start: Test the Development Deployment

**Live URL:** https://metal-connect.dev.rraasi.com

---

## 1️⃣ Test Admin Dashboard

### Step 1: Login
1. Open https://metal-connect.dev.rraasi.com/ in your browser
2. You should see the login page
3. Enter credentials:
   ```
   Email: admin@metalconnect.com
   Password: admin123
   ```
4. Click "Login"

**Expected Result:** ✅ Redirect to Dashboard page with analytics

---

### Step 2: View Dashboard
You should see:
- ✅ KPI cards (Total Revenue, Total Orders, Total Customers, Pending Approvals)
- ✅ Revenue trend chart (last 30 days)
- ✅ Order status distribution (pie chart)
- ✅ Top products table

---

### Step 3: Test Metal Price Management ⭐ NEW FEATURE

1. Click **"Metal Price"** in the sidebar
2. You should see:
   - ✅ Current price card (₹500/kg)
   - ✅ 30-day average
   - ✅ Price history table
   - ✅ "Update Metal Price" form

#### Test Price Update:
1. Enter a new price (e.g., `525`)
2. Click "Update Price"
3. ✅ New price should appear in history table
4. ✅ Current price card should update

#### Test CSV Export:
1. Click "Export CSV" button
2. ✅ File `metal-price-history-YYYY-MM-DD.csv` should download

---

### Step 4: Test Categories

1. Click **"Categories"** in sidebar
2. You should see 5 category cards:
   - Utensils
   - Cookware
   - Serving Items
   - Storage
   - Accessories

#### Test Create Category:
1. Click "+ Add Category"
2. Fill in:
   ```
   Name: Decorative Items
   Description: Metal decorative items
   ```
3. Click "Create"
4. ✅ New category should appear

#### Test Edit Category:
1. Click "Edit" on any category
2. Change description
3. Click "Save"
4. ✅ Changes should persist

#### Test Delete Category:
1. Click "Delete" on a category with 0 products
2. Confirm deletion
3. ✅ Category should be removed

---

### Step 5: Test Products

1. Click **"Products"** in sidebar

#### Test Create Product (Dynamic Pricing):
1. Click "+ Add Product"
2. Fill in:
   ```
   Name: Steel Thali
   SKU: ST-001
   Description: Premium steel thali
   Category: Utensils
   Stock: 100
   MOQ: 10
   
   ☑️ Use Dynamic Metal Pricing
   Weight (kg): 0.5
   Markup Amount: 100
   ```
3. Upload an image (optional)
4. Click "Create Product"
5. ✅ Product should appear with calculated price

**Price Calculation:**
```
Final Price = (Current Metal Price × Weight) + Markup
            = (500 × 0.5) + 100
            = 250 + 100
            = ₹350
```

#### Test Create Product (Fixed Pricing):
1. Click "+ Add Product"
2. Fill in similar details
3. ⬜ Leave "Use Dynamic Metal Pricing" unchecked
4. Enter manual price: `1200`
5. ✅ Product should be created with fixed price

#### Test Search & Filter:
1. Type product name in search bar
2. ✅ Results should filter in real-time
3. Select "Out of Stock" from dropdown
4. ✅ Only out-of-stock products should show

---

### Step 6: Test Users Management

1. Click **"Users"** in sidebar

#### Test Invite Retailer:
1. Click "+ Invite Retailer"
2. Fill in:
   ```
   Name: Test Retailer
   Phone: 9876543210
   Company: Test Company
   GST: 27AABCU9603R1ZV
   Login Code: 1234
   ```
3. Click "Send Invitation"
4. ✅ New user should appear with status "PENDING"

#### Test Approve Retailer:
1. Click "Approve" button on pending user
2. ✅ Status should change to "APPROVED"
3. ✅ User can now login via mobile app

#### Test CSV Export:
1. Click "Export CSV"
2. ✅ File should download with all user data

---

### Step 7: Test Orders

1. Click **"Orders"** in sidebar
2. (No orders yet - will be created from mobile app)

#### Test Order Status Update (when orders exist):
1. Click status dropdown on any order
2. Select new status (e.g., "CONFIRMED")
3. Confirm notification dialog
4. ✅ Status should update
5. ✅ Push notification sent to retailer (if mobile app connected)

#### Test CSV Export:
1. Click "Export CSV"
2. ✅ File should download with order details

---

## 2️⃣ Test Mobile App

### Prerequisites:
1. Update API URL in `app/api/client.ts`:
   ```typescript
   const API_URL = 'https://metal-connect.dev.rraasi.com/api';
   ```
2. Rebuild mobile app (dev client or APK)

---

### Step 1: Retailer Login

1. Open mobile app
2. Enter:
   ```
   Phone: 9876543210
   Login Code: 1234
   ```
3. Click "Login"
4. ✅ If approved: Access to app
5. ✅ If pending: "Pending approval" screen

---

### Step 2: Test Catalog Screen

1. You should see:
   - ✅ Green metal price banner at top: "Today's Metal Price: ₹500/kg"
   - ✅ Category filter chips (ALL, Utensils, Cookware, etc.)
   - ✅ Product list with images and prices

#### Test Search:
1. Type product name in search bar
2. ✅ Results filter in real-time

#### Test Category Filter:
1. Tap a category chip
2. ✅ Only products in that category show

#### Test "In Stock Only":
1. Toggle "In Stock Only" switch
2. ✅ Only available products show

---

### Step 3: Test Add to Cart

1. Tap "Add to Cart" on any product
2. ✅ Success message should appear
3. Tap Cart tab
4. ✅ Product should be in cart

---

### Step 4: Test Cart Management

1. In Cart screen:
   - ✅ Product details visible
   - ✅ Increase/decrease quantity buttons work
   - ✅ Remove item button works
   - ✅ Total price calculates correctly

#### Test MOQ Validation:
1. Try to reduce quantity below MOQ
2. ✅ Should show error or enforce minimum

---

### Step 5: Test Checkout

1. Tap "Proceed to Checkout"
2. Review order summary
3. Tap "Place Order"
4. ✅ Success message appears
5. ✅ Cart clears
6. ✅ Order appears in Orders tab

---

### Step 6: Test Orders Screen

1. Tap Orders tab
2. You should see:
   - ✅ Order history with status
   - ✅ Status filter chips (ALL, PENDING, CONFIRMED, etc.)
   - ✅ Expandable order items

#### Test Filters:
1. Tap a status chip
2. ✅ Only orders with that status show

#### Test Pull to Refresh:
1. Pull down on screen
2. ✅ Orders should reload

---

### Step 7: Test Profile Screen ⭐ NEW FEATURE

1. Tap Profile tab
2. You should see:
   - ✅ Name (editable)
   - ✅ Company (editable)
   - ✅ GST (editable)
   - ✅ Phone (read-only)
   - ✅ Logout button

#### Test Edit Profile:
1. Change name to "Updated Name"
2. Change company to "Updated Company"
3. Tap "Save Changes"
4. ✅ Success message appears
5. ✅ Changes persist after app restart

#### Test Logout:
1. Tap "Logout"
2. ✅ Redirect to login screen

---

### Step 8: Test Push Notifications

#### Test Order Status Update Notification:
1. Login to admin dashboard
2. Update an order status
3. Check "Notify User"
4. ✅ Push notification should appear on mobile device
5. ✅ Tap notification → Opens Orders screen

#### Test New Product Notification:
1. In admin dashboard, create new product
2. Check "Notify Retailers"
3. ✅ All approved retailers receive push notification
4. ✅ Tap notification → Opens Catalog screen

---

## 3️⃣ Test Dynamic Pricing

### Scenario: Metal Price Increase

1. **Admin Dashboard:**
   - Go to Metal Price page
   - Update price from ₹500 to ₹550
   - Click "Update Price"

2. **Check Product Prices:**
   - Go to Products page
   - Find products with dynamic pricing enabled
   - ✅ Prices should auto-update:
     ```
     Before: (500 × 0.5) + 100 = ₹350
     After:  (550 × 0.5) + 100 = ₹375
     ```

3. **Mobile App:**
   - Refresh catalog (pull down)
   - ✅ Metal price banner shows "₹550/kg"
   - ✅ Product prices reflect new calculations

4. **Fixed Price Products:**
   - ✅ Should remain unchanged (e.g., ₹1200 stays ₹1200)

---

## 4️⃣ Test CSV Exports

### Orders CSV:
1. Go to Orders page
2. Click "Export CSV"
3. Open file in Excel/Sheets
4. ✅ Should contain:
   - Order ID
   - Customer Name
   - Company
   - Phone
   - Total Amount
   - Status
   - Date
   - Items (comma-separated)

### Users CSV:
1. Go to Users page
2. Click "Export CSV"
3. Open file
4. ✅ Should contain:
   - User ID
   - Name
   - Company
   - Phone
   - GST
   - Status
   - Registration Date
   - Order Count
   - Total Revenue

### Metal Price CSV:
1. Go to Metal Price page
2. Click "Export CSV"
3. Open file
4. ✅ Should contain:
   - Date
   - Price (₹/kg)
   - Change (%)
   - Updated By

---

## 🐛 Known Issues / Limitations

### Current Limitations:
- [ ] Push notifications require physical device (won't work on emulator)
- [ ] Metal price banner on mobile requires internet connection
- [ ] Image uploads limited to 5MB
- [ ] CSV exports use client-side generation (large datasets may be slow)

### Dev Environment Quirks:
- Development database is separate from production
- SSL certificate is valid for 90 days (auto-renewal enabled)
- PM2 process may restart if server is rebooted

---

## 📞 Troubleshooting

### Issue: Cannot Login to Admin Dashboard
**Solution:**
- Check credentials: `admin@metalconnect.com` / `admin123`
- Clear browser cache and try again
- Check browser console for errors (F12 → Console)

### Issue: Mobile App Says "Network Error"
**Solution:**
- Verify API URL in `app/api/client.ts` is correct
- Check if backend is running: https://metal-connect.dev.rraasi.com/api/health
- Rebuild mobile app after URL change

### Issue: Push Notifications Not Working
**Solution:**
- Ensure physical device (not emulator)
- Check notification permissions in device settings
- Verify Expo project ID in `app.json`
- Check if push token is registered (Profile screen should show it)

### Issue: Dynamic Pricing Not Updating
**Solution:**
- Refresh browser/app
- Verify product has "Use Dynamic Pricing" checked
- Verify weight and markup are set
- Check metal price is set in database

### Issue: CSV Export Shows No Data
**Solution:**
- Ensure data exists in database
- Check browser downloads folder
- Try disabling ad blockers

---

## ✅ Testing Checklist

Copy this checklist and mark items as you test:

### Admin Dashboard:
- [ ] Login works
- [ ] Dashboard analytics load
- [ ] Metal price update works
- [ ] Metal price history displays
- [ ] CSV export downloads
- [ ] Create category works
- [ ] Edit category works
- [ ] Delete category works
- [ ] Create product (fixed price) works
- [ ] Create product (dynamic price) works
- [ ] Product search filters correctly
- [ ] Invite retailer works
- [ ] Approve retailer works
- [ ] Users CSV export works
- [ ] Order status update works
- [ ] Orders CSV export works

### Mobile App:
- [ ] Retailer login works
- [ ] Pending approval screen shows correctly
- [ ] Metal price banner displays
- [ ] Category filters work
- [ ] Product search works
- [ ] "In Stock Only" toggle works
- [ ] Add to cart works
- [ ] Cart quantity +/- works
- [ ] Remove from cart works
- [ ] Checkout places order
- [ ] Orders screen displays history
- [ ] Order status filters work
- [ ] Pull to refresh works
- [ ] Profile screen loads
- [ ] Edit profile works
- [ ] Logout works
- [ ] Push notifications received (order update)
- [ ] Push notifications received (new product)

### Dynamic Pricing:
- [ ] Products with dynamic pricing calculate correctly
- [ ] Metal price update reflects in product prices
- [ ] Fixed price products remain unchanged
- [ ] Mobile app shows updated prices after refresh

---

## 🎉 Success Criteria

Testing is complete when:
- ✅ All admin dashboard pages load and function
- ✅ All CRUD operations work (Create, Read, Update, Delete)
- ✅ Mobile app can login, browse, and place orders
- ✅ Push notifications are received on device
- ✅ Dynamic pricing calculations are correct
- ✅ CSV exports contain valid data
- ✅ No critical errors in browser console or mobile logs

---

**Happy Testing! 🚀**

If you find any bugs or issues, please report them with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots (if applicable)
