import { ScraperContext, ApiResponse } from '../types/common';
import { buildResponse, handleError } from '../utils/response';
import { parseSeriesDetail } from '../parser/series';

const cheerio = require('cheerio');

export async function fetchSeries(ctx: ScraperContext, slug: string): Promise<ApiResponse> {
    try {
        const path = `/seri/${slug}/`;
        const response = await ctx.client.get(path);
        const $ = cheerio.load(response.data);
        const data = parseSeriesDetail($, ctx.baseUrl, slug, path);
        return buildResponse(true, { detail: data });
    } catch (error) {
        return handleError(error, 'parse series detail');
    }
}
