export const printReceipt = (order: any) => {
  // Create an iframe to isolate printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const retailerName = order.user.company || order.user.name;
  const orderDate = new Date().toLocaleDateString();

  // Generate HTML content for 80mm thermal receipt
  const html = `
    <html>
      <head>
        <title>Receipt - Order #${order.id.slice(0, 8)}</title>
        <style>
          @page { margin: 0; }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 80mm;
            margin: 0;
            padding: 5mm;
            font-size: 14px;
            color: #000;
          }
          h2 { margin: 0 0 5px 0; font-size: 18px; }
          .header { text-align: center; margin-bottom: 15px; }
          .header div { margin-bottom: 2px; }
          .retailer { margin-bottom: 10px; font-weight: bold; font-size: 16px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
          .items { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .items th, .items td { text-align: left; padding: 4px 0; border-bottom: 1px dashed #ddd; vertical-align: top; }
          .items th { font-weight: bold; font-size: 12px; border-bottom: 1px solid #000; }
          .qty { text-align: right !important; width: 25%; }
          .product-name { width: 75%; padding-right: 5px; }
          .footer { text-align: center; margin-top: 15px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>METAL CONNECT</h2>
          <div>Order #: ${order.id.slice(0, 8).toUpperCase()}</div>
          <div>Date: ${orderDate}</div>
        </div>
        
        <div class="retailer">
          Retailer: ${retailerName}
        </div>
        
        <table class="items">
          <thead>
            <tr>
              <th class="product-name">Product</th>
              <th class="qty">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item: any) => `
              <tr>
                <td class="product-name">${item.product.name}</td>
                <td class="qty">${item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          *** CONFIRMED ORDER ***
        </div>
      </body>
    </html>
  `;

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    // Wait for the iframe content to load and apply styles before printing
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Cleanup iframe after printing dialog is closed
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 250);
  }
};
