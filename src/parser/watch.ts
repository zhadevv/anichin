import { extractSlug } from '../utils/slug';
import { resolveUrl } from '../utils/url';

export interface WatchData {
    id: string;
    title: string;
    slug: string;
    episode_number: string;
    episode_number_formatted: string;
    is_final_episode: boolean;
    thumbnail: string;
    release_date: string;
    posted_by: string;
    servers: Array<{ server_id: string; server_name: string; server_url: string }>;
    current_server: { server_id: string; server_url: string };
    downloads: any[];
    description: string;
    series_info: {
        title: string;
        alter_title: string;
        thumbnail: string;
        rating: { text: string; percentage: number };
        information: {
            status: string;
            network: Array<{ name: string; url: string }>;
            studio: Array<{ name: string; url: string }>;
            released: string;
            duration: string;
            season: string;
            country: string;
            type: string;
            total_episodes: string;
        };
        genres: Array<{ name: string; slug: string; url: string }>;
        synopsis: string;
    };
    episode_navigation: {
        prev_episode: { text: string; url: string };
        all_episodes: { text: string; url: string };
        next_episode: { text: string; url: string };
    };
    related_episodes: any[];
    meta: {
        author: string;
        date_published: string;
        date_modified: string;
        publisher: { name: string; logo: string };
    };
    url: string;
}

export function parseWatchPage(
    $: any,
    baseUrl: string,
    slug: string,
    episode: number,
    episodeStr: string,
    resolvedPath: string,
    isFinalEpisode: boolean
): WatchData {
    const data: WatchData = {
        id: '',
        title: '',
        slug,
        episode_number: episode.toString(),
        episode_number_formatted: episodeStr,
        is_final_episode: isFinalEpisode,
        thumbnail: '',
        release_date: '',
        posted_by: '',
        servers: [],
        current_server: { server_id: '0', server_url: '' },
        downloads: [],
        description: '',
        series_info: {
            title: '',
            alter_title: '',
            thumbnail: '',
            rating: { text: '', percentage: 0 },
            information: {
                status: '',
                network: [],
                studio: [],
                released: '',
                duration: '',
                season: '',
                country: '',
                type: '',
                total_episodes: '',
            },
            genres: [],
            synopsis: '',
        },
        episode_navigation: {
            prev_episode: { text: '', url: '' },
            all_episodes: { text: '', url: '' },
            next_episode: { text: '', url: '' },
        },
        related_episodes: [],
        meta: {
            author: '',
            date_published: '',
            date_modified: '',
            publisher: { name: '', logo: '' },
        },
        url: resolveUrl(resolvedPath, baseUrl),
    };

    const shortLink = $('link[rel="shortlink"]').attr('href');
    if (shortLink) {
        const match = shortLink.match(/p=(\d+)/);
        if (match) {
            data.id = match[1];
        }
    }

    const playerSection = $('.megavid');
    if (playerSection.length) {
        const thumbnail = playerSection.find('.tb img');
        const title = playerSection.find('.entry-title');
        const epNumberMeta = playerSection.find('meta[itemprop="episodeNumber"]');
        const lmSection = playerSection.find('.lm');

        data.thumbnail = thumbnail.attr('src') || '';
        data.title = title.text().trim();
        data.episode_number = epNumberMeta.attr('content') || episode.toString();

        if (lmSection.length) {
            const releaseDate = lmSection.find('.updated');
            const postedBy = lmSection.find('.vcard a');

            data.release_date = releaseDate.text().trim();
            data.posted_by = postedBy.text().trim();
        }
    }

    const videoContent = $('.video-content');
    if (videoContent.length) {
        const iframe = videoContent.find('#pembed iframe');
        if (iframe.length) {
            const src = iframe.attr('src') || '';
            data.current_server.server_url = src;
            data.servers.push({
                server_id: '0',
                server_name: 'Default Server',
                server_url: src,
            });
        }
    }

    const videoNav = $('.item.video-nav');
    if (videoNav.length) {
        const serverSelect = videoNav.find('select.mirror');
        if (serverSelect.length) {
            serverSelect.find('option').each((index: number, el: any) => {
                const optionValue = $(el).attr('value');
                const dataIndex = $(el).attr('data-index');

                if (optionValue && optionValue.trim() !== '' && dataIndex && dataIndex !== '0') {
                    let serverUrl = '';
                    const serverName = $(el).text().trim();

                    if (optionValue.includes('base64,')) {
                        const base64Match = optionValue.match(/base64,(.*)/);
                        if (base64Match) {
                            try {
                                const decoded = atob(base64Match[1]);
                                const srcMatch = decoded.match(/src="([^"]+)"/);
                                if (srcMatch) {
                                    serverUrl = srcMatch[1];
                                }
                            } catch (e) {}
                        }
                    } else if (optionValue.includes('<iframe')) {
                        const srcMatch = optionValue.match(/src="([^"]+)"/);
                        if (srcMatch) {
                            serverUrl = srcMatch[1];
                        }
                    } else {
                        serverUrl = optionValue;
                    }

                    if (serverUrl && serverName !== 'Select Video Server') {
                        const serverId = index.toString();
                        data.servers.push({
                            server_id: serverId,
                            server_name: serverName,
                            server_url: serverUrl,
                        });

                        if (index === 0) {
                            data.current_server = {
                                server_id: serverId,
                                server_url: serverUrl,
                            };
                        }
                    }
                }
            });
        }
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

            data.downloads.push(batchData);
        });
    }

    const descriptionSection = $('.entry-content .bixbox.infx');
    if (descriptionSection.length) {
        const description = descriptionSection.find('p');
        data.description = description.text().trim();
    }

    const seriesInfo = $('.single-info');
    if (seriesInfo.length) {
        const seriesTitle = seriesInfo.find('h2[itemprop="partOfSeries"]');
        const alterTitle = seriesInfo.find('.alter');
        const seriesThumb = seriesInfo.find('.thumb img');
        const ratingText = seriesInfo.find('.rating strong');
        const ratingBar = seriesInfo.find('.rtb span');
        const infoContent = seriesInfo.find('.info-content');

        data.series_info.title = seriesTitle.text().trim();
        data.series_info.alter_title = alterTitle.text().trim();
        data.series_info.thumbnail = seriesThumb.attr('src') || '';
        data.series_info.rating.text = ratingText.text().trim();

        const ratingStyle = ratingBar.attr('style') || '';
        const ratingMatch = ratingStyle.match(/width:\s*(\d+)%/);
        if (ratingMatch) {
            data.series_info.rating.percentage = parseInt(ratingMatch[1]);
        }

        if (infoContent.length) {
            const infoMap: { [key: string]: string } = {
                'Status:': 'status',
                'Released:': 'released',
                'Duration:': 'duration',
                'Type:': 'type',
                'Episodes:': 'total_episodes',
            };

            Object.keys(infoMap).forEach(key => {
                const span = infoContent.find(`span:contains("${key}")`);
                if (span.length) {
                    (data.series_info.information as any)[infoMap[key]] = span.text().replace(key, '').trim();
                }
            });

            const networkSpan = infoContent.find('span:contains("Network:")');
            if (networkSpan.length) {
                networkSpan.find('a').each((_: any, el: any) => {
                    data.series_info.information.network.push({
                        name: $(el).text().trim(),
                        url: resolveUrl($(el).attr('href'), baseUrl),
                    });
                });
            }

            const studioSpan = infoContent.find('span:contains("Studio:")');
            if (studioSpan.length) {
                studioSpan.find('a').each((_: any, el: any) => {
                    data.series_info.information.studio.push({
                        name: $(el).text().trim(),
                        url: resolveUrl($(el).attr('href'), baseUrl),
                    });
                });
            }

            const seasonSpan = infoContent.find('span:contains("Season:")');
            const countrySpan = infoContent.find('span:contains("Country:")');

            if (seasonSpan.length) {
                data.series_info.information.season = seasonSpan.text().replace('Season:', '').trim();
            }
            if (countrySpan.length) {
                data.series_info.information.country = countrySpan.text().replace('Country:', '').trim();
            }
        }

        const genresDiv = seriesInfo.find('.genxed');
        if (genresDiv.length) {
            genresDiv.find('a[rel="tag"]').each((_: any, el: any) => {
                data.series_info.genres.push({
                    name: $(el).text().trim(),
                    slug: extractSlug($(el).attr('href') || '', baseUrl),
                    url: resolveUrl($(el).attr('href'), baseUrl),
                });
            });
        }

        const synopsisDiv = seriesInfo.find('.desc.mindes');
        if (synopsisDiv.length) {
            data.series_info.synopsis = synopsisDiv.text().trim();
        }
    }

    const episodeNav = $('.naveps.bignav');
    if (episodeNav.length) {
        const prevEp = episodeNav.find('.nvs').first().find('.tex');
        const allEps = episodeNav.find('.nvsc .tex');
        const nextEp = episodeNav.find('.nvs').last().find('.tex');

        if (prevEp.length) {
            data.episode_navigation.prev_episode.text = prevEp.text().trim();
            const prevLink = episodeNav.find('.nvs').first().find('a');
            if (prevLink.length) {
                data.episode_navigation.prev_episode.url = resolveUrl(prevLink.attr('href'), baseUrl);
            }
        }

        if (allEps.length) {
            data.episode_navigation.all_episodes.text = allEps.text().trim();
            const allLink = episodeNav.find('.nvsc a');
            if (allLink.length) {
                data.episode_navigation.all_episodes.url = resolveUrl(allLink.attr('href'), baseUrl);
            }
        }

        if (nextEp.length) {
            data.episode_navigation.next_episode.text = nextEp.text().trim();
            const nextLink = episodeNav.find('.nvs').last().find('a');
            if (nextLink.length) {
                data.episode_navigation.next_episode.url = resolveUrl(nextLink.attr('href'), baseUrl);
            }
        }
    }

    const relatedSection = $('.bixbox:contains("Related Episodes")');
    if (relatedSection.length) {
        relatedSection.find('.stylefiv').each((_: any, el: any) => {
            const thumb = $(el).find('.thumb img');
            const titleLink = $(el).find('.inf h2 a');
            const spans = $(el).find('.inf span');

            data.related_episodes.push({
                title: titleLink.text().trim(),
                url: resolveUrl(titleLink.attr('href'), baseUrl),
                thumbnail: thumb.attr('src') || '',
                posted_by: spans.eq(0).text().trim(),
                released: spans.eq(1).text().trim(),
            });
        });
    }

    const authorMeta = $('meta[itemprop="author"]');
    const datePublishedMeta = $('meta[itemprop="datePublished"]');
    const dateModifiedMeta = $('meta[itemprop="dateModified"]');
    const publisherNameMeta = $('span[itemprop="publisher"] meta[itemprop="name"]');
    const publisherLogoMeta = $('span[itemprop="logo"] meta[itemprop="url"]');

    data.meta.author = authorMeta.attr('content') || '';
    data.meta.date_published = datePublishedMeta.attr('content') || '';
    data.meta.date_modified = dateModifiedMeta.attr('content') || '';
    data.meta.publisher.name = publisherNameMeta.attr('content') || '';
    data.meta.publisher.logo = publisherLogoMeta.attr('content') || '';

    return data;
}
