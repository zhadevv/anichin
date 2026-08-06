import { ScraperContext, ApiResponse } from '../types/common';
import { fetchTaxonomyListing } from './taxonomy';

export async function fetchGenre(ctx: ScraperContext, slug: string, page: number = 1): Promise<ApiResponse> {
    return fetchTaxonomyListing(ctx, slug, page, {
        pageType: 'genres',
        fieldName: 'genre',
        stripLabel: 'Genre:',
        context: 'parse genres',
        buildUrl: (s, p) => (p === 1 ? `/genres/${s}/` : `/genres/${s}/page/${p}/`),
    });
}
