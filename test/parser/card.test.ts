import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as cheerio from 'cheerio';
import { parseListItem } from '../../src/parser/card';

const BASE = 'https://anichin.cafe';

// Minimal markup matching the real .bsx card structure used across
// home/ongoing/completed/search/genre/studio/network/country listings.
const CARD_HTML = `
<div class="bsx">
  <a class="tip" href="/release-that-witch-episode-08-tamat-subtitle-indonesia/">
    <div class="typez">Donghua</div>
    <div class="limit">
      <img class="ts-post-image" src="https://anichin.cafe/thumb.jpg" />
    </div>
    <div class="tt"><h2>Release That Witch</h2></div>
    <div class="bt">
      <div class="epx">Episode 08</div>
      <div class="sb">Sub Indo</div>
    </div>
  </a>
</div>`;

test('parseListItem extracts title, slug, thumbnail, episode, type, badge and url', () => {
    const $ = cheerio.load(CARD_HTML);
    const item = parseListItem($, $('.bsx').get(0), BASE);

    assert.equal(item.title, 'Release That Witch');
    assert.equal(item.slug, 'release-that-witch');
    assert.equal(item.thumbnail, 'https://anichin.cafe/thumb.jpg');
    assert.equal(item.episode, 'Episode 08');
    assert.equal(item.type, 'Donghua');
    assert.equal(item.badge, 'Sub Indo');
    assert.equal(item.url, BASE + '/release-that-witch-episode-08-tamat-subtitle-indonesia/');
});
