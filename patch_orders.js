const fs = require('fs');
const path = '/opt/ad/.vibe_data/b5f35e45-44ea-4e44-b954-5e07369d3dab/workspace/web/src/pages/Orders.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Printer icon
content = content.replace('Download } from \'lucide-react\'', 'Download, Printer } from \'lucide-react\'');

// 2. Import printReceipt
content = content.replace('import { exportOrdersToCSV } from \'../utils/csvExport\';', 
  "import { exportOrdersToCSV } from '../utils/csvExport';\nimport { printReceipt } from '../utils/printReceipt';");

// 3. Add automatic printing on confirm
const updateStatusRegex = /setOrders\(\(prev\) =>\s*prev\.map\(\(order\) =>\s*order\.id === orderId \? \{ \.\.\.order, status: newStatus as Order\['status'\] \} : order\s*\)\s*\);/;
if (updateStatusRegex.test(content)) {
  content = content.replace(updateStatusRegex, `
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
        )
      );
      
      // Auto-print if confirmed
      if (newStatus === 'CONFIRMED') {
        const orderToPrint = orders.find(o => o.id === orderId);
        if (orderToPrint) {
          const updatedPrintOrder = { ...orderToPrint, status: 'CONFIRMED' };
          printReceipt(updatedPrintOrder);
        }
      }
  `);
}

// 4. Add print button in table rows
const tableButtonRegex = /<Eye className="w-4 h-4 mr-1" \/> View Details\s*<\/button>/;
content = content.replace(tableButtonRegex, `<Eye className="w-4 h-4 mr-1" /> View Details
                      </button>
                      
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            printReceipt(order);
                          }}
                          className="ml-4 text-gray-600 hover:text-gray-900 flex items-center inline-flex"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4 mr-1" /> Print
                        </button>
                      )}`);

// 5. Add print button in modal
const modalTitleRegex = /<h3 className="text-lg font-medium text-gray-900">\s*Order #\{selectedOrder\.id\.slice\(0, 8\)\.toUpperCase\(\)\}\s*<\/h3>/;
content = content.replace(modalTitleRegex, `<div className="flex items-center gap-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </h3>
                {selectedOrder.status === 'CONFIRMED' && (
                  <button
                    onClick={() => printReceipt(selectedOrder)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                )}
              </div>`);

fs.writeFileSync(path, content);
console.log('Orders.tsx patched successfully');
