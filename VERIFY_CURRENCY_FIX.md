# 🔍 Quick Verification Guide — Currency Fix

## ⚡ **Quick Test (30 seconds)**

### **Step 1: Clear Browser Cache**
**IMPORTANT:** Before testing, clear your browser cache:

**Windows/Linux:**
```
Press: Ctrl + Shift + R
```

**Mac:**
```
Press: Cmd + Shift + R
```

**Alternative:** Open in **Incognito/Private Window**

---

### **Step 2: Login to Admin Dashboard**

1. Go to: **https://metal-connect.dev.rraasi.com**
2. Login with:
   - **Email:** `admin@metalconnect.com`
   - **Password:** `admin123`

---

### **Step 3: Test Orders Page**

1. Click **"Orders"** in the left sidebar
2. Click **"View Details"** on any order
3. Scroll to the **Order Items table** at the bottom
4. Look at the **"Order Total"** row

---

### **✅ Expected Result:**

You should see:
```
Order Total    ₹1,725.00
```

**NOT:**
```
Order Total    $1,725.00
```

---

## 📋 **Full Currency Audit Checklist**

### **Admin Dashboard Pages:**

| Page | What to Check | Expected Symbol |
|------|---------------|-----------------|
| **Dashboard** | Revenue cards, charts | ₹ |
| **Metal Price** | Current price cards, history | ₹ |
| **Products** | Product list prices | ₹ |
| **Orders** | Order list total amounts | ₹ |
| **Order Details Modal** | Line items, order total | ₹ |

---

### **Mobile App Screens:**

| Screen | What to Check | Expected Symbol |
|--------|---------------|-----------------|
| **Catalog** | Product prices, metal price banner | ₹ |
| **Cart** | Item prices, cart total | ₹ |
| **Orders** | Order history totals | ₹ |
| **Order Details** | Order items, total | ₹ |

---

## 🐛 **Troubleshooting**

### **Problem: Still seeing `$` symbol**

**Solution 1: Hard Refresh**
1. Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
2. Wait 2-3 seconds
3. Refresh again

**Solution 2: Clear Browser Cache Manually**
1. Open DevTools (`F12`)
2. Right-click the **Refresh** button (next to address bar)
3. Click **"Empty Cache and Hard Reload"**

**Solution 3: Use Incognito Mode**
1. Open a new Incognito/Private window
2. Navigate to: https://metal-connect.dev.rraasi.com
3. Login and test again

**Solution 4: Clear All Cached Data**
1. Go to browser settings
2. Clear browsing data (last 24 hours)
3. Check: **Cached images and files**
4. Click **Clear data**
5. Reload the site

---

## 📞 **Still Having Issues?**

If you still see `$` after trying all troubleshooting steps:

1. **Check deployment status:**
   ```bash
   curl -s https://metal-connect.dev.rraasi.com/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Verify build timestamp:**
   - Open DevTools → Network tab
   - Reload page
   - Check `index.html` response
   - Look for recent build timestamp

3. **Test API directly:**
   ```bash
   # Login
   TOKEN=$(curl -s -X POST https://metal-connect.dev.rraasi.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@metalconnect.com","password":"admin123"}' | jq -r '.token')
   
   # Get orders
   curl -s https://metal-connect.dev.rraasi.com/api/orders \
     -H "Authorization: Bearer $TOKEN" | jq
   ```

---

## ✅ **Verification Complete?**

Once you've confirmed the `₹` symbol is displaying correctly everywhere:

- [ ] Orders page modal shows `₹`
- [ ] All product prices show `₹`
- [ ] Dashboard revenue shows `₹`
- [ ] Metal price page shows `₹`
- [ ] Mobile app shows `₹` (if testing)

**You're good to go! 🎉**

If satisfied with dev environment, we can deploy to production.

---

**Last Updated:** January 11, 2026  
**Deployment URL:** https://metal-connect.dev.rraasi.com
