const fs = require('fs');
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));

const plugins = appJson.expo.plugins || [];
let ebpIndex = plugins.findIndex(p => Array.isArray(p) && p[0] === 'expo-build-properties');

if (ebpIndex !== -1) {
  if (!plugins[ebpIndex][1].android) plugins[ebpIndex][1].android = {};
  plugins[ebpIndex][1].android.kotlinVersion = '2.1.20';
} else {
  plugins.push(['expo-build-properties', { android: { kotlinVersion: '2.1.20' } }]);
}

appJson.expo.plugins = plugins;
fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));
console.log('Fixed app.json kotlinVersion to 2.1.20');
