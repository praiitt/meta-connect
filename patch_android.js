const fs = require('fs');

// 1. Patch settings.gradle
let settings = fs.readFileSync('android/settings.gradle', 'utf8');
if (!settings.includes('resolutionStrategy')) {
  const resStrategy = [
    '',
    '  resolutionStrategy {',
    '    eachPlugin {',
    '      if (requested.id.id == "org.jetbrains.kotlin.android") {',
    '        useVersion("2.1.20")',
    '      }',
    '      if (requested.id.id == "org.jetbrains.kotlin.jvm") {',
    '        useVersion("2.1.20")',
    '      }',
    '    }',
    '  }',
    ''
  ].join('\n');
  settings = settings.replace('pluginManagement {', 'pluginManagement {' + resStrategy);
  fs.writeFileSync('android/settings.gradle', settings);
  console.log('Patched settings.gradle');
}

// 2. Patch android/build.gradle
let buildGradle = fs.readFileSync('android/build.gradle', 'utf8');
if (!buildGradle.includes('Force all Kotlin')) {
  const forceBlock = [
    '',
    '',
    '// Force all Kotlin dependencies to 2.1.20',
    'allprojects {',
    '    configurations.all {',
    '        resolutionStrategy.eachDependency { details ->',
    '            if (details.requested.group == "org.jetbrains.kotlin") {',
    '                details.useVersion("2.1.20")',
    '            }',
    '            if (details.requested.group == "io.github.lukmccall.pika" && details.requested.name == "pika-compiler") {',
    '                details.useVersion("0.3.2-2.1.20")',
    '            }',
    '        }',
    '    }',
    '}',
    ''
  ].join('\n');
  buildGradle += forceBlock;
  fs.writeFileSync('android/build.gradle', buildGradle);
  console.log('Patched android/build.gradle');
}

// 3. KEY FIX: Patch expo-modules-core/android/build.gradle
const expoCorePath = 'node_modules/expo-modules-core/android/build.gradle';
let expoCore = fs.readFileSync(expoCorePath, 'utf8');

// Replace the line that uses Groovy ${kotlinVersion} with hardcoded 2.1.20
// Use line-by-line replacement to avoid any string escaping issues
const lines = expoCore.split('\n');
let replaced = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('kotlin.plugin.compose') && lines[i].includes('classpath')) {
    console.log('Found compose classpath line at line', i + 1, ':', lines[i].trim());
    lines[i] = '      classpath("org.jetbrains.kotlin.plugin.compose:org.jetbrains.kotlin.plugin.compose.gradle.plugin:2.1.20")';
    replaced = true;
    console.log('Replaced with hardcoded 2.1.20');
    break;
  }
}

if (!replaced) {
  console.log('WARNING: Could not find compose classpath line to replace!');
}

// Also add configurations.all to intercept kotlin-extension within this module
let confBlockAdded = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("apply plugin: 'com.android.library'") && !confBlockAdded) {
    const confLines = [
      '',
      '// kotlin-extension override - force 2.1.20 for all kotlin deps',
      'configurations.all {',
      '    resolutionStrategy.eachDependency { details ->',
      '        if (details.requested.group == "org.jetbrains.kotlin") {',
      '            details.useVersion("2.1.20")',
      '        }',
      '    }',
      '}',
      ''
    ];
    lines.splice(i, 0, ...confLines);
    confBlockAdded = true;
    console.log('Added configurations.all block before android library plugin');
    break;
  }
}

expoCore = lines.join('\n');
fs.writeFileSync(expoCorePath, expoCore);

// Verify
const verify = fs.readFileSync(expoCorePath, 'utf8');
const verifyLines = verify.split('\n');
const composeLine = verifyLines.find(l => l.includes('kotlin.plugin.compose') && l.includes('classpath'));
console.log('Verify compose line:', composeLine ? composeLine.trim() : 'NOT FOUND');
