const fs = require('fs');
const path = require('path');
const AnichinScraper = require('../src/index').default;

function ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function saveResponse(filename, response) {
    const dir = path.dirname(filename);
    ensureDirectory(dir);
    fs.writeFileSync(filename, JSON.stringify(response, null, 2));
    console.log(`Saved ${filename}`);
}

function createScraper(overrides) {
    return new AnichinScraper({
        baseUrl: 'https://anichin.cafe',
        requestDelay: 2000,
        ...overrides,
    });
}

module.exports = { ensureDirectory, saveResponse, createScraper };
