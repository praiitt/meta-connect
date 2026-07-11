import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Package, Plus, Edit2, Trash2, Loader2, X, Search, Download } from 'lucide-react';
import { exportToCSV } from '../utils/csvExport';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  pricePerKg: number | null;
  isPricePerKg: boolean;
  moq: number;
  sku: string | null;
  weightKg: number | null;
  useMetalPrice?: boolean;
  metalType?: string | null;
  markupAmount?: number | null;
  calculatedPrice?: number;
  currentMetalPrice?: number;
  inStock: boolean;
  imageUrl: string | null;
  createdAt: string;
  categoryId?: string | null;
  category?: Category | null;
}

type StockFilter = 'all' | 'inStock' | 'outOfStock';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    pricePerKg: '',
    isPricePerKg: false,
    moq: '10',
    sku: '',
    weightKg: '',
    useMetalPrice: false, metalType: "",
    markupAmount: '',
    imageUrl: '',
    inStock: true,
    categoryId: '',
    notifyRetailers: false,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const handleExport = () => {
    const formattedData = filteredProducts.map((product) => ({
      'Product ID': product.id,
      'Name': product.name,
      'SKU': product.sku || 'N/A',
      'Price (₹)': product.price,
      'MOQ': product.moq,
      'Weight (Kg)': product.weightKg || 'N/A',
      'In Stock': product.inStock ? 'Yes' : 'No',
      'Description': product.description || '',
    }));
    exportToCSV(`products_export_${new Date().toISOString().split('T')[0]}.csv`, formattedData);
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, stockFilter, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/products');
      setProducts(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = products;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.sku && p.sku.toLowerCase().includes(query))
      );
    }

    // Stock status filter
    if (stockFilter === 'inStock') {
      filtered = filtered.filter(p => p.inStock);
    } else if (stockFilter === 'outOfStock') {
      filtered = filtered.filter(p => !p.inStock);
    }

    setFilteredProducts(filtered);
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        pricePerKg: product.pricePerKg?.toString() || '',
        isPricePerKg: product.isPricePerKg,
        moq: product.moq.toString(),
        sku: product.sku || '',
        weightKg: product.weightKg?.toString() || '',
        useMetalPrice: product.useMetalPrice || false,
        metalType: product.metalType || '',
        markupAmount: product.markupAmount?.toString() || '',
        imageUrl: product.imageUrl || '',
        inStock: product.inStock,
        categoryId: product.categoryId || '',
        notifyRetailers: false,
      });
      setImagePreview(product.imageUrl);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        pricePerKg: '',
        isPricePerKg: false,
        moq: '10',
        sku: '',
        weightKg: '',
    useMetalPrice: false, metalType: "",
    markupAmount: '',
        imageUrl: '',
        inStock: true,
        categoryId: '',
        notifyRetailers: false,
      });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImagePreview(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post('/upload/product-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { imageUrl } = response.data;
      setFormData((prev) => ({ ...prev, imageUrl }));
      setImagePreview(imageUrl);
      alert('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        pricePerKg: formData.pricePerKg ? parseFloat(formData.pricePerKg) : null,
        isPricePerKg: formData.isPricePerKg,
        moq: parseInt(formData.moq, 10),
        sku: formData.sku || null,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
        useMetalPrice: formData.useMetalPrice,
        metalType: formData.metalType || null,
        markupAmount: formData.markupAmount ? parseFloat(formData.markupAmount) : null,
        imageUrl: formData.imageUrl || null,
        inStock: formData.inStock,
        categoryId: formData.categoryId || null,
        notifyRetailers: formData.notifyRetailers,
      };

      if (editingProduct) {
        await apiClient.patch(`/products/${editingProduct.id}`, payload);
        alert('Product updated successfully!');
      } else {
        await apiClient.post('/products', payload);
        alert('Product created successfully!');
      }

      await fetchProducts();
      handleCloseModal();
    } catch (err: any) {
      console.error(err);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiClient.delete(`/products/${id}`);
      alert('Product deleted');
      await fetchProducts();
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
          <Plus size={18} />
          Add Product
        </button>
      </div>
    </div>

    {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Stock Filter */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as StockFilter)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">All Products</option>
          <option value="inStock">In Stock</option>
          <option value="outOfStock">Out of Stock</option>
        </select>

        <span className="text-sm text-slate-600">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 text-lg">
            {searchQuery || stockFilter !== 'all' 
              ? 'No products match your filters.' 
              : 'No products yet. Add your first wholesale product!'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">SKU</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Metal Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">MOQ</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Stock</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, idx) => (
                <tr
                  key={product.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 ${
                    idx === filteredProducts.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-slate-500">{product.description}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{product.sku || '—'}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {product.category ? (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                        {product.category.name}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {product.useMetalPrice && product.metalType ? (
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                        {product.metalType}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    {product.isPricePerKg ? (
                      <div>
                        <div className="text-slate-900 font-medium">₹{product.pricePerKg}/kg</div>
                        <div className="text-xs text-slate-500">
                          ${product.price} total ({product.weightKg} kg)
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-900 font-medium">₹{product.price}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{product.moq}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        product.inStock
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">None</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Pricing Type Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPricePerKg"
                  checked={formData.isPricePerKg}
                  onChange={(e) =>
                    setFormData({ ...formData, isPricePerKg: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="isPricePerKg" className="text-sm text-slate-700">
                  Price per Kilogram (kg)
                </label>
              </div>

              {/* Conditional Pricing Fields */}
              {formData.isPricePerKg ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Price per kg *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.pricePerKg}
                      onChange={(e) =>
                        setFormData({ ...formData, pricePerKg: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.weightKg}
                      onChange={(e) =>
                        setFormData({ ...formData, weightKg: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              )}

              {/* MOQ */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Minimum Order Quantity (MOQ) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.moq}
                  onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Dynamic Metal Pricing */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="useMetalPrice"
                    checked={formData.useMetalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, useMetalPrice: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="useMetalPrice" className="text-sm font-medium text-slate-700">
                    Use Dynamic Metal Pricing
                  </label>
                </div>
                
                {formData.useMetalPrice && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <p className="text-xs text-slate-600">
                      Final Price = (Current Metal Price × Weight) + Markup Amount
                    </p>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Metal Type *
                      </label>
                      <select
                        required={formData.useMetalPrice}
                        value={formData.metalType}
                        onChange={(e) => setFormData({ ...formData, metalType: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Metal Type</option>
                        {["STEEL", "ALUMINIUM", "BRASS", "COPPER", "BRONZE", "IRON"].map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Weight (kg) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required={formData.useMetalPrice}
                          value={formData.weightKg || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, weightKg: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Markup Amount (₹) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required={formData.useMetalPrice}
                          value={formData.markupAmount || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, markupAmount: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product Image
                </label>
                
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-40 h-40 object-cover rounded-lg border-2 border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="text-xs text-slate-500">
                      {formData.imageUrl}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Package className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Choose Image
                        </>
                      )}
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      JPEG, PNG, WebP, or GIF (max 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* In Stock */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="inStock" className="text-sm text-slate-700">
                  In Stock
                </label>
              </div>

              {/* Notify Retailers (Only on Create) */}
              {!editingProduct && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="notifyRetailers"
                    checked={formData.notifyRetailers}
                    onChange={(e) => setFormData({ ...formData, notifyRetailers: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="notifyRetailers" className="text-sm text-slate-700 font-medium">
                    Send push notification to all approved retailers about this new product
                  </label>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
