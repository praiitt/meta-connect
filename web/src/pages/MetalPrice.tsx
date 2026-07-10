import { useState, useEffect } from 'react';
import { metalPriceApi } from '../api/metalPrice';
import type { MetalPrice, MetalType } from '../api/metalPrice';
import { TrendingUp, Calendar, Bell, Download } from 'lucide-react';

const METAL_COLORS: Record<string, string> = {
  STEEL: 'from-gray-500 to-gray-700',
  ALUMINIUM: 'from-slate-400 to-slate-500',
  BRASS: 'from-yellow-500 to-yellow-600',
  COPPER: 'from-orange-500 to-orange-700',
  BRONZE: 'from-amber-600 to-amber-800',
  IRON: 'from-zinc-700 to-zinc-900',
};

const METAL_TYPES = ["STEEL", "ALUMINIUM", "BRASS", "COPPER", "BRONZE", "IRON"];

export default function MetalPricePage() {
  const [currentPrices, setCurrentPrices] = useState<MetalPrice[]>([]);
  const [history, setHistory] = useState<MetalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [selectedMetalType, setSelectedMetalType] = useState<string>("STEEL");
  const [newPrice, setNewPrice] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [notifyRetailers, setNotifyRetailers] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // When selected metal type changes, update the newPrice input to its current price
    const currentPriceObj = currentPrices.find(p => p.metalType === selectedMetalType);
    if (currentPriceObj) {
      setNewPrice(currentPriceObj.pricePerKg.toString());
    } else {
      setNewPrice('');
    }
  }, [selectedMetalType, currentPrices]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [currentRes, historyRes] = await Promise.all([
        metalPriceApi.getCurrentAll(),
        metalPriceApi.getHistoryAll(100)
      ]);
      setCurrentPrices(currentRes.data);
      setHistory(historyRes.data);
    } catch (error: any) {
      console.error('Error fetching metal price data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrice || parseFloat(newPrice) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      setUpdating(true);
      await metalPriceApi.updatePrice({
        metalType: selectedMetalType,
        pricePerKg: parseFloat(newPrice),
        effectiveDate,
        notifyRetailers
      });
      
      alert('Metal price updated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update metal price');
    } finally {
      setUpdating(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Metal Type', 'Price per Kg (₹)'];
    const filteredHistory = filterType === 'ALL' 
      ? history 
      : history.filter(h => h.metalType === filterType);

    const rows = filteredHistory.map(h => [
      new Date(h.effectiveDate).toLocaleDateString('en-IN'),
      h.metalType,
      h.pricePerKg.toString()
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metal-prices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredHistory = filterType === 'ALL' 
    ? history 
    : history.filter(h => h.metalType === filterType);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <TrendingUp className="text-blue-600" size={32} />
          Metal Price Management
        </h1>
        <p className="text-gray-600 mt-2">
          Update daily metal prices and view historical trends for multiple metals
        </p>
      </div>

      {/* Current Prices Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {METAL_TYPES.map(type => {
          const currentData = currentPrices.find(p => p.metalType === type);
          return (
            <div key={type} className={`bg-gradient-to-br ${METAL_COLORS[type] || 'from-blue-500 to-blue-600'} rounded-xl p-4 text-white shadow-lg`}>
              <div className="text-sm font-medium opacity-80">{type}</div>
              <div className="text-2xl font-bold mt-1">
                ₹{currentData?.pricePerKg.toLocaleString('en-IN') || '---'}
              </div>
              <div className="text-xs opacity-70 mt-2">
                {currentData 
                  ? new Date(currentData.effectiveDate).toLocaleDateString('en-IN')
                  : 'No data'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Update Price Form */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Update Metal Price</h2>
        <form onSubmit={handleUpdatePrice} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metal Type
              </label>
              <select
                value={selectedMetalType}
                onChange={(e) => setSelectedMetalType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {METAL_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Kg (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter price per kg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective Date
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notify"
              checked={notifyRetailers}
              onChange={(e) => setNotifyRetailers(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="notify" className="text-sm text-gray-700 flex items-center gap-2">
              <Bell size={16} />
              Notify all retailers about price change
            </label>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {updating ? 'Updating...' : 'Update Price'}
          </button>
        </form>
      </div>

      {/* Price History */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">Price History</h2>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Metals</option>
              {METAL_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          {filteredHistory.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download size={16} />
              Export CSV
            </button>
          )}
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No price history available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Metal Type</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Price (₹/kg)</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((price) => (
                  <tr key={price.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">
                      {new Date(price.effectiveDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                        {price.metalType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      ₹{price.pricePerKg.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}