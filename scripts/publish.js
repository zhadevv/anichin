const { execFileSync } = require('child_process');
const { readFileSync } = require('fs');
const { join } = require('path');

// Runs the full build + test suite, confirms the working tree is clean,
// then publishes to npm. Meant to be run after scripts/release.js has
// already bumped the version and tagged the commit.
function run(cmd, args) {
    execFileSync(cmd, args, { stdio: 'inherit' });
}

function main() {
    const status = execFileSync('git', ['status', '--porcelain']).toString().trim();
    if (status) {
        console.error('Working tree is not clean. Commit or stash changes before publishing.');
        process.exit(1);
    }

    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
    console.log(`Publishing ${pkg.name}@${pkg.version}...`);

    run('npm', ['run', 'build']);
    run('npm', ['run', 'test:unit']);
    run('npm', ['publish', '--access', 'public']);

    console.log(`\nPublished ${pkg.name}@${pkg.version}.`);
}

main();
