import { ListCardItem } from '../types/common';
import { extractSlug } from '../utils/slug';
import { resolveUrl } from '../utils/url';

export function parseListItem($: any, element: any, baseUrl: string): ListCardItem {
    const bsx = $(element);
    const link = bsx.find('a.tip');
    const typez = bsx.find('.typez');
    const epx = bsx.find('.epx');
    const sb = bsx.find('.sb');
    const img = bsx.find('img.ts-post-image');
    const h2 = bsx.find('.tt h2');
    const href = link.attr('href') || '';
    return {
        title: h2.text().trim() || '',
        slug: extractSlug(href, baseUrl),
        thumbnail: img.attr('src') || '',
        episode: epx.text().trim() || '',
        type: typez.text().trim() || '',
        badge: sb.text().trim() || '',
        url: resolveUrl(href, baseUrl),
    };
}
