import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Check, X, ShieldAlert, Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  phone: string | null;
  company: string | null;
  createdAt: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/users');
      setUsers(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      setUpdatingId(id);
      await apiClient.patch(`/users/${id}/status`, { status });
      // Update local state
      setUsers(users.map(u => u.id === id ? { ...u, status } : u));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-center">
          <ShieldAlert className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name / Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.company || '-'}</div>
                      <div className="text-sm text-gray-500">{user.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.status === 'PENDING' && user.role !== 'ADMIN' && (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'APPROVED')}
                            disabled={updatingId === user.id}
                            className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            {updatingId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'REJECTED')}
                            disabled={updatingId === user.id}
                            className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      {user.status !== 'PENDING' && user.role !== 'ADMIN' && (
                         <div className="flex justify-end space-x-2">
                           <button
                             onClick={() => handleUpdateStatus(user.id, user.status === 'APPROVED' ? 'REJECTED' : 'APPROVED')}
                             disabled={updatingId === user.id}
                             className="text-sm text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                           >
                             {updatingId === user.id ? 'Updating...' : (user.status === 'APPROVED' ? 'Revoke Access' : 'Restore Access')}
                           </button>
                         </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
