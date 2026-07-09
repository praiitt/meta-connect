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

const lines = expoCore.split('\n');

// 3a. Replace ${kotlinVersion} in compose classpath line with 2.1.20
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('kotlin.plugin.compose') && lines[i].includes('classpath')) {
    lines[i] = '      classpath("org.jetbrains.kotlin.plugin.compose:org.jetbrains.kotlin.plugin.compose.gradle.plugin:2.1.20")';
    break;
  }
}

// 3b. Inject composeCompiler configuration block to forcefully decouple compiler plugin version from Kotlin core version
let composeApplyFound = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("apply plugin: 'org.jetbrains.kotlin.plugin.compose'") && !composeApplyFound) {
    composeApplyFound = true;
    const composeConfig = [
      '',
      '  // FORCE compose compiler to 2.1.20 so it doesnt default to 1.9.24',
      '  composeCompiler {',
      '      compilerPluginVersion = "2.1.20"',
      '  }',
      ''
    ];
    lines.splice(i + 1, 0, ...composeConfig);
    break;
  }
}

expoCore = lines.join('\n');
fs.writeFileSync(expoCorePath, expoCore);
console.log('Patched expo-modules-core/android/build.gradle with composeCompiler block');
