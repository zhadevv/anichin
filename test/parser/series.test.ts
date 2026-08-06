import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import { parseSeriesDetail } from '../../src/parser/series';

const BASE = 'https://anichin.cafe';

function loadFixture(name: string) {
    const html = readFileSync(join(__dirname, '..', 'fixtures', 'series', name), 'utf-8');
    return cheerio.load(html);
}

test('parseSeriesDetail reads the title from the with-banner fixture', () => {
    const $ = loadFixture('with-banner.html');
    const data = parseSeriesDetail($, BASE, 'battle-through-the-heavens-season-5', '/seri/battle-through-the-heavens-season-5/');
    assert.equal(data.title, 'Battle Through the Heavens Season 5');
});

test('parseSeriesDetail populates the episode list from the with-banner fixture', () => {
    const $ = loadFixture('with-banner.html');
    const data = parseSeriesDetail($, BASE, 'battle-through-the-heavens-season-5', '/seri/battle-through-the-heavens-season-5/');
    assert.ok(data.episodes.length > 0, 'expected at least one episode entry');
    assert.ok(data.episodes[0].url.startsWith(BASE));
});

test('parseSeriesDetail builds a first_episode url using the non-tamat pattern', () => {
    const $ = loadFixture('with-banner.html');
    const data = parseSeriesDetail($, BASE, 'battle-through-the-heavens-season-5', '/seri/battle-through-the-heavens-season-5/');
    if (data.episode_nav.first_episode.number) {
        assert.match(data.episode_nav.first_episode.url, /-episode-\d+-subtitle-indonesia\/$/);
    }
});

test('parseSeriesDetail also reads the title from the without-banner fixture', () => {
    const $ = loadFixture('without-banner.html');
    const data = parseSeriesDetail($, BASE, 'some-series', '/seri/some-series/');
    assert.ok(data.title.length > 0, 'title should be populated even without a banner image');
});
