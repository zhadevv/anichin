const { rmSync, existsSync } = require('fs');
const { join } = require('path');

const dist = join(__dirname, '..', 'dist');

if (existsSync(dist)) {
    rmSync(dist, { recursive: true, force: true });
    console.log('Removed dist/');
} else {
    console.log('dist/ does not exist, nothing to clean');
}
