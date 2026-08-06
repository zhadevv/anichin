import { ScraperContext, ApiResponse } from '../types/common';
import { buildResponse, handleError } from '../utils/response';
import { parseHomePage } from '../parser/home';

const cheerio = require('cheerio');

export async function fetchHome(ctx: ScraperContext, page: number = 1): Promise<ApiResponse> {
    try {
        const url = page === 1 ? '/' : `/page/${page}/`;
        const response = await ctx.client.get(url);
        const $ = cheerio.load(response.data);
        const data = parseHomePage($, ctx.baseUrl);
        return buildResponse(true, { home: data });
    } catch (error) {
        return handleError(error, 'parse home');
    }
}
