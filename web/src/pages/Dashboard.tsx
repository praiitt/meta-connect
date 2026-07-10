import { useEffect, useState } from 'react';
import { Users, Package, Clock, Loader2, TrendingUp, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchOverview, fetchRevenueTrend, fetchTopProducts } from '../api/analytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [overviewRes, trendRes, productsRes] = await Promise.all([
          fetchOverview(),
          fetchRevenueTrend(7),
          fetchTopProducts()
        ]);
        setStats(overviewRes.data);
        setRevenueTrend(trendRes.data);
        setTopProducts(productsRes.data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load data.</div>;
  }

  const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];
  const statusData = Object.keys(stats.statusCounts || {}).map((key) => ({
    name: key,
    value: stats.statusCounts[key]
  })).filter(item => item.value > 0);

  const formatCurrency = (val: number) => `₹ ${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <Link to="/orders" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <Package className="w-6 h-6 text-indigo-600" />
          </div>
        </Link>
        
        <Link to="/users" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition-colors">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Total Customers</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalCustomers}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </Link>

        <Link to="/users" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-orange-300 transition-colors">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Pending Approvals</h3>
            <p className="text-2xl font-bold text-orange-600 mt-2">{stats.pendingCustomers}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Line Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            Revenue Trend (Last 7 Days)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(tick) => {
                    const d = new Date(tick);
                    return `${d.getDate()}/${d.getMonth()+1}`;
                  }}
                />
                <YAxis 
                  tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val}
                />
                <RechartsTooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Orders by Status</h3>
          <div className="h-[300px] w-full">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No orders yet</div>
            )}
          </div>
          {/* Custom Legend */}
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {statusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                <span className="text-gray-600">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500">
                <th className="pb-3 font-medium">Product Name</th>
                <th className="pb-3 font-medium">Units Sold</th>
                <th className="pb-3 font-medium">Estimated Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((prod, i) => (
                <tr key={prod.id || i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="py-3 text-sm font-medium text-gray-900">{prod.name || 'Unknown Product'}</td>
                  <td className="py-3 text-sm text-gray-600">{prod.quantity}</td>
                  <td className="py-3 text-sm text-gray-900 font-semibold">{formatCurrency(prod.revenue)}</td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500 text-sm">No product data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
