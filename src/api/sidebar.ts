import { ScraperContext, ApiResponse } from '../types/common';
import { buildResponse, handleError } from '../utils/response';
import { parseSidebar } from '../parser/sidebar';

const cheerio = require('cheerio');

export async function fetchSidebar(ctx: ScraperContext): Promise<ApiResponse> {
    try {
        const response = await ctx.client.get('/');
        const $ = cheerio.load(response.data);
        const data = parseSidebar($, ctx.baseUrl);
        return buildResponse(true, data);
    } catch (error) {
        return handleError(error, 'parse sidebar');
    }
}
