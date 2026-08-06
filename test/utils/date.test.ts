import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatCountdown, formatReleaseTime } from '../../src/utils/date';

test('formatCountdown returns "Unknown" for empty input', () => {
    assert.equal(formatCountdown(''), 'Unknown');
});

test('formatCountdown returns "Already released" for negative seconds', () => {
    assert.equal(formatCountdown('-100'), 'Already released');
});

test('formatCountdown formats seconds into days/hours/minutes', () => {
    const twoDays = 2 * 24 * 3600 + 3 * 3600 + 15 * 60;
    assert.equal(formatCountdown(String(twoDays)), '2d 3h 15m');
});

test('formatCountdown formats sub-day durations without a day component', () => {
    const threeHours = 3 * 3600 + 5 * 60;
    assert.equal(formatCountdown(String(threeHours)), '3h 5m');
});

test('formatCountdown formats sub-hour durations as minutes only', () => {
    assert.equal(formatCountdown('120'), '2m');
});

test('formatReleaseTime returns "Unknown" for empty input', () => {
    assert.equal(formatReleaseTime(''), 'Unknown');
});

test('formatReleaseTime formats a unix timestamp as HH:MM', () => {
    const result = formatReleaseTime('1700000000');
    assert.match(result, /^At \d{2}:\d{2}$/);
});
