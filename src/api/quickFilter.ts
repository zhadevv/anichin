import { ScraperContext, ApiResponse } from '../types/common';
import { buildResponse, handleError } from '../utils/response';
import { parseQuickFilterPage } from '../parser/quickFilter';

const cheerio = require('cheerio');

export async function fetchQuickFilter(ctx: ScraperContext): Promise<ApiResponse> {
    try {
        const response = await ctx.client.get('/seri/');
        const $ = cheerio.load(response.data);
        const data = parseQuickFilterPage($);
        return buildResponse(true, data);
    } catch (error) {
        return handleError(error, 'parse quickfilter');
    }
}
