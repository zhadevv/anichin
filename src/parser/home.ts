import { parseListItem } from './card';
import { parsePagination } from './pagination';
import { extractSlug } from '../utils/slug';
import { resolveUrl } from '../utils/url';

export function parseHomePage($: any, baseUrl: string): any {
    const data: any = {
        slider: [],
        popular_today: [],
        latest_release: [],
        recommendation: {},
        pagination: {},
    };

    const slider = $('#slidertwo .swiper-slide.item');
    slider.each((_: any, el: any) => {
        const backdrop = $(el).find('.backdrop');
        const info = $(el).find('.info');
        const titleLink = info.find('h2 a');
        const watchElem = $(el).find('.watch');
        const bgStyle = backdrop.attr('style') || '';
        const bgMatch = bgStyle.match(/url\(['"]?(.*?)['"]?\)/);
        const href = watchElem.attr('href') || '';
        data.slider.push({
            title: titleLink.attr('data-jtitle') || titleLink.text().trim(),
            slug: extractSlug(href, baseUrl),
            description: info.find('p').text().trim(),
            thumbnail: bgMatch ? bgMatch[1] : '',
            url: resolveUrl(href, baseUrl),
        });
    });

    const popularSection = $('.bixbox.bbnofrm:contains("Popular Today")');
    if (popularSection.length) {
        popularSection.find('.listupd.normal .bs .bsx').each((_: any, el: any) => {
            data.popular_today.push(parseListItem($, el, baseUrl));
        });
    }

    const latestContainer = $('.releases.latesthome');
    if (latestContainer.length) {
        const viewAllElem = latestContainer.find('.vl');
        data.pagination = {
            view_all: resolveUrl(viewAllElem.attr('href'), baseUrl),
            prev: '',
            next: '',
        };

        const itemsContainer = $('.listupd.normal');
        if (itemsContainer.length) {
            itemsContainer.find('.bs .bsx').each((_: any, el: any) => {
                data.latest_release.push(parseListItem($, el, baseUrl));
            });
        }

        const paginationContainer = $('.hpage');
        if (paginationContainer.length) {
            const prevElem = paginationContainer.find('a.l');
            const nextElem = paginationContainer.find('a.r');

            data.pagination.prev = resolveUrl(prevElem.attr('href'), baseUrl);
            data.pagination.next = resolveUrl(nextElem.attr('href'), baseUrl);
        }
    }

    const recSection = $('.series-gen');
    if (recSection.length) {
        data.recommendation.tabs = [];
        data.recommendation.data = {};
        recSection.find('.nav-tabs li').each((_: any, el: any) => {
            const link = $(el).find('a');
            data.recommendation.tabs.push({
                id: link.attr('href')?.replace('#', '') || '',
                name: link.text().trim(),
                active: $(el).hasClass('active'),
            });
        });
        recSection.find('.tab-pane').each((_: any, paneEl: any) => {
            const tabId = $(paneEl).attr('id') || '';
            data.recommendation.data[tabId] = [];
            $(paneEl).find('.bs .bsx').each((_: any, articleEl: any) => {
                const status = $(articleEl).find('.status').text().trim();
                const item: any = parseListItem($, articleEl, baseUrl);
                item.status = status;
                data.recommendation.data[tabId].push(item);
            });
        });
    }

    data.pagination = parsePagination($, baseUrl);

    return data;
}
