import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchWatch } from '../../src/api/watch';

const BASE = 'https://anichin.cafe';

function loadFixtureHtml(name: string) {
    return readFileSync(join(__dirname, '..', 'fixtures', 'watch', name), 'utf-8');
}

// Regression test for the v0.0.5 fix: a completed series' final episode must
// be found via the "-tamat-" URL fallback after the regular URL 404s, and
// exactly two requests should be made (no more, no less).
test('fetchWatch falls back to the tamat URL when the regular URL 404s, in exactly two requests', async () => {
    const requestedPaths: string[] = [];
    const tamatHtml = loadFixtureHtml('episode-tamat.html');

    const client = {
        get: async (path: string) => {
            requestedPaths.push(path);
            if (path.includes('-tamat-')) {
                return { status: 200, data: tamatHtml };
            }
            return { status: 404, data: 'not found' };
        },
    };

    const result = await fetchWatch({ client, baseUrl: BASE }, 'release-that-witch', 8);

    assert.equal(requestedPaths.length, 2, 'expected exactly two requests: regular then tamat');
    assert.equal(requestedPaths[0], '/release-that-witch-episode-08-subtitle-indonesia/');
    assert.equal(requestedPaths[1], '/release-that-witch-episode-08-tamat-subtitle-indonesia/');
    assert.equal(result.success, true);
    assert.equal(result.data.watch.is_final_episode, true);
});

test('fetchWatch makes only one request when the regular (ongoing) URL succeeds', async () => {
    const requestedPaths: string[] = [];
    const ongoingHtml = loadFixtureHtml('episode-ongoing.html');

    const client = {
        get: async (path: string) => {
            requestedPaths.push(path);
            return { status: 200, data: ongoingHtml };
        },
    };

    const result = await fetchWatch({ client, baseUrl: BASE }, 'some-ongoing-series', 1);

    assert.equal(requestedPaths.length, 1, 'no fallback request should be made when the regular URL succeeds');
    assert.equal(result.success, true);
    assert.equal(result.data.watch.is_final_episode, false);
});

test('fetchWatch returns a failure response when both URL patterns 404', async () => {
    const client = {
        get: async () => ({ status: 404, data: 'not found' }),
    };

    const result = await fetchWatch({ client, baseUrl: BASE }, 'nonexistent-series', 999);

    assert.equal(result.success, false);
    assert.match(result.message || '', /not found/i);
});

test('fetchWatch pads single-digit episode numbers in both URL candidates', async () => {
    const requestedPaths: string[] = [];
    const client = {
        get: async (path: string) => {
            requestedPaths.push(path);
            return { status: 404, data: 'not found' };
        },
    };

    await fetchWatch({ client, baseUrl: BASE }, 'some-series', 5);

    assert.equal(requestedPaths[0], '/some-series-episode-05-subtitle-indonesia/');
    assert.equal(requestedPaths[1], '/some-series-episode-05-tamat-subtitle-indonesia/');
});
