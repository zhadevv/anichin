import { ScraperContext, ApiResponse } from '../types/common';
import { fetchTaxonomyListing } from './taxonomy';

export async function fetchCountry(ctx: ScraperContext, slug: string, page: number = 1): Promise<ApiResponse> {
    return fetchTaxonomyListing(ctx, slug, page, {
        pageType: 'country',
        fieldName: 'country',
        context: 'parse country',
        buildUrl: (s, p) => (p === 1 ? `/country/${s}/` : `/country/${s}/page/${p}/`),
    });
}
