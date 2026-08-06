import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import { parseWatchPage } from '../../src/parser/watch';
import { extractSlug } from '../../src/utils/slug';

const BASE = 'https://anichin.cafe';

function loadFixture(name: string) {
    const html = readFileSync(join(__dirname, '..', 'fixtures', 'watch', name), 'utf-8');
    return cheerio.load(html);
}

// This fixture is the real captured page for the FINAL episode of "Release
// That Witch" (episode 8), served at the "-tamat-" URL. It is the exact
// regression case for the v0.0.5 watch() fix.
test('parseWatchPage marks a tamat-fixture page as the final episode when told so', () => {
    const $ = loadFixture('episode-tamat.html');
    const path = '/release-that-witch-episode-08-tamat-subtitle-indonesia/';
    const data = parseWatchPage($, BASE, 'release-that-witch', 8, '08', path, true);

    assert.equal(data.is_final_episode, true);
    assert.equal(data.url, BASE + path);
    assert.ok(data.title.length > 0, 'title should be populated from the fixture');
});

test('parseWatchPage extracts the numeric post id from the shortlink on the tamat fixture', () => {
    const $ = loadFixture('episode-tamat.html');
    const data = parseWatchPage(
        $, BASE, 'release-that-witch', 8, '08',
        '/release-that-witch-episode-08-tamat-subtitle-indonesia/', true
    );
    assert.match(data.id, /^\d+$/, 'id should be a numeric WordPress post id');
});

test('parseWatchPage on a regular (non-final) episode fixture reports is_final_episode=false', () => {
    const $ = loadFixture('episode-ongoing.html');
    const path = '/some-series-episode-01-subtitle-indonesia/';
    const data = parseWatchPage($, BASE, 'some-series', 1, '01', path, false);

    assert.equal(data.is_final_episode, false);
    assert.ok(data.title.length > 0);
});

test('parseWatchPage handles a late-numbered ongoing episode fixture (episode 138)', () => {
    const $ = loadFixture('episode-late.html');
    const path = '/some-series-episode-138-subtitle-indonesia/';
    const data = parseWatchPage($, BASE, 'some-series', 138, '138', path, false);

    assert.equal(data.episode_number_formatted, '138');
    assert.equal(data.is_final_episode, false);
});

test('extractSlug correctly strips the -tamat- URL found in the tamat fixture canonical link', () => {
    const $ = loadFixture('episode-tamat.html');
    const canonical = $('link[rel="canonical"]').attr('href') || '';
    assert.match(canonical, /-tamat-subtitle-indonesia/);
    assert.equal(extractSlug(canonical, BASE), 'release-that-witch');
});
