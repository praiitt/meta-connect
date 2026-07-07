import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Users, Package, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    newOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          apiClient.get('/users'),
          apiClient.get('/orders')
        ]);
        
        const users = usersRes.data;
        const orders = ordersRes.data;

        setStats({
          totalUsers: users.length,
          pendingUsers: users.filter((u: any) => u.status === 'PENDING').length,
          newOrders: orders.filter((o: any) => o.status === 'PENDING').length,
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Total B2B Users</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <Link to="/users" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-orange-300 transition-colors">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Pending Approvals</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pendingUsers}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
        </Link>
        
        <Link to="/orders" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">New Orders</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.newOrders}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <Package className="w-6 h-6 text-indigo-600" />
          </div>
        </Link>
      </div>
    </div>
  );
}