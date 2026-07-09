import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Check, X, ShieldAlert, Loader2, UserPlus, Download } from 'lucide-react';
import { exportToCSV } from '../utils/csvExport';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  phone: string | null;
  company: string | null;
  gst: string | null;
  loginCode: string | null;
  createdAt: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Invite Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', phone: '', company: '', gst: '' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleExport = () => {
    const formattedData = users.map((user) => ({
      'User ID': user.id,
      'Name': user.name,
      'Email': user.email,
      'Phone': user.phone || 'N/A',
      'Company': user.company || 'N/A',
      'GST': user.gst || 'N/A',
      'Role': user.role,
      'Approval Status': user.approvalStatus,
    }));
    exportToCSV(`users_export_${new Date().toISOString().split('T')[0]}.csv`, formattedData);
  };

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
      setUsers(users.map(u => u.id === id ? { ...u, status } : u));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const res = await apiClient.post('/users/invite', inviteForm);
      setInviteSuccess(res.data.user);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      setInviteError(err.response?.data?.message || 'Failed to invite retailer');
    } finally {
      setInviteLoading(false);
    }
  };

  const closeInviteModal = () => {
    setIsModalOpen(false);
    setInviteForm({ name: '', phone: '', company: '', gst: '' });
    setInviteError(null);
    setInviteSuccess(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Retailers Management</h1>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 flex items-center shadow-sm"
          >
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center shadow-sm"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Invite Retailer
          </button>
        </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company / GST</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.company || '-'}</div>
                      <div className="text-xs text-gray-500">{user.gst ? `GST: ${user.gst}` : ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.loginCode ? (
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800 tracking-wider">
                          {user.loginCode}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.role !== 'ADMIN' && user.status === 'PENDING' && (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'APPROVED')}
                            disabled={updatingId === user.id}
                            className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-full"
                            title="Approve User"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'REJECTED')}
                            disabled={updatingId === user.id}
                            className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-full"
                            title="Reject User"
                          >
                            <X className="w-5 h-5" />
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

      {/* Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={closeInviteModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Invite New Retailer
                    </h3>
                    
                    {inviteSuccess ? (
                      <div className="mt-4 bg-green-50 p-4 rounded-md border border-green-200">
                        <h4 className="text-green-800 font-medium mb-2">Retailer added successfully!</h4>
                        <p className="text-sm text-green-700 mb-4">
                          Share this login code with the retailer. They will use their phone number and this code to log in.
                        </p>
                        <div className="bg-white p-3 rounded text-center">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Login Code</div>
                          <div className="text-3xl font-mono tracking-widest text-indigo-600 font-bold">
                            {inviteSuccess.loginCode}
                          </div>
                        </div>
                        <div className="mt-4 text-center">
                          <button
                            onClick={closeInviteModal}
                            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        {inviteError && (
                          <div className="mb-4 bg-red-50 text-red-700 p-3 rounded text-sm">
                            {inviteError}
                          </div>
                        )}
                        <form onSubmit={handleInvite} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                            <input
                              type="text"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={inviteForm.name}
                              onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input
                              type="tel"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={inviteForm.phone}
                              onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Company / Shop Name</label>
                            <input
                              type="text"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={inviteForm.company}
                              onChange={(e) => setInviteForm({ ...inviteForm, company: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">GST Number (Optional)</label>
                            <input
                              type="text"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={inviteForm.gst}
                              onChange={(e) => setInviteForm({ ...inviteForm, gst: e.target.value })}
                            />
                          </div>
                          <div className="pt-4 flex justify-end space-x-3">
                            <button
                              type="button"
                              onClick={closeInviteModal}
                              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={inviteLoading}
                              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                              {inviteLoading ? 'Generating...' : 'Invite & Generate Code'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
