import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatEpisodeNumber, extractEpisodeNumber } from '../../src/utils/number';

test('formatEpisodeNumber pads single-digit episodes with a leading zero', () => {
    assert.equal(formatEpisodeNumber(8), '08');
    assert.equal(formatEpisodeNumber(1), '01');
});

test('formatEpisodeNumber leaves double-digit-and-up episodes unpadded', () => {
    assert.equal(formatEpisodeNumber(10), '10');
    assert.equal(formatEpisodeNumber(138), '138');
});

test('extractEpisodeNumber pulls the first number out of a text label', () => {
    assert.equal(extractEpisodeNumber('Episode 08'), '08');
    assert.equal(extractEpisodeNumber('Ep 138'), '138');
});

test('extractEpisodeNumber returns empty string when there is no number', () => {
    assert.equal(extractEpisodeNumber('Coming Soon'), '');
    assert.equal(extractEpisodeNumber(''), '');
});
