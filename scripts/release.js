const { readFileSync, writeFileSync } = require('fs');
const { execFileSync } = require('child_process');
const { join } = require('path');

// Bumps the version in package.json, updates CHANGELOG.md's top entry date
// isn't touched (that's written by hand, see CHANGELOG.md), commits, and
// tags the release. Does NOT push or publish — run `git push --follow-tags`
// and `npm run publish:npm` (scripts/publish.js) yourself once you've
// reviewed the commit.
//
// Usage: node scripts/release.js <patch|minor|major|X.Y.Z>

const pkgPath = join(__dirname, '..', 'package.json');

function bump(current, kind) {
    if (/^\d+\.\d+\.\d+$/.test(kind)) {
        return kind;
    }
    const [major, minor, patch] = current.split('.').map(Number);
    if (kind === 'major') return `${major + 1}.0.0`;
    if (kind === 'minor') return `${major}.${minor + 1}.0`;
    if (kind === 'patch') return `${major}.${minor}.${patch + 1}`;
    throw new Error(`Unknown bump kind "${kind}". Use patch, minor, major, or an explicit X.Y.Z.`);
}

function main() {
    const kind = process.argv[2];
    if (!kind) {
        console.error('Usage: node scripts/release.js <patch|minor|major|X.Y.Z>');
        process.exit(1);
    }

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const nextVersion = bump(pkg.version, kind);

    console.log(`Bumping version: ${pkg.version} -> ${nextVersion}`);
    pkg.version = nextVersion;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

    console.log('Reminder: add a matching entry to CHANGELOG.md before committing if you have not already.');

    execFileSync('git', ['add', 'package.json'], { stdio: 'inherit' });
    execFileSync('git', ['commit', '-m', `chore(release): v${nextVersion}`], { stdio: 'inherit' });
    execFileSync('git', ['tag', `v${nextVersion}`], { stdio: 'inherit' });

    console.log(`\nTagged v${nextVersion}. Next steps:`);
    console.log('  git push --follow-tags');
    console.log('  npm run publish:npm');
}

main();
