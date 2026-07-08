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

// 3. THE REAL FIX: Patch expo-modules-core/android/build.gradle
// The problem: expo-module-gradle-plugin (an included build) applies kotlin-android
// using its OWN classloader which has Kotlin 1.9.24 from react-native-gradle-plugin.
// Solution: explicitly add kotlin-gradle-plugin 2.1.20 to the buildscript classpath
// AND apply kotlin-android BEFORE expo-module-gradle-plugin does it.
// expo-module-gradle-plugin guards against double-apply, so it will skip.

const expoCorePath = 'node_modules/expo-modules-core/android/build.gradle';
let expoCore = fs.readFileSync(expoCorePath, 'utf8');

// Fix 3a: Replace ${kotlinVersion} in compose classpath line with 2.1.20
const lines = expoCore.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('kotlin.plugin.compose') && lines[i].includes('classpath')) {
    console.log('Found compose classpath at line', i + 1, ':', lines[i].trim());
    lines[i] = '      classpath("org.jetbrains.kotlin.plugin.compose:org.jetbrains.kotlin.plugin.compose.gradle.plugin:2.1.20")';
    console.log('Replaced compose classpath version with 2.1.20');
    break;
  }
}

// Fix 3b: Add kotlin-gradle-plugin:2.1.20 to expo-modules-core's own buildscript classpath
// This forces the correct Kotlin plugin to be first in the classpath for this subproject
let dependenciesBlockFound = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('dependencies {') && !dependenciesBlockFound && i < 25) {
    // This is the buildscript dependencies block
    dependenciesBlockFound = true;
    lines.splice(i + 1, 0, '    classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:2.1.20")');
    console.log('Added kotlin-gradle-plugin:2.1.20 to expo-modules-core buildscript classpath at line', i + 1);
    break;
  }
}

// Fix 3c: Apply kotlin-android BEFORE expo-module-gradle-plugin applies it
// This ensures our 2.1.20 version is used, not the 1.9.24 from included build classloader
let androidLibraryFound = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("apply plugin: 'com.android.library'") && !androidLibraryFound) {
    androidLibraryFound = true;
    // Insert kotlin-android apply right after com.android.library
    lines.splice(i + 1, 0, "apply plugin: 'kotlin-android' // Force 2.1.20 before expo-module-gradle-plugin");
    console.log('Added kotlin-android apply at line', i + 2);
    break;
  }
}

expoCore = lines.join('\n');
fs.writeFileSync(expoCorePath, expoCore);

// Verify
const verify = fs.readFileSync(expoCorePath, 'utf8');
console.log('Verify - has kotlin-gradle-plugin 2.1.20 classpath:', verify.includes('kotlin-gradle-plugin:2.1.20'));
console.log('Verify - has 2.1.20 compose classpath:', verify.includes('kotlin.plugin.compose.gradle.plugin:2.1.20'));
console.log('Verify - has early kotlin-android apply:', verify.includes("apply plugin: 'kotlin-android'"));
