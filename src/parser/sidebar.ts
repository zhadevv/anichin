import { SidebarData } from '../types/sidebar';
import { extractSlug } from '../utils/slug';
import { resolveUrl } from '../utils/url';

function parseFilterGroup($: any, container: any, filterType: string, inputType: 'checkbox' | 'radio', withChecked: boolean) {
    const label = filterType.charAt(0).toUpperCase() + filterType.slice(1);
    const filterDiv = container.find(`.filter.dropdown:contains("${label}")`);
    if (!filterDiv.length) return null;

    const items: Array<{ value: string; label: string; checked?: boolean }> = [];
    filterDiv.find(`input[type="${inputType}"]`).each((_: any, el: any) => {
        const item: any = {
            value: $(el).attr('value') || '',
            label: $(el).next('label').text().trim(),
        };
        if (withChecked) {
            item.checked = $(el).is(':checked');
        }
        items.push(item);
    });

    return {
        label: filterDiv.find('.dropdown-toggle').text().trim(),
        type: inputType,
        multiple: inputType === 'checkbox',
        items,
    };
}

export function parseSidebar($: any, baseUrl: string): SidebarData {
    const data: SidebarData = {};
    const sidebar = $('#sidebar');

    const quickFilter = sidebar.find('.quickfilter');
    if (quickFilter.length) {
        data.quick_filter = { checkbox_filters: {}, radio_filters: {} };

        ['genre', 'studio', 'season'].forEach(filterType => {
            const group = parseFilterGroup($, quickFilter, filterType, 'checkbox', true);
            if (group) data.quick_filter!.checkbox_filters[filterType] = group;
        });

        ['status', 'type', 'order'].forEach(filterType => {
            const group = parseFilterGroup($, quickFilter, filterType, 'radio', true);
            if (group) data.quick_filter!.radio_filters[filterType] = group;
        });
    }

    const ongoingSection = sidebar.find('.releases:contains("Ongoing Series")');
    if (ongoingSection.length) {
        data.ongoing_series = [];
        const ongoingContainer = sidebar.find('.ongoingseries').first();

        if (ongoingContainer.length) {
            ongoingContainer.find('li').each((_: any, el: any) => {
                const link = $(el).find('a');
                const titleSpan = $(el).find('.l');
                const episodeSpan = $(el).find('.r');
                let titleText = titleSpan.text().trim();
                const episodeText = episodeSpan.text().trim();
                const href = link.attr('href') || '';

                if (titleText.includes('►') || titleText.includes('▶')) {
                    titleText = titleText.replace(/[►▶]/g, '').trim();
                }

                if (titleText) {
                    data.ongoing_series!.push({
                        title: titleText,
                        slug: extractSlug(href, baseUrl),
                        episode: episodeText,
                        url: resolveUrl(href, baseUrl),
                    });
                }
            });
        }
    }

    const popularContainer = sidebar.find('#wpop-items');
    if (popularContainer.length) {
        data.popular_series = { weekly: [], monthly: [], all_time: [] };

        const parsePopularGroup = (selector: string, bucket: 'weekly' | 'monthly' | 'all_time') => {
            popularContainer.find(selector).each((_: any, el: any) => {
                const rank = $(el).find('.ctr').text().trim();
                const titleLink = $(el).find('h4 a');
                const img = $(el).find('img');
                const ratingScore = $(el).find('.numscore').text().trim();
                const genres: string[] = [];
                $(el).find('.leftseries span a').each((_: any, genreEl: any) => {
                    genres.push($(genreEl).text().trim());
                });
                const href = titleLink.attr('href') || '';
                const title = titleLink.text().trim();
                if (title) {
                    data.popular_series![bucket].push({
                        top: rank,
                        title,
                        slug: extractSlug(href, baseUrl),
                        thumbnail: resolveUrl(img.attr('src'), baseUrl),
                        genre: genres,
                        rating: ratingScore,
                        url: resolveUrl(href, baseUrl),
                    });
                }
            });
        };

        parsePopularGroup('.wpop-weekly li', 'weekly');
        parsePopularGroup('.wpop-monthly li', 'monthly');
        parsePopularGroup('.wpop-alltime li', 'all_time');
    }

    const movieSection = sidebar.find('.releases:contains("NEW MOVIE")');
    if (movieSection.length) {
        data.new_movie = [];
        const movieContainer = movieSection.next('.serieslist');
        if (movieContainer.length) {
            movieContainer.find('li').each((_: any, el: any) => {
                const titleLink = $(el).find('h4 a.series');
                const img = $(el).find('img');
                const dateSpan = $(el).find('span').last();
                const genres: Array<{ name: string; slug: string }> = [];
                $(el).find('a[rel="tag"]').each((_: any, genreEl: any) => {
                    const genreHref = $(genreEl).attr('href') || '';
                    genres.push({
                        name: $(genreEl).text().trim(),
                        slug: extractSlug(genreHref, baseUrl),
                    });
                });
                const href = titleLink.attr('href') || '';
                const title = titleLink.text().trim();
                if (title) {
                    data.new_movie!.push({
                        title,
                        slug: extractSlug(href, baseUrl),
                        thumbnail: resolveUrl(img.attr('src'), baseUrl),
                        release_date: dateSpan.text().trim(),
                        genres,
                        url: resolveUrl(href, baseUrl),
                    });
                }
            });
        }
    }

    const sections = sidebar.find('.releases');
    data.genres = [];
    data.seasons = [];

    sections.each((_: any, section: any) => {
        const header = $(section).find('h3');
        const headerText = header.text().trim();

        if (headerText.includes('Genres')) {
            const genreContainer = $(section).next('ul.genre');
            if (genreContainer.length) {
                genreContainer.find('li').each((_: any, liEl: any) => {
                    const link = $(liEl).find('a');
                    const text = link.text().trim();
                    const href = link.attr('href') || '';
                    if (text) {
                        data.genres!.push({
                            title: text,
                            slug: extractSlug(href, baseUrl),
                            url: resolveUrl(href, baseUrl),
                        });
                    }
                });
            }
        }

        if (headerText.includes('Season')) {
            const seasonContainer = $(section).next('.mseason').find('ul.season');
            if (seasonContainer.length) {
                seasonContainer.find('li').each((_: any, liEl: any) => {
                    const link = $(liEl).find('a');
                    const countSpan = $(liEl).find('span');
                    const href = link.attr('href') || '';
                    const seasonText = link.text().trim();
                    const countText = countSpan.text().trim();

                    if (seasonText) {
                        data.seasons!.push({
                            title: seasonText.replace(countText, '').trim(),
                            slug: extractSlug(href, baseUrl),
                            count: countText,
                            url: resolveUrl(href, baseUrl),
                        });
                    }
                });
            }
        }
    });

    return data;
}
