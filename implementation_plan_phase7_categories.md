# Phase 7: Product Categories — Implementation Plan

## 🎯 Objective
Add product categorization to Metal Connect, allowing better organization and filtering of the product catalog for both admin and retailers.

---

## 📋 Overview

### **Business Value:**
- Better product organization as catalog grows
- Easier product discovery for retailers
- Improved inventory management for admin
- Foundation for future category-specific promotions

### **Estimated Time:** 4-5 hours

---

## 🗄️ Part 1: Database Schema Changes

### **1.1 Add Category Model**
**File:** `backend/prisma/schema.prisma`

```prisma
model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  description String?
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### **1.2 Add categoryId to Product Model**
**File:** `backend/prisma/schema.prisma`

```prisma
model Product {
  // ... existing fields ...
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  // ... rest of fields ...
}
```

### **1.3 Run Migration**
```bash
npx prisma migrate dev --name add_categories
npx prisma generate
```

### **1.4 Optional: Seed Sample Categories**
**File:** `backend/prisma/seed.ts`

```typescript
// Add sample categories
const categories = [
  { name: 'Utensils', description: 'Spoons, forks, knives, serving utensils' },
  { name: 'Cookware', description: 'Pots, pans, kadhai, pressure cookers' },
  { name: 'Serving Items', description: 'Trays, bowls, plates, dishes' },
  { name: 'Storage', description: 'Containers, dabba, boxes' },
  { name: 'Accessories', description: 'Lids, handles, stands' },
];

for (const cat of categories) {
  await prisma.category.upsert({
    where: { name: cat.name },
    update: {},
    create: cat,
  });
}
```

---

## 🔧 Part 2: Backend API Routes

### **2.1 Create Category Routes**
**File:** `backend/src/routes/categories.ts` (NEW)

```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all categories (Public - for mobile catalog)
router.get('/', authenticate, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single category with products
router.get('/:id', authenticate, async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        products: true
      }
    });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Create category
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await prisma.category.create({
      data: { name, description },
    });
    res.status(201).json(category);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update category
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete category
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { products: true } } }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category._count.products > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${category._count.products} products. Re-assign products first.` 
      });
    }

    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
```

### **2.2 Register Category Routes**
**File:** `backend/src/index.ts`

```typescript
import categoryRoutes from './routes/categories';

// ... existing routes ...
app.use('/api/categories', categoryRoutes);
```

### **2.3 Update Products Route (Filter by Category)**
**File:** `backend/src/routes/products.ts`

```typescript
// Get all products with optional category filter
router.get('/', authenticate, requireApproved, async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    const products = await prisma.product.findMany({
      where: categoryId ? { categoryId: categoryId as string } : {},
      include: {
        category: true // Include category data
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

---

## 🎨 Part 3: Admin Dashboard UI

### **3.1 Create Categories Management Page**
**File:** `web/src/pages/Categories.tsx` (NEW)

```typescript
import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Folder, Plus, Edit2, Trash2, Loader2, X, Package } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string | null;
  _count?: { products: number };
  createdAt: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCategory) {
        await apiClient.patch(`/categories/${editingCategory.id}`, formData);
        alert('Category updated!');
      } else {
        await apiClient.post('/categories', formData);
        alert('Category created!');
      }
      await fetchCategories();
      handleCloseModal();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, productCount: number) => {
    if (productCount > 0) {
      alert(`Cannot delete category with ${productCount} products. Please re-assign products first.`);
      return;
    }
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await apiClient.delete(`/categories/${id}`);
      alert('Category deleted');
      await fetchCategories();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Folder className="w-8 h-8 text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-900">Product Categories</h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Folder className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 text-lg">No categories yet. Create your first category!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-slate-600" />
                  <h3 className="font-semibold text-slate-900">{category.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(category)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category._count?.products || 0)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {category.description && (
                <p className="text-sm text-slate-600 mb-3">{category.description}</p>
              )}
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Package size={14} />
                <span>{category._count?.products || 0} products</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g., Utensils, Cookware"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Brief description of this category"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
```

### **3.2 Add Categories to Sidebar Navigation**
**File:** `web/src/components/Layout.tsx`

```typescript
import { Folder } from 'lucide-react';

// Add to navigation items:
{ name: 'Categories', path: '/categories', icon: Folder },
```

### **3.3 Add Categories Route**
**File:** `web/src/App.tsx`

```typescript
import Categories from './pages/Categories';

// Add route:
<Route path="/categories" element={<Categories />} />
```

### **3.4 Update Products Form (Add Category Dropdown)**
**File:** `web/src/pages/Products.tsx`

Add to form state:
```typescript
const [formData, setFormData] = useState({
  // ... existing fields ...
  categoryId: '',
});
```

Add category fetching:
```typescript
const [categories, setCategories] = useState<Category[]>([]);

useEffect(() => {
  fetchCategories();
}, []);

const fetchCategories = async () => {
  try {
    const res = await apiClient.get('/categories');
    setCategories(res.data);
  } catch (err) {
    console.error('Failed to fetch categories', err);
  }
};
```

Add category dropdown in form (after SKU field):
```typescript
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Category
  </label>
  <select
    value={formData.categoryId}
    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
  >
    <option value="">-- No Category --</option>
    {categories.map((cat) => (
      <option key={cat.id} value={cat.id}>
        {cat.name}
      </option>
    ))}
  </select>
</div>
```

Add category column to products table:
```typescript
<th className="text-left py-3 px-4 font-semibold text-slate-700">Category</th>

// In table body:
<td className="py-3 px-4 text-slate-600">
  {product.category?.name || '—'}
</td>
```

---

## 📱 Part 4: Mobile App UI

### **4.1 Update Product Interface**
**File:** `store/useCartStore.ts`

```typescript
export interface Product {
  // ... existing fields ...
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
}
```

### **4.2 Add Category Filters to Catalog**
**File:** `app/(tabs)/catalog.tsx`

Add state:
```typescript
const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
```

Fetch categories:
```typescript
useEffect(() => {
  fetchCategories();
}, []);

const fetchCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    setCategories(response.data);
  } catch (error) {
    console.error('Failed to fetch categories', error);
  }
};
```

Update filter logic:
```typescript
const applyFilters = () => {
  let filtered = products;

  // Category filter
  if (selectedCategoryId) {
    filtered = filtered.filter(p => p.categoryId === selectedCategoryId);
  }

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.sku && p.sku.toLowerCase().includes(query))
    );
  }

  // In Stock filter
  if (showInStockOnly) {
    filtered = filtered.filter(p => p.inStock);
  }

  setFilteredProducts(filtered);
};
```

Add horizontal category chips (after search bar, before filter row):
```typescript
{/* Category Filter Chips */}
{categories.length > 0 && (
  <ScrollView 
    horizontal 
    showsHorizontalScrollIndicator={false}
    style={styles.categoryScroll}
    contentContainerStyle={styles.categoryScrollContent}
  >
    <TouchableOpacity
      style={[
        styles.categoryChip,
        !selectedCategoryId && styles.categoryChipActive
      ]}
      onPress={() => setSelectedCategoryId(null)}
    >
      <Text style={[
        styles.categoryChipText,
        !selectedCategoryId && styles.categoryChipTextActive
      ]}>
        All
      </Text>
    </TouchableOpacity>
    
    {categories.map((category) => (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryChip,
          selectedCategoryId === category.id && styles.categoryChipActive
        ]}
        onPress={() => setSelectedCategoryId(category.id)}
      >
        <Text style={[
          styles.categoryChipText,
          selectedCategoryId === category.id && styles.categoryChipTextActive
        ]}>
          {category.name}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
)}
```

Add styles:
```typescript
categoryScroll: {
  marginHorizontal: 16,
  marginBottom: 12,
},
categoryScrollContent: {
  paddingRight: 16,
},
categoryChip: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  marginRight: 8,
  backgroundColor: 'white',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#E2E8F0',
},
categoryChipActive: {
  backgroundColor: '#0066cc',
  borderColor: '#0066cc',
},
categoryChipText: {
  fontSize: 14,
  color: '#64748B',
  fontWeight: '500',
},
categoryChipTextActive: {
  color: 'white',
  fontWeight: '600',
},
```

---

## ✅ Testing Checklist

### Backend:
- [ ] `npx prisma migrate dev` runs successfully
- [ ] Seed script creates sample categories
- [ ] GET `/api/categories` returns all categories with product counts
- [ ] POST `/api/categories` creates new category (admin only)
- [ ] PATCH `/api/categories/:id` updates category
- [ ] DELETE `/api/categories/:id` prevents deletion if products exist
- [ ] GET `/api/products?categoryId=xyz` filters by category

### Admin Dashboard:
- [ ] Categories page displays all categories in card grid
- [ ] Can create new category
- [ ] Can edit existing category
- [ ] Cannot delete category with products (shows error message)
- [ ] Can delete empty category
- [ ] Product form shows category dropdown
- [ ] Can assign category when creating/editing product
- [ ] Products table shows category name column

### Mobile App:
- [ ] Catalog screen shows horizontal category filter chips
- [ ] "All" chip shows all products
- [ ] Clicking category chip filters products
- [ ] Category filter works with search + in-stock filters
- [ ] Result count updates based on active filters

---

## 📊 Success Metrics

- ✅ Database migration adds Category model + relation
- ✅ Backend API supports full CRUD for categories
- ✅ Admin can manage categories via web dashboard
- ✅ Admin can assign categories to products
- ✅ Mobile app displays category filters
- ✅ Cannot delete categories with products (data integrity)
- ✅ All existing products work without categories (nullable)

---

## 🚀 Next Steps After Phase 7

**Phase 8 Options:**
1. **Retailer Profile Management (Mobile)** — Let retailers edit their own profile
2. **Bulk Operations** — Bulk product import/export, bulk category assignment
3. **Advanced Analytics** — Category-wise revenue, best-selling categories
4. **Production Deployment** — Deploy to live server + mobile app store

---

**Ready to execute Phase 7?**
