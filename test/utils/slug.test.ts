import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractSlug, isTamatPath } from '../../src/utils/slug';

const BASE = 'https://anichin.cafe';

test('extractSlug strips the regular episode URL suffix', () => {
    const slug = extractSlug(
        'https://anichin.cafe/release-that-witch-episode-08-subtitle-indonesia/',
        BASE
    );
    assert.equal(slug, 'release-that-witch');
});

test('extractSlug strips the tamat (completed) episode URL suffix', () => {
    const slug = extractSlug(
        'https://anichin.cafe/release-that-witch-episode-08-tamat-subtitle-indonesia/',
        BASE
    );
    assert.equal(slug, 'release-that-witch');
});

test('extractSlug handles multi-digit episode numbers on both patterns', () => {
    assert.equal(
        extractSlug('https://anichin.cafe/some-series-episode-138-subtitle-indonesia/', BASE),
        'some-series'
    );
    assert.equal(
        extractSlug('https://anichin.cafe/some-series-episode-138-tamat-subtitle-indonesia/', BASE),
        'some-series'
    );
});

test('extractSlug handles /seri/ detail URLs', () => {
    assert.equal(extractSlug('https://anichin.cafe/seri/release-that-witch/', BASE), 'release-that-witch');
});

test('extractSlug handles /genres/ URLs', () => {
    assert.equal(extractSlug('https://anichin.cafe/genres/action/', BASE), 'action');
});

test('extractSlug returns empty string for empty input', () => {
    assert.equal(extractSlug('', BASE), '');
});

test('isTamatPath detects the tamat URL pattern', () => {
    assert.equal(isTamatPath('/release-that-witch-episode-08-tamat-subtitle-indonesia/'), true);
});

test('isTamatPath returns false for the regular URL pattern', () => {
    assert.equal(isTamatPath('/release-that-witch-episode-08-subtitle-indonesia/'), false);
});
