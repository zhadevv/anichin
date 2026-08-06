import { ScraperContext, ApiResponse } from '../types/common';
import { buildResponse, handleError } from '../utils/response';
import { formatEpisodeNumber } from '../utils/number';
import { parseWatchPage } from '../parser/watch';

const cheerio = require('cheerio');

// Anichin uses two different URL patterns for an episode watch page, depending
// on whether the series has finished airing at the time the episode was posted:
//   ongoing : /{slug}-episode-{NN}-subtitle-indonesia/
//   tamat   : /{slug}-episode-{NN}-tamat-subtitle-indonesia/
// There is no way to know which one applies just from the slug + episode number,
// so we try the regular (ongoing) URL first and fall back to the "tamat" URL
// whenever the regular one 404s.
function buildWatchPath(slug: string, episodeStr: string, tamat: boolean): string {
    return tamat
        ? `/${slug}-episode-${episodeStr}-tamat-subtitle-indonesia/`
        : `/${slug}-episode-${episodeStr}-subtitle-indonesia/`;
}

export async function fetchWatch(ctx: ScraperContext, slug: string, episode: number): Promise<ApiResponse> {
    try {
        const episodeStr = formatEpisodeNumber(episode);
        const regularPath = buildWatchPath(slug, episodeStr, false);

        let response = await ctx.client.get(regularPath);
        let resolvedPath = regularPath;
        let isFinalEpisode = false;

        if (response.status === 404) {
            const tamatPath = buildWatchPath(slug, episodeStr, true);
            const tamatResponse = await ctx.client.get(tamatPath);

            if (tamatResponse.status !== 404) {
                response = tamatResponse;
                resolvedPath = tamatPath;
                isFinalEpisode = true;
            }
        }

        if (response.status === 404) {
            return buildResponse(
                false,
                null,
                `Episode ${episodeStr} for "${slug}" was not found (tried both the regular and the tamat/completed URL formats)`
            );
        }

        const $ = cheerio.load(response.data);
        const data = parseWatchPage($, ctx.baseUrl, slug, episode, episodeStr, resolvedPath, isFinalEpisode);

        return buildResponse(true, { watch: data });
    } catch (error) {
        return handleError(error, 'parse watch');
    }
}
