import { ScraperContext, ApiResponse } from '../types/common';
import { buildResponse, handleError } from '../utils/response';
import { parseListItem } from '../parser/card';
import { parsePagination } from '../parser/pagination';

const cheerio = require('cheerio');

// Shared fetcher for the simple paginated listing pages (ongoing, completed, az-list)
// which all render the same `.listupd article.bs` card grid.
export async function fetchSimpleListing(
    ctx: ScraperContext,
    buildUrl: (page: number) => string,
    page: number,
    context: string
): Promise<ApiResponse> {
    try {
        const url = buildUrl(page);
        const response = await ctx.client.get(url);
        const $ = cheerio.load(response.data);
        const data: any = { lists: [], pagination: {} };

        $('.listupd article.bs').each((_: any, el: any) => {
            data.lists.push(parseListItem($, el, ctx.baseUrl));
        });

        data.pagination = parsePagination($, ctx.baseUrl);

        return buildResponse(true, data);
    } catch (error) {
        return handleError(error, context);
    }
}
