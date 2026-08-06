import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as cheerio from 'cheerio';
import { parsePagination } from '../../src/parser/pagination';

const BASE = 'https://anichin.cafe';

const PAGINATION_HTML = `
<div class="pagination">
  <a class="prev page-numbers" href="https://anichin.cafe/page/1/">Prev</a>
  <a class="page-numbers" href="https://anichin.cafe/page/1/">1</a>
  <span class="page-numbers current">2</span>
  <a class="page-numbers" href="https://anichin.cafe/page/3/">3</a>
  <a class="next page-numbers" href="https://anichin.cafe/page/3/">Next</a>
</div>`;

test('parsePagination reads current page, prev/next links and page numbers', () => {
    const $ = cheerio.load(PAGINATION_HTML);
    const pagination = parsePagination($, BASE);

    assert.equal(pagination.current_page, 2);
    assert.equal(pagination.has_prev, true);
    assert.equal(pagination.has_next, true);
    assert.equal(pagination.prev.url, 'https://anichin.cafe/page/1/');
    assert.equal(pagination.next.url, 'https://anichin.cafe/page/3/');
    assert.equal(pagination.total_pages, 3);
    assert.equal(pagination.pages.length, 3);
});

test('parsePagination defaults gracefully when there is no pagination markup', () => {
    const $ = cheerio.load('<div></div>');
    const pagination = parsePagination($, BASE);

    assert.equal(pagination.current_page, 1);
    assert.equal(pagination.has_prev, false);
    assert.equal(pagination.has_next, false);
    assert.equal(pagination.total_pages, 1);
});
