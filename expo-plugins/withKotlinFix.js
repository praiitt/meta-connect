const { withProjectBuildGradle, withGradleProperties } = require('@expo/config-plugins');

const withKotlinFix = (config) => {
  // Force Kotlin 2.2.0 in gradle.properties
  config = withGradleProperties(config, (config) => {
    config.modResults.push({
      type: 'property',
      key: 'kotlinVersion',
      value: '2.2.0',
    });
    return config;
  });

  // Force Kotlin Gradle Plugin 2.2.0 in project build.gradle
  config = withProjectBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;
    
    // Add Kotlin plugin to buildscript dependencies if not present
    if (!buildGradle.includes('org.jetbrains.kotlin:kotlin-gradle-plugin:2.2.0')) {
      config.modResults.contents = buildGradle.replace(
        /dependencies\s*\{/,
        `dependencies {
        classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:2.2.0')`
      );
    }
    
    return config;
  });

  return config;
};

module.exports = withKotlinFix;
