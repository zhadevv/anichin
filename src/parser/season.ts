import { extractSlug } from '../utils/slug';
import { resolveUrl } from '../utils/url';

export function parseSeasonPage($: any, baseUrl: string): any {
    const data: any = {
        year: '',
        lists: [],
    };

    const seasonHeader = $('.newseason h1');
    if (seasonHeader.length) {
        data.year = seasonHeader.text().trim();
    }

    $('.card').each((_: any, el: any) => {
        const card = $(el);
        const cardBox = card.find('.card-box');
        const cardLink = cardBox.find('a');
        const thumb = card.find('.card-thumb');
        const img = thumb.find('img');
        const cardTitle = thumb.find('.card-title');
        const studioSpan = cardTitle.find('.studio');
        const cardInfo = card.find('.card-info');

        const episodesInfo = cardInfo.find('.stats .left span').first().text().trim();
        const ratingText = cardInfo.find('.stats .right span').text().trim();
        const description = cardInfo.find('.desc p').text().trim();

        const genreList: Array<{ name: string; slug: string; url: string }> = [];
        cardInfo.find('.card-info-bottom a[rel="tag"]').each((_: any, genreEl: any) => {
            const genreHref = $(genreEl).attr('href') || '';
            genreList.push({
                name: $(genreEl).text().trim(),
                slug: extractSlug(genreHref, baseUrl),
                url: resolveUrl(genreHref, baseUrl),
            });
        });

        const episodesMatch = episodesInfo.match(/(\d+)\s+episodes/);
        const typeMatch = episodesInfo.match(/·\s+(.+)/);

        data.lists.push({
            title: cardTitle.find('h2').text().trim(),
            slug: extractSlug(cardLink.attr('href') || '', baseUrl),
            post_id: cardLink.attr('rel') || '',
            thumbnail: img.attr('src') || '',
            studio: {
                name: studioSpan.text().trim(),
                color_class: studioSpan.attr('class') || '',
            },
            episodes_info: episodesInfo,
            type: typeMatch ? typeMatch[1].trim() : '',
            episodes_count: episodesMatch ? parseInt(episodesMatch[1]) : 0,
            status: cardInfo.find('.status').text().trim(),
            alternative_titles: cardInfo.find('.alternative').text().trim(),
            rating: parseFloat(ratingText) || 0,
            description,
            genres: genreList,
            url: resolveUrl(cardLink.attr('href'), baseUrl),
        });
    });

    return data;
}
