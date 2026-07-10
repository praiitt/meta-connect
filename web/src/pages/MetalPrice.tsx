import { useState, useEffect } from 'react';
import { metalPriceApi } from '../api/metalPrice';
import type { MetalPrice } from '../api/metalPrice';
import { TrendingUp, Calendar, DollarSign, Bell, Download } from 'lucide-react';

export default function MetalPricePage() {
  const [currentPrice, setCurrentPrice] = useState<MetalPrice | null>(null);
  const [history, setHistory] = useState<MetalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [newPrice, setNewPrice] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [notifyRetailers, setNotifyRetailers] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [currentRes, historyRes] = await Promise.all([
        metalPriceApi.getCurrent(),
        metalPriceApi.getHistory(30)
      ]);
      setCurrentPrice(currentRes.data);
      setHistory(historyRes.data);
      setNewPrice(currentRes.data.pricePerKg.toString());
    } catch (error: any) {
      console.error('Error fetching metal price data:', error);
      if (error.response?.status === 404) {
        // No price set yet
        setCurrentPrice(null);
      }
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
    const headers = ['Date', 'Price per Kg (₹)'];
    const rows = history.map(h => [
      new Date(h.effectiveDate).toLocaleDateString('en-IN'),
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <TrendingUp className="text-blue-600" size={32} />
          Metal Price Management
        </h1>
        <p className="text-gray-600 mt-2">
          Update daily metal prices and view historical trends
        </p>
      </div>

      {/* Current Price Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">Current Price</span>
            <DollarSign size={24} />
          </div>
          <div className="text-4xl font-bold mb-1">
            ₹{currentPrice?.pricePerKg.toLocaleString('en-IN') || '---'}
          </div>
          <div className="text-blue-100 text-sm">per kilogram</div>
          {currentPrice && (
            <div className="mt-3 pt-3 border-t border-blue-400 text-xs text-blue-100">
              Last updated: {new Date(currentPrice.effectiveDate).toLocaleDateString('en-IN')}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">30-Day Average</span>
            <Calendar size={20} className="text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ₹{history.length > 0 
              ? (history.reduce((sum, h) => sum + h.pricePerKg, 0) / history.length).toFixed(2)
              : '---'}
          </div>
          <div className="text-gray-500 text-sm mt-1">Last 30 days</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Price Changes</span>
            <TrendingUp size={20} className="text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{history.length}</div>
          <div className="text-gray-500 text-sm mt-1">Total updates</div>
        </div>
      </div>

      {/* Update Price Form */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Update Metal Price</h2>
        <form onSubmit={handleUpdatePrice} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <h2 className="text-xl font-bold text-gray-900">Price History (Last 30 Days)</h2>
          {history.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download size={16} />
              Export CSV
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No price history available yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Price (₹/kg)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Change</th>
                </tr>
              </thead>
              <tbody>
                {history.map((price, index) => {
                  const previousPrice = history[index + 1];
                  const change = previousPrice 
                    ? ((price.pricePerKg - previousPrice.pricePerKg) / previousPrice.pricePerKg) * 100
                    : 0;
                  
                  return (
                    <tr key={price.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">
                        {new Date(price.effectiveDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        ₹{price.pricePerKg.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {previousPrice ? (
                          <span className={`inline-flex items-center gap-1 ${
                            change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {change > 0 ? '↑' : change < 0 ? '↓' : '→'}
                            {Math.abs(change).toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
