import { parsePagination } from './pagination';
import { PaginationData } from '../types/common';
import { extractSlug } from '../utils/slug';
import { resolveUrl } from '../utils/url';

export interface TaxonomyListingResult {
    name: string;
    lists: any[];
    pagination: PaginationData;
}

// Shared parser for the genre / studio / network / country listing pages,
// which all share the same markup structure on Anichin.
export function parseTaxonomyListing($: any, baseUrl: string, stripLabel?: string): TaxonomyListingResult {
    const result: TaxonomyListingResult = {
        name: '',
        lists: [],
        pagination: parsePagination($, baseUrl),
    };

    const header = $('.bixbox .releases h1 span');
    if (header.length) {
        let name = header.text().trim();
        if (stripLabel) {
            name = name.replace(stripLabel, '').trim();
        }
        result.name = name;
    }

    $('article.bs').each((_: any, el: any) => {
        const bsx = $(el);
        const link = bsx.find('a.tip');
        const typez = bsx.find('.typez');
        const epx = bsx.find('.epx');
        const sb = bsx.find('.sb');
        const img = bsx.find('img.ts-post-image');
        const h2 = bsx.find('.tt h2');
        const href = link.attr('href') || '';
        result.lists.push({
            title: h2.text().trim() || '',
            slug: extractSlug(href, baseUrl),
            thumbnail: img.attr('src') || '',
            episode: epx.text().trim() || '',
            type: typez.text().trim() || '',
            badge: sb.text().trim() || '',
            url: resolveUrl(href, baseUrl),
        });
    });

    return result;
}
