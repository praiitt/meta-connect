const fs = require('fs');
const path = '/opt/ad/.vibe_data/b5f35e45-44ea-4e44-b954-5e07369d3dab/workspace/app/(tabs)/cart.tsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure quantities are treated as numbers
content = content.replace(/updateQuantity\(item\.product\.id, item\.quantity - 1\)/g, 'updateQuantity(item.product.id, Number(item.quantity) - 1)');
content = content.replace(/updateQuantity\(item\.product\.id, item\.quantity \+ 1\)/g, 'updateQuantity(item.product.id, Number(item.quantity) + 1)');

// Also fix in cart display if needed
content = content.replace(/{item\.quantity <= item\.product\.moq/g, '{Number(item.quantity) <= Number(item.product.moq)');

fs.writeFileSync(path, content);
console.log('cart.tsx patched');
