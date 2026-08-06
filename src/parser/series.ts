import { extractSlug } from '../utils/slug';
import { resolveUrl } from '../utils/url';
import { extractEpisodeNumber, formatEpisodeNumber } from '../utils/number';

export function parseSeriesDetail($: any, baseUrl: string, slug: string, requestPath: string): any {
    const data: any = {
        id: '',
        slug,
        cover: {
            banner: '',
            thumbnail: '',
        },
        title: '',
        alter_title: '',
        mindesc: '',
        synopsis: '',
        information: {
            status: '',
            network: [],
            studio: [],
            released: '',
            duration: '',
            season: '',
            country: '',
            type: '',
            total_episode: '',
            posted_by: '',
            released_on: '',
            updated_on: '',
        },
        rating: {
            value: 0,
            count: 0,
            percentage: 0,
            text: '',
        },
        trailer: {
            url: '',
            text: '',
        },
        bookmark: {
            count: 0,
            text: '',
        },
        genres: [],
        tags: [],
        download_batch: [],
        episode_nav: {
            first_episode: { name: '', number: '', url: '' },
            new_episode: { name: '', number: '', url: '' },
        },
        episodes: [],
        url: resolveUrl(requestPath, baseUrl),
    };

    const canonicalLink = $('link[rel="canonical"]').attr('href');
    const shortLink = $('link[rel="shortlink"]').attr('href');

    if (shortLink) {
        const match = shortLink.match(/p=(\d+)/);
        if (match) {
            data.id = match[1];
        }
    }

    if (!data.id && canonicalLink) {
        try {
            const path = new URL(canonicalLink).pathname;
            const slugMatch = path.match(/\/(\d+)\/?$/);
            if (slugMatch) {
                data.id = slugMatch[1];
            }
        } catch {}
    }

    const coverSection = $('.bixbox.animefull');
    if (coverSection.length) {
        const bannerImg = coverSection.find('.ime img');
        const thumbImg = coverSection.find('.thumb img');

        data.cover.banner = bannerImg.attr('src') || '';
        data.cover.thumbnail = thumbImg.attr('src') || '';

        const ratingValueMeta = coverSection.find('meta[itemprop="ratingValue"]');
        const ratingCountMeta = coverSection.find('meta[itemprop="ratingCount"]');
        const ratingBar = coverSection.find('.rtb span');
        const ratingText = coverSection.find('.rating strong');

        data.rating.value = parseFloat(ratingValueMeta.attr('content') || '0');
        data.rating.count = parseInt(ratingCountMeta.attr('content') || '0');
        data.rating.text = ratingText.text().trim();

        const ratingStyle = ratingBar.attr('style') || '';
        const ratingMatch = ratingStyle.match(/width:\s*(\d+)%/);
        if (ratingMatch) {
            data.rating.percentage = parseInt(ratingMatch[1]);
        }

        const trailerBtn = coverSection.find('.trailerbutton');
        if (trailerBtn.length) {
            data.trailer = {
                url: trailerBtn.attr('href') || '',
                text: trailerBtn.text().trim(),
            };
        }

        const bookmarkDiv = coverSection.find('.bookmark .bmc');
        if (bookmarkDiv.length) {
            const text = bookmarkDiv.text().trim();
            const match = text.match(/(\d+)/);
            data.bookmark = {
                count: match ? parseInt(match[1]) : 0,
                text,
            };
        }
    }

    const infoSection = $('.infox');
    if (infoSection.length) {
        const title = infoSection.find('.entry-title');
        const alterTitle = infoSection.find('.alter');
        const mindesc = infoSection.find('.mindesc');
        const synopsis = infoSection.find('.desc');

        data.title = title.text().trim();
        data.alter_title = alterTitle.text().trim();
        data.mindesc = mindesc.text().trim();
        data.synopsis = synopsis.text().trim();

        const infoContent = infoSection.find('.info-content');
        if (infoContent.length) {
            const infoMap: { [key: string]: string } = {
                'Status:': 'status',
                'Released:': 'released',
                'Duration:': 'duration',
                'Type:': 'type',
                'Episodes:': 'total_episode',
            };

            Object.keys(infoMap).forEach(key => {
                const span = infoContent.find(`span:contains("${key}")`);
                if (span.length) {
                    data.information[infoMap[key]] = span.text().replace(key, '').trim();
                }
            });

            const networkSpan = infoContent.find('span:contains("Network:")');
            if (networkSpan.length) {
                networkSpan.find('a').each((_: any, el: any) => {
                    data.information.network.push({
                        name: $(el).text().trim(),
                        url: resolveUrl($(el).attr('href'), baseUrl),
                    });
                });
            }

            const studioSpan = infoContent.find('span:contains("Studio:")');
            if (studioSpan.length) {
                studioSpan.find('a').each((_: any, el: any) => {
                    data.information.studio.push({
                        name: $(el).text().trim(),
                        url: resolveUrl($(el).attr('href'), baseUrl),
                    });
                });
            }

            const seasonSpan = infoContent.find('span:contains("Season:")');
            const countrySpan = infoContent.find('span:contains("Country:")');

            if (seasonSpan.length) {
                data.information.season = seasonSpan.text().replace('Season:', '').trim();
            }
            if (countrySpan.length) {
                data.information.country = countrySpan.text().replace('Country:', '').trim();
            }

            const authorSpan = infoContent.find('.author');
            const datePublished = infoContent.find('time[itemprop="datePublished"]');
            const dateModified = infoContent.find('time[itemprop="dateModified"]');

            data.information.posted_by = authorSpan.text().trim();
            data.information.released_on = datePublished.attr('datetime') || '';
            data.information.updated_on = dateModified.attr('datetime') || '';
        }

        const genresDiv = infoSection.find('.genxed');
        if (genresDiv.length) {
            genresDiv.find('a[rel="tag"]').each((_: any, el: any) => {
                data.genres.push({
                    name: $(el).text().trim(),
                    slug: extractSlug($(el).attr('href') || '', baseUrl),
                    url: resolveUrl($(el).attr('href'), baseUrl),
                });
            });
        }
    }

    const tagsSection = $('.bottom.tags');
    if (tagsSection.length) {
        tagsSection.find('a[rel="tag"]').each((_: any, el: any) => {
            data.tags.push({
                name: $(el).text().trim(),
                url: resolveUrl($(el).attr('href'), baseUrl),
            });
        });
    }

    const downloadSection = $('.bixbox:contains("Download")');
    if (downloadSection.length) {
        downloadSection.find('.soraddlx').each((_: any, batchEl: any) => {
            const batchTitle = $(batchEl).find('.sorattlx h3');
            const batchData: any = {
                title: batchTitle.text().trim(),
                qualities: [],
            };

            $(batchEl).find('.soraurlx').each((_: any, qualityEl: any) => {
                const qualityName = $(qualityEl).find('strong');
                const qualityData: any = {
                    quality: qualityName.text().trim(),
                    links: [],
                };

                $(qualityEl).find('a').each((_: any, linkEl: any) => {
                    qualityData.links.push({
                        name: $(linkEl).text().trim(),
                        url: $(linkEl).attr('href') || '',
                    });
                });

                batchData.qualities.push(qualityData);
            });

            data.download_batch.push(batchData);
        });
    }

    const episodeNavSection = $('.lastend');
    if (episodeNavSection.length) {
        const firstEp = episodeNavSection.find('.inepcx').first();
        const newEp = episodeNavSection.find('.inepcx').last();

        if (firstEp.length) {
            const numberSpan = firstEp.find('.epcurfirst');
            const episodeNumber = numberSpan.text().trim();
            const episodeNum = extractEpisodeNumber(episodeNumber);

            let firstEpisodeUrl = '#';
            if (episodeNum) {
                const formattedNum = formatEpisodeNumber(parseInt(episodeNum));
                firstEpisodeUrl = `/${slug}-episode-${formattedNum}-subtitle-indonesia/`;
            }

            data.episode_nav.first_episode = {
                name: episodeNumber,
                number: episodeNum,
                url: firstEpisodeUrl !== '#' ? resolveUrl(firstEpisodeUrl, baseUrl) : '#',
            };
        }

        if (newEp.length) {
            const numberSpan = newEp.find('.epcurlast');
            const episodeNumber = numberSpan.text().trim();
            const episodeNum = extractEpisodeNumber(episodeNumber);
            const newEpLink = newEp.find('a');
            const href = newEpLink.attr('href') || '';

            data.episode_nav.new_episode = {
                name: episodeNumber,
                number: episodeNum,
                url: resolveUrl(href, baseUrl),
            };
        }
    }

    const episodeSection = $('.bixbox.bxcl.epcheck');
    if (episodeSection.length) {
        const episodeList = episodeSection.find('.eplister li');
        episodeList.each((i: number, epEl: any) => {
            const link = $(epEl).find('a');
            const number = $(epEl).find('.epl-num');
            const title = $(epEl).find('.epl-title');
            const subtitle = $(epEl).find('.epl-sub span');
            const date = $(epEl).find('.epl-date');

            data.episodes.push({
                index: i,
                number: number.text().trim(),
                title: title.text().trim(),
                subtitle: subtitle.text().trim(),
                release_date: date.text().trim(),
                url: resolveUrl(link.attr('href'), baseUrl),
            });
        });
    }

    return data;
}
