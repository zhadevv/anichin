import { ScraperContext, ApiResponse } from '../types/common';
import { buildResponse, handleError } from '../utils/response';
import { parseListItem } from '../parser/card';
import { parsePagination } from '../parser/pagination';

const cheerio = require('cheerio');

export async function fetchSearch(ctx: ScraperContext, query: string, page: number = 1): Promise<ApiResponse> {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = page === 1 ? `/?s=${encodedQuery}` : `/page/${page}/?s=${encodedQuery}`;
        const response = await ctx.client.get(url);
        const $ = cheerio.load(response.data);
        const data: any = { query, items: [], pagination: {} };

        const container = $('.listupd');
        if (container.length) {
            container.find('.bs .bsx').each((_: any, el: any) => {
                data.items.push(parseListItem($, el, ctx.baseUrl));
            });
        }

        data.pagination = parsePagination($, ctx.baseUrl);

        return buildResponse(true, { search: data });
    } catch (error) {
        return handleError(error, 'parse search');
    }
}
