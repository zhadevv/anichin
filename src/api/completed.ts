import { ScraperContext, ApiResponse } from '../types/common';
import { fetchSimpleListing } from './simpleListing';

export async function fetchCompleted(ctx: ScraperContext, page: number = 1): Promise<ApiResponse> {
    return fetchSimpleListing(
        ctx,
        p => (p === 1 ? '/completed/' : `/completed/page/${p}/`),
        page,
        'parse completed'
    );
}
