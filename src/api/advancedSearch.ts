import { ScraperContext, ApiResponse } from '../types/common';
import { AdvancedSearchFilter } from '../types/filters';
import { buildResponse, handleError } from '../utils/response';
import { parseAdvancedSearchImagePage, parseAdvancedSearchTextPage } from '../parser/advancedSearch';

const cheerio = require('cheerio');

function buildImageModeUrl(filter?: AdvancedSearchFilter, page: number = 1): string {
    let url = '/seri/';
    const params = new URLSearchParams();

    if (page > 1) {
        params.append('page', page.toString());
    }

    if (filter) {
        const singleValueFilters: Array<keyof AdvancedSearchFilter> = ['status', 'type', 'order', 'sub'];
        singleValueFilters.forEach(key => {
            const value = filter[key];
            if (typeof value === 'string' && value.trim() !== '') {
                params.append(key, value);
            }
        });

        const arrayFilterKeys: Array<{ key: keyof AdvancedSearchFilter; param: string }> = [
            { key: 'genres', param: 'genre[]' },
            { key: 'studios', param: 'studio[]' },
            { key: 'seasons', param: 'season[]' },
        ];
        arrayFilterKeys.forEach(({ key, param }) => {
            const values = filter[key];
            if (Array.isArray(values) && values.length > 0) {
                values.forEach(value => {
                    if (value && value.trim() !== '') {
                        params.append(param, value);
                    }
                });
            }
        });

        if (filter.per_page) {
            params.append('per_page', filter.per_page.toString());
        }
    }

    const queryString = params.toString();
    if (queryString) {
        url += `?${queryString}`;
    }

    return url;
}

async function fetchAdvancedSearchImageMode(ctx: ScraperContext, filter?: AdvancedSearchFilter, page: number = 1): Promise<ApiResponse> {
    try {
        const url = buildImageModeUrl(filter, page);
        const response = await ctx.client.get(url);
        const $ = cheerio.load(response.data);
        const data = parseAdvancedSearchImagePage($, ctx.baseUrl, filter);
        return buildResponse(true, data);
    } catch (error) {
        return handleError(error, 'image mode advanced search');
    }
}

async function fetchAdvancedSearchTextMode(ctx: ScraperContext): Promise<ApiResponse> {
    try {
        const response = await ctx.client.get('/seri/list-mode/');
        const $ = cheerio.load(response.data);
        const data = parseAdvancedSearchTextPage($, ctx.baseUrl);
        return buildResponse(true, data);
    } catch (error) {
        return handleError(error, 'text mode advanced search');
    }
}

export async function fetchAdvancedSearch(
    ctx: ScraperContext,
    mode: 'image' | 'text' = 'image',
    filter?: AdvancedSearchFilter,
    page: number = 1
): Promise<ApiResponse> {
    try {
        if (mode === 'text') {
            return await fetchAdvancedSearchTextMode(ctx);
        }
        return await fetchAdvancedSearchImageMode(ctx, filter, page);
    } catch (error) {
        return handleError(error, 'advanced search');
    }
}
