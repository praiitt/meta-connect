const fs = require('fs');

// 1. Patch settings.gradle - inject resolutionStrategy into existing pluginManagement block
let settings = fs.readFileSync('android/settings.gradle', 'utf8');
if (!settings.includes('resolutionStrategy')) {
  const resStrategy = '\n  resolutionStrategy {\n    eachPlugin {\n      if (requested.id.id == "org.jetbrains.kotlin.android") {\n        useVersion("2.1.20")\n      }\n      if (requested.id.id == "org.jetbrains.kotlin.jvm") {\n        useVersion("2.1.20")\n      }\n    }\n  }\n';
  settings = settings.replace('pluginManagement {', 'pluginManagement {' + resStrategy);
  fs.writeFileSync('android/settings.gradle', settings);
  console.log('Patched settings.gradle');
}

// 2. Patch build.gradle - simple allprojects resolutionStrategy (no afterEvaluate)
let buildGradle = fs.readFileSync('android/build.gradle', 'utf8');
if (!buildGradle.includes('Force all Kotlin')) {
  const forceBlock = '\n\n// Force all Kotlin dependencies to 2.1.20\nallprojects {\n    configurations.all {\n        resolutionStrategy.eachDependency { details ->\n            if (details.requested.group == "org.jetbrains.kotlin") {\n                details.useVersion("2.1.20")\n            }\n            if (details.requested.group == "io.github.lukmccall.pika" && details.requested.name == "pika-compiler") {\n                details.useVersion("0.3.2-2.1.20")\n            }\n        }\n    }\n}\n';
  buildGradle += forceBlock;
  fs.writeFileSync('android/build.gradle', buildGradle);
  console.log('Patched build.gradle');
}

// 3. THE KEY FIX: Patch expo-modules-core/android/build.gradle directly
// Replace  in the buildscript block with a hardcoded 2.1.20
const expoCoreBuildGradle = 'node_modules/expo-modules-core/android/build.gradle';
let expoCore = fs.readFileSync(expoCoreBuildGradle, 'utf8');

// Replace the dynamic kotlinVersion with hardcoded 2.1.20 in the buildscript classpath
expoCore = expoCore.replace(
  'classpath(org.jetbrains.kotlin.plugin.compose:org.jetbrains.kotlin.plugin.compose.gradle.plugin:)',
  'classpath(org.jetbrains.kotlin.plugin.compose:org.jetbrains.kotlin.plugin.compose.gradle.plugin:2.1.20)'
);

fs.writeFileSync(expoCoreBuildGradle, expoCore);
console.log('Patched expo-modules-core/android/build.gradle to hardcode compose compiler version to 2.1.20');
