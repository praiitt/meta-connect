const fs = require('fs');
const path = '/opt/ad/.vibe_data/b5f35e45-44ea-4e44-b954-5e07369d3dab/workspace/web/src/pages/Orders.tsx';
let content = fs.readFileSync(path, 'utf8');

// Import Printer icon
if (!content.includes('Printer')) {
  content = content.replace('Download } from \'lucide-react\'', 'Download, Printer } from \'lucide-react\'');
}

// Add Print button in the table actions
// Find: <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
// We need to add a print button if status is CONFIRMED
const tableActionRegex = /<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">\s*<button\s*onClick=\{\(\) => setSelectedOrder\(order\)\}/;
if (tableActionRegex.test(content)) {
  content = content.replace(tableActionRegex, `<td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => printReceipt(order)}
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" /> Print
                      </button>
                    )}
                  </td>
                  {/* `);
  // Remove the old button
  content = content.replace(/<button\s*onClick=\{\(\) => setSelectedOrder\(order\)\}\s*className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"\s*>\s*<Eye className="w-4 h-4" \/> View Details\s*<\/button>\s*<\/td>/, ' */}');
}

// Ensure the printReceipt function is properly imported
if (!content.includes('import { printReceipt }')) {
  content = content.replace('import { exportOrdersToCSV }', 'import { exportOrdersToCSV }\nimport { printReceipt } from \'../utils/printReceipt\';');
}

// Add print button in the modal header
const modalHeaderRegex = /<h3 className="text-lg font-medium text-gray-900">\s*Order Details\s*<\/h3>/;
if (modalHeaderRegex.test(content)) {
  content = content.replace(modalHeaderRegex, `<div className="flex items-center gap-4">
              <h3 className="text-lg font-medium text-gray-900">
                Order Details
              </h3>
              {selectedOrder?.status === 'CONFIRMED' && (
                <button
                  onClick={() => printReceipt(selectedOrder)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
              )}
            </div>`);
}

fs.writeFileSync(path, content);
console.log('Orders.tsx patched');
