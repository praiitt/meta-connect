const { withProjectBuildGradle, withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

const withKotlinFix = (config) => {
  // Step 1: Force Kotlin 2.2.0 in gradle.properties
  config = withGradleProperties(config, (config) => {
    // Remove any existing kotlinVersion property
    config.modResults = config.modResults.filter(
      item => !(item.type === 'property' && item.key === 'kotlinVersion')
    );
    
    // Add Kotlin 2.2.0
    config.modResults.push({
      type: 'property',
      key: 'kotlinVersion',
      value: '2.2.0',
    });
    
    return config;
  });

  // Step 2: Force Kotlin Gradle Plugin 2.2.0 in project-level build.gradle
  config = withProjectBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;
    
    // Remove any existing Kotlin plugin declarations
    buildGradle = buildGradle.replace(
      /classpath\s*\(?['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin:[^'"]+['"]\)?/g,
      ''
    );
    
    // Add Kotlin 2.2.0 plugin to buildscript dependencies
    if (buildGradle.includes('buildscript') && buildGradle.includes('dependencies')) {
      buildGradle = buildGradle.replace(
        /(buildscript\s*\{[\s\S]*?dependencies\s*\{)/,
        `$1
        classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:2.2.0')`
      );
    }
    
    config.modResults.contents = buildGradle;
    return config;
  });

  // Step 3: Force Kotlin 2.2.0 in app-level build.gradle
  config = withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;
    
    // Ensure kotlin-android plugin is applied
    if (!buildGradle.includes("apply plugin: 'kotlin-android'")) {
      buildGradle = buildGradle.replace(
        /(apply plugin:\s*['"]com\.android\.application['"])/,
        `$1\napply plugin: 'kotlin-android'`
      );
    }
    
    // Add kotlinOptions to android block if not present
    if (!buildGradle.includes('kotlinOptions')) {
      buildGradle = buildGradle.replace(
        /(android\s*\{[\s\S]*?)(}\s*dependencies)/,
        `$1
    kotlinOptions {
        jvmTarget = '17'
    }
$2`
      );
    }
    
    config.modResults.contents = buildGradle;
    return config;
  });

  return config;
};

module.exports = withKotlinFix;
