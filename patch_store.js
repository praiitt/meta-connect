const fs = require('fs');
const path = '/opt/ad/.vibe_data/b5f35e45-44ea-4e44-b954-5e07369d3dab/workspace/store/useCartStore.ts';
let content = fs.readFileSync(path, 'utf8');

// Ensure quantities and MOQs are numbers
content = content.replace(/const safeQuantity = Math\.max\(quantity, product\.moq\);/g, 'const safeQuantity = Math.max(Number(quantity), Number(product.moq));');
content = content.replace(/quantity: newItems\[existingItemIndex\]\.quantity \+ safeQuantity/g, 'quantity: Number(newItems[existingItemIndex].quantity) + safeQuantity');
content = content.replace(/const safeQuantity = Math\.max\(quantity, item\.product\.moq\);/g, 'const safeQuantity = Math.max(Number(quantity), Number(item.product.moq));');

fs.writeFileSync(path, content);
console.log('useCartStore.ts patched');
