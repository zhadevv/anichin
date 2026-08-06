import { extractSlug } from '../utils/slug';
import { resolveUrl } from '../utils/url';
import { formatCountdown, formatReleaseTime } from '../utils/date';

export interface ScheduleItem {
    title: string;
    slug: string;
    thumbnail: string;
    countdown: { raw: string; formatted: string };
    release_time: { raw: string; formatted: string };
    current_episode: string;
    url: string;
}

export function parseScheduleSection($: any, section: any, baseUrl: string): ScheduleItem[] {
    const list: ScheduleItem[] = [];

    $(section).find('.bsx').each((_: any, item: any) => {
        const titleElem = $(item).find('.tt');
        const title = titleElem.text().trim();
        if (!title) return;

        const linkElem = $(item).find('a');
        const slug = extractSlug(linkElem.attr('href') || '', baseUrl);
        const thumbnailElem = $(item).find('img');
        const thumbnail = thumbnailElem.attr('src') || '';
        const countdownElem = $(item).find('.epx.cndwn');
        const rawCountdown = countdownElem.attr('data-cndwn') || '';
        const rawReleaseTime = countdownElem.attr('data-rlsdt') || '';
        const episodeElem = $(item).find('.sb');
        const currentEpisode = episodeElem.text().trim();
        const url = linkElem.attr('href') || '';

        list.push({
            title,
            slug,
            thumbnail: resolveUrl(thumbnail, baseUrl),
            countdown: { raw: rawCountdown, formatted: formatCountdown(rawCountdown) },
            release_time: { raw: rawReleaseTime, formatted: formatReleaseTime(rawReleaseTime) },
            current_episode: currentEpisode,
            url: resolveUrl(url, baseUrl),
        });
    });

    return list;
}
