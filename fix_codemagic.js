const fs = require('fs');
let yaml = fs.readFileSync('codemagic.yaml', 'utf8');

// We just need to add another block to the resolutionStrategy for kotlin-compose-compiler-plugin-embeddable
const replacement = `echo '                if (details.requested.group == \"org.jetbrains.kotlin\" && details.requested.name == \"kotlin-compose-compiler-plugin-embeddable\") {' >> build.gradle
          echo '                    details.useVersion(\"2.1.20\")' >> build.gradle
          echo '                }' >> build.gradle`;

yaml = yaml.replace(/echo '                }' >> build\.gradle/, "echo '                }' >> build.gradle\n          " + replacement);

fs.writeFileSync('codemagic.yaml', yaml);
console.log('Fixed codemagic.yaml to also intercept kotlin-compose-compiler-plugin-embeddable');
