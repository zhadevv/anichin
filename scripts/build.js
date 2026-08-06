const { execFileSync } = require('child_process');

// Thin orchestrator around the npm-run-script build steps already defined
// in package.json ("build:types", "build:cjs", "build:esm", "build:browser").
// Kept as a standalone script so it can be invoked directly
// (`node scripts/build.js`) without going through npm, and so additional
// pre/post steps (e.g. asset copying) have a single place to live.
const STEPS = ['clean', 'build:types', 'build:cjs', 'build:esm', 'build:browser'];

function run(script) {
    console.log(`\n> npm run ${script}`);
    execFileSync('npm', ['run', script], { stdio: 'inherit' });
}

for (const step of STEPS) {
    run(step);
}

console.log('\nBuild complete: dist/cjs, dist/esm, dist/types, dist/javascript');
