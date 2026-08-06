import { ScraperContext, ApiResponse } from '../types/common';
import { fetchTaxonomyListing } from './taxonomy';

export async function fetchNetwork(ctx: ScraperContext, slug: string, page: number = 1): Promise<ApiResponse> {
    return fetchTaxonomyListing(ctx, slug, page, {
        pageType: 'network',
        fieldName: 'network',
        context: 'parse network',
        buildUrl: (s, p) => (p === 1 ? `/network/${s}/` : `/network/${s}/page/${p}/`),
    });
}
