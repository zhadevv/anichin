import { ScraperContext, ApiResponse } from '../types/common';
import { buildResponse, handleError } from '../utils/response';
import { parseTaxonomyListing } from '../parser/taxonomyListing';

const cheerio = require('cheerio');

export interface TaxonomyOptions {
    pageType: string;
    fieldName: string;
    buildUrl: (slug: string, page: number) => string;
    stripLabel?: string;
    context: string;
}

export async function fetchTaxonomyListing(
    ctx: ScraperContext,
    slug: string,
    page: number,
    options: TaxonomyOptions
): Promise<ApiResponse> {
    try {
        const url = options.buildUrl(slug, page);
        const response = await ctx.client.get(url);
        const $ = cheerio.load(response.data);

        const parsed = parseTaxonomyListing($, ctx.baseUrl, options.stripLabel);

        const data: any = {
            page_type: options.pageType,
            [options.fieldName]: {
                name: parsed.name,
                slug,
                total_pages: parsed.pagination.total_pages || 1,
            },
            lists: parsed.lists,
            pagination: parsed.pagination,
        };

        return buildResponse(true, data);
    } catch (error) {
        return handleError(error, options.context);
    }
}
