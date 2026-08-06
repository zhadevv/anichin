import { DEFAULT_USER_AGENTS } from '../constants/config';

export function buildDefaultHeaders(baseUrl: string, userAgent: string): Record<string, string> {
    return {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Cache-Control': 'max-age=0',
        'Referer': baseUrl,
        'Origin': baseUrl,
    };
}

export function getRandomUserAgent(pool: string[] = DEFAULT_USER_AGENTS): string {
    return pool[Math.floor(Math.random() * pool.length)];
}
