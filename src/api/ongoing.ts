import { ScraperContext, ApiResponse } from '../types/common';
import { fetchSimpleListing } from './simpleListing';

export async function fetchOngoing(ctx: ScraperContext, page: number = 1): Promise<ApiResponse> {
    return fetchSimpleListing(
        ctx,
        p => (p === 1 ? '/ongoing/' : `/ongoing/page/${p}/`),
        page,
        'parse ongoing'
    );
}
