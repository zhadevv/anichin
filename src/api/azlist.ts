import { ScraperContext, ApiResponse } from '../types/common';
import { fetchSimpleListing } from './simpleListing';

export async function fetchAzList(ctx: ScraperContext, page: number = 1, letter?: string): Promise<ApiResponse> {
    return fetchSimpleListing(
        ctx,
        p => {
            if (letter) {
                return p === 1 ? `/az-lists/?show=${letter}` : `/az-lists/page/${p}/?show=${letter}`;
            }
            return p === 1 ? '/az-lists/' : `/az-lists/page/${p}/`;
        },
        page,
        'parse A-Z list'
    );
}
