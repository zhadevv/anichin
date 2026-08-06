import { parseListItem } from './card';
import { parsePagination } from './pagination';
import { extractSlug } from '../utils/slug';
import { resolveUrl } from '../utils/url';
import { AdvancedSearchFilter } from '../types/filters';

export function parseAdvancedSearchImagePage($: any, baseUrl: string, filter?: AdvancedSearchFilter): any {
    const data: any = {
        mode: 'image',
        title: '',
        applied_filters: filter || {},
        lists: [],
        pagination: {},
    };

    const header = $('.bixbox.bixboxarc.bbnofrm .releases h1 span');
    if (header.length) {
        data.title = header.text().trim();
    }

    $('.listupd article.bs').each((_: any, el: any) => {
        data.lists.push(parseListItem($, el, baseUrl));
    });

    data.pagination = parsePagination($, baseUrl);

    return data;
}

export function parseAdvancedSearchTextPage($: any, baseUrl: string): any {
    const data: any = {
        mode: 'text',
        title: '',
        results: {},
    };

    const header = $('.bixbox.bixboxarc.bbnofrm .releases h1 span');
    if (header.length) {
        data.title = header.text().trim();
    }

    const results = $('.soralist');
    if (results.length) {
        results.find('.blix').each((_: any, groupEl: any) => {
            const letterSpan = $(groupEl).find('span a');
            const letter = letterSpan.length ? letterSpan.text().trim() : $(groupEl).find('span').first().text().trim();

            if (letter) {
                const letterKey = letter.replace('#', 'hash');
                data.results[letterKey] = [];

                $(groupEl).find('ul li').each((_: any, itemEl: any) => {
                    const link = $(itemEl).find('a.series.tip');
                    if (link.length) {
                        const href = link.attr('href') || '';
                        data.results[letterKey].push({
                            title: link.text().trim(),
                            slug: extractSlug(href, baseUrl),
                            rel_id: link.attr('rel') || '',
                            url: resolveUrl(href, baseUrl),
                        });
                    }
                });
            }
        });
    }

    return data;
}
