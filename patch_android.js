const fs = require('fs');

// 1. Patch settings.gradle - inject resolutionStrategy into existing pluginManagement block
let settings = fs.readFileSync('android/settings.gradle', 'utf8');
const resStrategy = '\n  resolutionStrategy {\n    eachPlugin {\n      if (requested.id.id == "org.jetbrains.kotlin.android") {\n        useVersion("2.1.20")\n      }\n      if (requested.id.id == "org.jetbrains.kotlin.jvm") {\n        useVersion("2.1.20")\n      }\n    }\n  }\n';
settings = settings.replace('pluginManagement {', 'pluginManagement {' + resStrategy);
fs.writeFileSync('android/settings.gradle', settings);
console.log('Patched settings.gradle');

// 2. Patch build.gradle - force ALL kotlin deps to 2.1.20 using gradle.allprojects
let buildGradle = fs.readFileSync('android/build.gradle', 'utf8');
const forceBlock = '\n\n// Force all Kotlin dependencies to 2.1.20\ngradle.projectsEvaluated {\n    allprojects {\n        configurations.configureEach {\n            resolutionStrategy.eachDependency { details ->\n                if (details.requested.group == "org.jetbrains.kotlin") {\n                    details.useVersion("2.1.20")\n                }\n                if (details.requested.group == "io.github.lukmccall.pika" && details.requested.name == "pika-compiler") {\n                    details.useVersion("0.3.2-2.1.20")\n                }\n            }\n        }\n    }\n}\n';
buildGradle += forceBlock;
fs.writeFileSync('android/build.gradle', buildGradle);
console.log('Patched build.gradle');
