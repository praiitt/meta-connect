import Papa from 'papaparse';

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user?: {
    fullName?: string;
    companyName?: string;
    phoneNumber?: string;
  };
  orderItems?: Array<{
    quantity: number;
    product?: {
      name?: string;
      sku?: string;
    };
  }>;
}

interface User {
  id: string;
  fullName?: string;
  companyName?: string;
  phoneNumber?: string;
  gstNumber?: string;
  status?: string;
  createdAt?: string;
  _count?: {
    orders?: number;
  };
  totalRevenue?: number;
}

/**
 * Download CSV file to user's browser
 */
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Format date to readable string
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Export orders to CSV
 */
export function exportOrdersToCSV(orders: Order[]) {
  if (!orders || orders.length === 0) {
    alert('No orders to export');
    return;
  }

  const csvData = orders.map(order => {
    const items = order.orderItems?.map(item => 
      `${item.product?.name || 'Unknown'} (${item.quantity} units)`
    ).join('; ') || 'No items';

    return {
      'Order ID': order.id,
      'Customer Name': order.user?.fullName || 'N/A',
      'Company Name': order.user?.companyName || 'N/A',
      'Phone Number': order.user?.phoneNumber || 'N/A',
      'Total Amount (₹)': order.totalAmount.toFixed(2),
      'Status': order.status,
      'Order Date': formatDate(order.createdAt),
      'Number of Items': order.orderItems?.length || 0,
      'Order Items': items
    };
  });

  const csv = Papa.unparse(csvData);
  const filename = `metal-connect-orders-${getCurrentDate()}.csv`;
  
  downloadCSV(csv, filename);
}

/**
 * Export users to CSV
 */
export function exportUsersToCSV(users: User[]) {
  if (!users || users.length === 0) {
    alert('No users to export');
    return;
  }

  const csvData = users.map(user => ({
    'User ID': user.id,
    'Full Name': user.fullName || 'N/A',
    'Company Name': user.companyName || 'N/A',
    'Phone Number': user.phoneNumber || 'N/A',
    'GST Number': user.gstNumber || 'N/A',
    'Status': user.status || 'N/A',
    'Registered Date': user.createdAt ? formatDate(user.createdAt) : 'N/A',
    'Total Orders': user._count?.orders || 0,
    'Total Revenue (₹)': user.totalRevenue ? user.totalRevenue.toFixed(2) : '0.00'
  }));

  const csv = Papa.unparse(csvData);
  const filename = `metal-connect-users-${getCurrentDate()}.csv`;
  
  downloadCSV(csv, filename);
}

/**
 * Generic export data to CSV
 */
export function exportToCSV(filename: string, data: any[]) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }
  const csv = Papa.unparse(data);
  downloadCSV(csv, filename);
}
