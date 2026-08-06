import { ScraperContext, ApiResponse } from '../types/common';
import { buildResponse, handleError } from '../utils/response';
import { parseSeasonPage } from '../parser/season';

const cheerio = require('cheerio');

export async function fetchSeason(ctx: ScraperContext, slug: string): Promise<ApiResponse> {
    try {
        const url = `/season/${slug}/`;
        const response = await ctx.client.get(url);
        const $ = cheerio.load(response.data);
        const parsed = parseSeasonPage($, ctx.baseUrl);

        const data: any = {
            page_type: 'seasons',
            season: {
                year: parsed.year,
                slug,
            },
            lists: parsed.lists,
            pagination: {
                has_pagination: false,
                note: 'Seasons page does not have pagination',
            },
        };

        return buildResponse(true, data);
    } catch (error) {
        return handleError(error, 'parse season');
    }
}
