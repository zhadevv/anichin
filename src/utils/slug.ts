// Matches watch URLs for both ongoing and completed (tamat) episodes, e.g.:
//   /some-series-episode-08-subtitle-indonesia/
//   /some-series-episode-08-tamat-subtitle-indonesia/
const EPISODE_URL_PATTERN = /-episode-\d+(-tamat)?-subtitle-indonesia.*/;

export function extractSlug(url: string, baseUrl: string): string {
    if (!url) return '';
    try {
        const urlObj = new URL(url, baseUrl);
        const path = urlObj.pathname;
        if (path.includes('seri/')) {
            return path.replace('/seri/', '').replace('/', '');
        } else if (path.includes('genres/')) {
            return path.replace('/genres/', '').replace('/', '');
        } else if (path.includes('season/')) {
            return path.replace('/season/', '').replace('/', '');
        } else if (path.includes('-episode-')) {
            return path.replace(EPISODE_URL_PATTERN, '').replace('/', '');
        }
        return path.split('/').filter(p => p).pop() || '';
    } catch {
        return '';
    }
}

// True when a watch-page pathname uses the "tamat" (completed) URL variant.
export function isTamatPath(path: string): boolean {
    return /-episode-\d+-tamat-subtitle-indonesia/.test(path);
}
