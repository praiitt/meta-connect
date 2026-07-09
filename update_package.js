const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.dependencies = {
  ...pkg.dependencies,
  "@expo/metro-runtime": "~57.0.0",
  "expo": "~57.0.4",
  "expo-build-properties": "~57.0.0",
  "expo-constants": "~57.0.3",
  "expo-linking": "~57.0.2",
  "expo-router": "~57.0.4",
  "expo-status-bar": "~57.0.0",
  "expo-system-ui": "~57.0.0",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "react-native": "0.86.0",
  "react-native-safe-area-context": "~5.7.0",
  "react-native-screens": "4.25.2"
};

pkg.devDependencies = {
  ...pkg.devDependencies,
  "@types/react": "~19.2.2"
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("Updated package.json");
