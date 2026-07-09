const fs = require('fs');
const appJsonPath = '/opt/ad/.vibe_data/b5f35e45-44ea-4e44-b954-5e07369d3dab/workspace/app.json';
const data = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const plugins = data.expo.plugins;
const buildPropsPlugin = plugins.find(p => Array.isArray(p) && p[0] === 'expo-build-properties');

if (buildPropsPlugin) {
  buildPropsPlugin[1].android.compileSdkVersion = 36;
  buildPropsPlugin[1].android.targetSdkVersion = 36;
} else {
  plugins.push([
    "expo-build-properties",
    {
      "android": {
        "compileSdkVersion": 36,
        "targetSdkVersion": 36
      }
    }
  ]);
}

fs.writeFileSync(appJsonPath, JSON.stringify(data, null, 2));
