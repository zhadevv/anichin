import { ScraperContext, ApiResponse } from '../types/common';
import { fetchTaxonomyListing } from './taxonomy';

export async function fetchStudio(ctx: ScraperContext, slug: string, page: number = 1): Promise<ApiResponse> {
    return fetchTaxonomyListing(ctx, slug, page, {
        pageType: 'studio',
        fieldName: 'studio',
        context: 'parse studio',
        buildUrl: (s, p) => (p === 1 ? `/studio/${s}/` : `/studio/${s}/page/${p}/`),
    });
}
