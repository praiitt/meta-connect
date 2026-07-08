const fs = require('fs');

// 1. Patch settings.gradle
let settings = fs.readFileSync('android/settings.gradle', 'utf8');
if (!settings.includes('resolutionStrategy')) {
  const resStrategy = '\n  resolutionStrategy {\n    eachPlugin {\n      if (requested.id.id == "org.jetbrains.kotlin.android") {\n        useVersion("2.1.20")\n      }\n      if (requested.id.id == "org.jetbrains.kotlin.jvm") {\n        useVersion("2.1.20")\n      }\n    }\n  }\n';
  settings = settings.replace('pluginManagement {', 'pluginManagement {' + resStrategy);
  fs.writeFileSync('android/settings.gradle', settings);
  console.log('Patched settings.gradle');
}

// 2. Patch android/build.gradle
let buildGradle = fs.readFileSync('android/build.gradle', 'utf8');
if (!buildGradle.includes('Force all Kotlin')) {
  const forceBlock = '\n\n// Force all Kotlin dependencies to 2.1.20\nallprojects {\n    configurations.all {\n        resolutionStrategy.eachDependency { details ->\n            if (details.requested.group == "org.jetbrains.kotlin") {\n                details.useVersion("2.1.20")\n            }\n            if (details.requested.group == "io.github.lukmccall.pika" && details.requested.name == "pika-compiler") {\n                details.useVersion("0.3.2-2.1.20")\n            }\n        }\n    }\n}\n';
  buildGradle += forceBlock;
  fs.writeFileSync('android/build.gradle', buildGradle);
  console.log('Patched android/build.gradle');
}

// 3. KEY FIX: Patch expo-modules-core/android/build.gradle
// Use Buffer-based replacement to avoid any JS string escaping issues
const expoCorePath = 'node_modules/expo-modules-core/android/build.gradle';
let expoCore = fs.readFileSync(expoCorePath, 'utf8');

// The exact target string (Groovy: )
const TARGET = 'classpath(org.jetbrains.kotlin.plugin.compose:org.jetbrains.kotlin.plugin.compose.gradle.plugin:)';
const REPLACEMENT = 'classpath(org.jetbrains.kotlin.plugin.compose:org.jetbrains.kotlin.plugin.compose.gradle.plugin:2.1.20)';

if (expoCore.includes(TARGET)) {
  expoCore = expoCore.split(TARGET).join(REPLACEMENT);
  console.log('Replaced kotlinVersion in expo-modules-core buildscript classpath');
} else {
  console.log('WARNING: Target string not found in expo-modules-core/android/build.gradle!');
  // Fallback: find line with kotlin.plugin.compose and replace it entirely
  const lines = expoCore.split('\n');
  const idx = lines.findIndex(l => l.includes('kotlin.plugin.compose') && l.includes('classpath'));
  if (idx !== -1) {
    console.log('Found via fallback at line', idx, ':', lines[idx]);
    lines[idx] = '      classpath(org.jetbrains.kotlin.plugin.compose:org.jetbrains.kotlin.plugin.compose.gradle.plugin:2.1.20)';
    expoCore = lines.join('\n');
    console.log('Fallback replacement done');
  }
}

// Also add configurations.all to intercept kotlin-extension
if (!expoCore.includes('kotlin-compose override')) {
  const confBlock = '\n// kotlin-compose override\nconfigurations.all {\n    resolutionStrategy.eachDependency { details ->\n        if (details.requested.group == "org.jetbrains.kotlin") {\n            details.useVersion("2.1.20")\n        }\n    }\n}\n';
  expoCore = expoCore.replace(apply plugin: com.android.library, confBlock + apply plugin: com.android.library);
}

fs.writeFileSync(expoCorePath, expoCore);

// Verify
const verify = fs.readFileSync(expoCorePath, 'utf8');
const hasOld = verify.includes('');
const hasNew = verify.includes('2.1.20');
console.log('Verify - old string gone:', !hasOld, '| new string present:', hasNew);
