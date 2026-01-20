import * as cheerio from 'cheerio';
import axios from 'axios';

const isBrowser = typeof window !== 'undefined';
let HttpsProxyAgent: any, SocksProxyAgent: any;

if (!isBrowser) {
    try {
        HttpsProxyAgent = require('https-proxy-agent').HttpsProxyAgent;
        SocksProxyAgent = require('socks-proxy-agent').SocksProxyAgent;
    } catch (e) {}
}

export interface ApiResponse {
    success: boolean;
    creator: string;
    data: any;
    metadata: any;
    message: string | null;
}

export interface AdvancedSearchFilter {
    status?: string;
    type?: string;
    order?: string;
    sub?: string;
    genres?: string[];
    studios?: string[];
    seasons?: string[];
    per_page?: number;
}

export interface SidebarData {
    quick_filter?: {
        checkbox_filters: any;
        radio_filters: any;
    };
    ongoing_series?: Array<{
        title: string;
        slug: string;
        episode: string;
        url: string;
    }>;
    popular_series?: {
        weekly: Array<{
            top: string;
            title: string;
            slug: string;
            thumbnail: string;
            genre: string[];
            rating: string;
            url: string;
        }>;
        monthly: Array<{
            top: string;
            title: string;
            slug: string;
            thumbnail: string;
            genre: string[];
            rating: string;
            url: string;
        }>;
        all_time: Array<{
            top: string;
            title: string;
            slug: string;
            thumbnail: string;
            genre: string[];
            rating: string;
            url: string;
        }>;
    };
    new_movie?: Array<{
        title: string;
        slug: string;
        thumbnail: string;
        release_date: string;
        genres: Array<{name: string, slug: string}>;
        url: string;
    }>;
    genres?: Array<{
        title: string;
        slug: string;
        url: string;
    }>;
    seasons?: Array<{
        title: string;
        slug: string;
        count: string;
        url: string;
    }>;
}

export interface ScraperConfig {
    baseUrl?: string;
    userAgent?: string;
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
    proxy?: {
        host: string;
        port: number;
        protocol?: 'http' | 'https' | 'socks' | 'socks5';
        auth?: {
            username: string;
            password: string;
        };
    };
    requestDelay?: number;
}

export class AnichinScraper {
    private client: any;
    private readonly baseUrl: string;
    private readonly maxRetries: number;
    private readonly retryDelay: number;
    private readonly requestDelay: number;
    private lastRequestTime: number = 0;
    private userAgents: string[] = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    ];

    constructor(config: ScraperConfig = {}) {
        this.baseUrl = config.baseUrl || 'https://anichin.cafe';
        this.maxRetries = config.maxRetries || 3;
        this.retryDelay = config.retryDelay || 1000;
        this.requestDelay = config.requestDelay || 1000;

        const headers = {
            'User-Agent': config.userAgent || this.userAgents[0],
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Cache-Control': 'max-age=0',
            'Referer': this.baseUrl,
            'Origin': this.baseUrl
        };

        const axiosConfig: any = {
            baseURL: this.baseUrl,
            timeout: config.timeout || 30000,
            headers,
            validateStatus: (status: number) => status < 500,
        };

        if (config.proxy) {
            const { host, port, protocol = 'http', auth } = config.proxy;
            const proxyUrl = auth
                ? `${protocol}://${auth.username}:${auth.password}@${host}:${port}`
                : `${protocol}://${host}:${port}`;

            if (protocol.includes('socks')) {
                axiosConfig.httpsAgent = new SocksProxyAgent(proxyUrl);
                axiosConfig.httpAgent = new SocksProxyAgent(proxyUrl);
            } else {
                axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
                axiosConfig.httpAgent = new HttpsProxyAgent(proxyUrl);
            }
        }

        this.client = axios.create(axiosConfig);

        this.client.interceptors.request.use(async (config: any) => {
            await this.applyRateLimit();
            config.headers['User-Agent'] = this.getRandomUserAgent();
            return config;
        });

        this.client.interceptors.response.use(
            (response: any) => response,
            async (error: any) => {
                const config = error.config;
                config.retryCount = config.retryCount || 0;

                if (config.retryCount < this.maxRetries) {
                    config.retryCount++;
                    await this.delay(this.retryDelay * config.retryCount);
                    return this.client(config);
                }
                return Promise.reject(error);
            }
        );
    }

    private async applyRateLimit(): Promise<void> {
        const now = Date.now();
        const elapsed = now - this.lastRequestTime;
        if (elapsed < this.requestDelay) {
            await this.delay(this.requestDelay - elapsed);
        }
        this.lastRequestTime = Date.now();
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private getRandomUserAgent(): string {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    private buildResponse(success: boolean, data: any = null, message: string | null = null, metadata: any = {}): ApiResponse {
        return {
            success,
            creator: 'zhadevv',
            data,
            metadata,
            message
        };
    }

    private handleError(error: any, context: string): ApiResponse {
        const message = error.response 
            ? `HTTP ${error.response.status}: Failed to ${context}`
            : `Failed to ${context}: ${error.message}`;
        return this.buildResponse(false, null, message);
    }

    private extractSlug(url: string): string {
        if (!url) return '';
        try {
            const urlObj = new URL(url, this.baseUrl);
            const path = urlObj.pathname;
            if (path.includes('seri/')) {
                return path.replace('/seri/', '').replace('/', '');
            } else if (path.includes('genres/')) {
                return path.replace('/genres/', '').replace('/', '');
            } else if (path.includes('season/')) {
                return path.replace('/season/', '').replace('/', '');
            } else if (path.includes('-episode-')) {
                return path.replace(/-episode-\d+-subtitle-indonesia.*/, '').replace('/', '');
            }
            return path.split('/').filter(p => p).pop() || '';
        } catch {
            return '';
        }
    }

    private formatEpisodeNumber(episode: number): string {
        return episode < 10 ? `0${episode}` : episode.toString();
    }

    private extractEpisodeNumber(episodeText: string): string {
        if (!episodeText) return '';
        const match = episodeText.match(/\d+/);
        return match ? match[0] : '';
    }

    private formatCountdown(secondsStr: string): string {
        if (!secondsStr || !secondsStr.trim()) return "Unknown";
        const cleanedStr = secondsStr.replace(/[^\d-]/g, '');
        if (!cleanedStr) return "Unknown";
        const seconds = parseInt(cleanedStr);
        if (isNaN(seconds)) return "Unknown";
        if (seconds < 0) return "Already released";
        const days = Math.floor(seconds / (24 * 3600));
        const remainingSeconds = seconds % (24 * 3600);
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        else if (hours > 0) return `${hours}h ${minutes}m`;
        else return `${minutes}m`;
    }

    private formatReleaseTime(timestampStr: string): string {
        if (!timestampStr || !timestampStr.trim()) return "Unknown";
        const cleanedStr = timestampStr.replace(/[^\d]/g, '');
        if (!cleanedStr) return "Unknown";
        let timestamp = parseInt(cleanedStr);
        if (timestamp > 253402300800) timestamp = Math.floor(timestamp / 1000);
        try {
            const dt = new Date(timestamp * 1000);
            const hours = dt.getHours().toString().padStart(2, '0');
            const minutes = dt.getMinutes().toString().padStart(2, '0');
            return `At ${hours}:${minutes}`;
        } catch {
            return "Unknown";
        }
    }

    private parseListItem($: any, element: any): any {
        const bsx = $(element);
        const link = bsx.find('a.tip');
        const typez = bsx.find('.typez');
        const epx = bsx.find('.epx');
        const sb = bsx.find('.sb');
        const img = bsx.find('img.ts-post-image');
        const h2 = bsx.find('.tt h2');
        const href = link.attr('href') || '';
        return {
            title: h2.text().trim() || '',
            slug: this.extractSlug(href),
            thumbnail: img.attr('src') || '',
            episode: epx.text().trim() || '',
            type: typez.text().trim() || '',
            badge: sb.text().trim() || '',
            url: href ? new URL(href, this.baseUrl).toString() : ''
        };
    }

    private parsePagination($: any): any {
        const pagination: any = {
            current_page: 1,
            total_pages: 1,
            has_prev: false,
            has_next: false,
            prev: { url: '', text: '' },
            next: { url: '', text: '' },
            pages: []
        };
        
        const paginationDiv = $('.pagination, .hpage');
        
        const currentPage = paginationDiv.find('.page-numbers.current, .current');
        if (currentPage.length) {
            pagination.current_page = parseInt(currentPage.text().trim()) || 1;
        }
        
        const prevLink = paginationDiv.find('.prev.page-numbers, a.l');
        const nextLink = paginationDiv.find('.next.page-numbers, a.r');
        
        if (prevLink.length) {
            pagination.has_prev = true;
            pagination.prev = {
                url: prevLink.attr('href') ? new URL(prevLink.attr('href') || '', this.baseUrl).toString() : '',
                text: prevLink.text().trim()
            };
        }
        
        if (nextLink.length) {
            pagination.has_next = true;
            pagination.next = {
                url: nextLink.attr('href') ? new URL(nextLink.attr('href') || '', this.baseUrl).toString() : '',
                text: nextLink.text().trim()
            };
        }
        
        paginationDiv.find('.page-numbers').each((_: any, el: any) => {
            const pageNum = parseInt($(el).text().trim());
            if (!isNaN(pageNum)) {
                pagination.pages.push({
                    number: pageNum,
                    url: $(el).attr('href') ? new URL($(el).attr('href') || '', this.baseUrl).toString() : '',
                    is_current: $(el).hasClass('current')
                });
            }
        });
        
        if (pagination.pages.length > 0) {
            pagination.total_pages = Math.max(...pagination.pages.map((p: any) => p.number));
        }
        
        return pagination;
    }

    async sidebar(): Promise<ApiResponse> {
        try {
            const response = await this.client.get('/');
            const $ = cheerio.load(response.data);
            
            const data: SidebarData = {};
            const sidebar = $('#sidebar');
            
            const quickFilter = sidebar.find('.quickfilter');
            if (quickFilter.length) {
                data.quick_filter = { checkbox_filters: {}, radio_filters: {} };
                
                ['genre', 'studio', 'season'].forEach(filterType => {
                    const filterDiv = quickFilter.find(`.filter.dropdown:contains("${filterType.charAt(0).toUpperCase() + filterType.slice(1)}")`);
                    if (filterDiv.length) {
                        const items: Array<{value: string, label: string, checked: boolean}> = [];
                        filterDiv.find('input[type="checkbox"]').each((_: any, el: any) => {
                            items.push({
                                value: $(el).attr('value') || '',
                                label: $(el).next('label').text().trim(),
                                checked: $(el).is(':checked')
                            });
                        });
                        data.quick_filter!.checkbox_filters[filterType] = { label: filterDiv.find('.dropdown-toggle').text().trim(), type: 'checkbox', multiple: true, items };
                    }
                });
                
                ['status', 'type', 'order'].forEach(filterType => {
                    const filterDiv = quickFilter.find(`.filter.dropdown:contains("${filterType.charAt(0).toUpperCase() + filterType.slice(1)}")`);
                    if (filterDiv.length) {
                        const items: Array<{value: string, label: string, checked: boolean}> = [];
                        filterDiv.find('input[type="radio"]').each((_: any, el: any) => {
                            items.push({ value: $(el).attr('value') || '', label: $(el).next('label').text().trim(), checked: $(el).is(':checked') });
                        });
                        data.quick_filter!.radio_filters[filterType] = { label: filterDiv.find('.dropdown-toggle').text().trim(), type: 'radio', multiple: false, items };
                    }
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
                                slug: this.extractSlug(href), 
                                episode: episodeText, 
                                url: href ? new URL(href, this.baseUrl).toString() : '' 
                            });
                        }
                    });
                }
            }
            
            const popularContainer = sidebar.find('#wpop-items');
            if (popularContainer.length) {
                data.popular_series = { weekly: [], monthly: [], all_time: [] };
                popularContainer.find('.wpop-weekly li').each((_: any, el: any) => {
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
                        data.popular_series!.weekly.push({ 
                            top: rank, 
                            title: title, 
                            slug: this.extractSlug(href), 
                            thumbnail: img.attr('src') ? new URL(img.attr('src') || '', this.baseUrl).toString() : '', 
                            genre: genres, 
                            rating: ratingScore, 
                            url: href ? new URL(href, this.baseUrl).toString() : '' 
                        });
                    }
                });
                popularContainer.find('.wpop-monthly li').each((_: any, el: any) => {
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
                        data.popular_series!.monthly.push({ 
                            top: rank, 
                            title: title, 
                            slug: this.extractSlug(href), 
                            thumbnail: img.attr('src') ? new URL(img.attr('src') || '', this.baseUrl).toString() : '', 
                            genre: genres, 
                            rating: ratingScore, 
                            url: href ? new URL(href, this.baseUrl).toString() : '' 
                        });
                    }
                });
                popularContainer.find('.wpop-alltime li').each((_: any, el: any) => {
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
                        data.popular_series!.all_time.push({ 
                            top: rank, 
                            title: title, 
                            slug: this.extractSlug(href), 
                            thumbnail: img.attr('src') ? new URL(img.attr('src') || '', this.baseUrl).toString() : '', 
                            genre: genres, 
                            rating: ratingScore, 
                            url: href ? new URL(href, this.baseUrl).toString() : '' 
                        });
                    }
                });
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
                        const genres: Array<{name: string, slug: string}> = [];
                        $(el).find('a[rel="tag"]').each((_: any, genreEl: any) => {
                            const genreHref = $(genreEl).attr('href') || '';
                            genres.push({ 
                                name: $(genreEl).text().trim(), 
                                slug: this.extractSlug(genreHref) 
                            });
                        });
                        const href = titleLink.attr('href') || '';
                        const title = titleLink.text().trim();
                        if (title) {
                            data.new_movie!.push({ 
                                title: title, 
                                slug: this.extractSlug(href), 
                                thumbnail: img.attr('src') ? new URL(img.attr('src') || '', this.baseUrl).toString() : '', 
                                release_date: dateSpan.text().trim(), 
                                genres: genres, 
                                url: href ? new URL(href, this.baseUrl).toString() : '' 
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
                                    slug: this.extractSlug(href), 
                                    url: href ? new URL(href, this.baseUrl).toString() : '' 
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
                                    slug: this.extractSlug(href), 
                                    count: countText, 
                                    url: href ? new URL(href, this.baseUrl).toString() : '' 
                                });
                            }
                        });
                    }
                }
            });
            
            return this.buildResponse(true, data);
        } catch (error) {
            return this.handleError(error, 'parse sidebar');
        }
    }
    
    async home(page: number = 1): Promise<ApiResponse> {
        try {
            const url = page === 1 ? '/' : `/page/${page}/`;
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);
            const data: any = { slider: [], popular_today: [], latest_release: [], recommendation: {}, pagination: {} };
            
            const slider = $('#slidertwo .swiper-slide.item');
            slider.each((_: any, el: any) => {
                const backdrop = $(el).find('.backdrop');
                const info = $(el).find('.info');
                const titleLink = info.find('h2 a');
                const watchElem = $(el).find('.watch');
                const bgStyle = backdrop.attr('style') || '';
                const bgMatch = bgStyle.match(/url\(['"]?(.*?)['"]?\)/);
                const slug = this.extractSlug(watchElem.attr('href') || '');
                data.slider.push({
                    title: titleLink.attr('data-jtitle') || titleLink.text().trim(),
                    slug: slug,
                    description: info.find('p').text().trim(),
                    thumbnail: bgMatch ? bgMatch[1] : '',
                    url: watchElem.attr('href') ? new URL(watchElem.attr('href') || '', this.baseUrl).toString() : ''
                });
            });
            
            const popularSection = $('.bixbox.bbnofrm:contains("Popular Today")');
            if (popularSection.length) {
                popularSection.find('.listupd.normal .bs .bsx').each((_: any, el: any) => {
                    data.popular_today.push(this.parseListItem($, el));
                });
            }
            
            const latestContainer = $('.releases.latesthome');
            if (latestContainer.length) {
                const viewAllElem = latestContainer.find('.vl');
                data.pagination = {
                    view_all: viewAllElem.attr('href') ? new URL(viewAllElem.attr('href') || '', this.baseUrl).toString() : '',
                    prev: '',
                    next: ''
                };
                
                const itemsContainer = $('.listupd.normal');
                if (itemsContainer.length) {
                    itemsContainer.find('.bs .bsx').each((_: any, el: any) => {
                        data.latest_release.push(this.parseListItem($, el));
                    });
                }
                
                const paginationContainer = $('.hpage');
                if (paginationContainer.length) {
                    const prevElem = paginationContainer.find('a.l');
                    const nextElem = paginationContainer.find('a.r');
                    
                    data.pagination.prev = prevElem.attr('href') ? new URL(prevElem.attr('href') || '', this.baseUrl).toString() : '';
                    data.pagination.next = nextElem.attr('href') ? new URL(nextElem.attr('href') || '', this.baseUrl).toString() : '';
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
                        active: $(el).hasClass('active')
                    });
                });
                recSection.find('.tab-pane').each((_: any, paneEl: any) => {
                    const tabId = $(paneEl).attr('id') || '';
                    data.recommendation.data[tabId] = [];
                    $(paneEl).find('.bs .bsx').each((_: any, articleEl: any) => {
                        const status = $(articleEl).find('.status').text().trim();
                        const item = this.parseListItem($, articleEl);
                        item.status = status;
                        data.recommendation.data[tabId].push(item);
                    });
                });
            }
            
            data.pagination = this.parsePagination($);
            
            return this.buildResponse(true, { home: data });
        } catch (error) {
            return this.handleError(error, 'parse home');
        }
    }
    
    async search(query: string, page: number = 1): Promise<ApiResponse> {
        try {
            const encodedQuery = encodeURIComponent(query);
            const url = page === 1 ? `/?s=${encodedQuery}` : `/page/${page}/?s=${encodedQuery}`;
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);
            const data: any = { query, items: [], pagination: {} };
            
            const container = $('.listupd');
            if (container.length) {
                container.find('.bs .bsx').each((_: any, el: any) => {
                    data.items.push(this.parseListItem($, el));
                });
            }
            
            data.pagination = this.parsePagination($);
            
            return this.buildResponse(true, { search: data });
        } catch (error) {
            return this.handleError(error, 'parse search');
        }
    }
    
    async schedule(day?: string): Promise<ApiResponse> {
        try {
            const response = await this.client.get('/schedule/');
            const $ = cheerio.load(response.data);
            
            if (day) {
                const dayLower = day.toLowerCase();
                const daySection = $(`.sch_${dayLower}`);
                if (!daySection.length) {
                    return this.buildResponse(false, null, `Day "${day}" not found`);
                }
                
                const dayData: any = { list: [] };
                daySection.find('.bsx').each((_: any, item: any) => {
                    const titleElem = $(item).find('.tt');
                    const title = titleElem.text().trim();
                    if (title) {
                        const linkElem = $(item).find('a');
                        const slug = this.extractSlug(linkElem.attr('href') || '');
                        const thumbnailElem = $(item).find('img');
                        const thumbnail = thumbnailElem.attr('src') || '';
                        const countdownElem = $(item).find('.epx.cndwn');
                        const rawCountdown = countdownElem.attr('data-cndwn') || '';
                        const rawReleaseTime = countdownElem.attr('data-rlsdt') || '';
                        const formattedCountdown = this.formatCountdown(rawCountdown);
                        const formattedReleaseTime = this.formatReleaseTime(rawReleaseTime);
                        const episodeElem = $(item).find('.sb');
                        const currentEpisode = episodeElem.text().trim();
                        const url = linkElem.attr('href') || '';
                        
                        dayData.list.push({
                            title: title,
                            slug: slug,
                            thumbnail: thumbnail ? new URL(thumbnail, this.baseUrl).toString() : '',
                            countdown: { raw: rawCountdown, formatted: formattedCountdown },
                            release_time: { raw: rawReleaseTime, formatted: formattedReleaseTime },
                            current_episode: currentEpisode,
                            url: url ? new URL(url, this.baseUrl).toString() : ''
                        });
                    }
                });
                
                return this.buildResponse(true, { [dayLower]: dayData });
            } else {
                const data: any = {
                    monday: { list: [] },
                    tuesday: { list: [] },
                    wednesday: { list: [] },
                    thursday: { list: [] },
                    friday: { list: [] },
                    saturday: { list: [] },
                    sunday: { list: [] }
                };
                
                const scheduleSections = $('[class*="sch_"]');
                scheduleSections.each((_: any, section: any) => {
                    const classNames = $(section).attr('class')?.split(' ') || [];
                    let dayName = null;
                    for (const className of classNames) {
                        if (className.startsWith('sch_')) {
                            dayName = className.replace('sch_', '');
                            break;
                        }
                    }
                    
                    if (dayName && data[dayName]) {
                        $(section).find('.bsx').each((_: any, item: any) => {
                            const titleElem = $(item).find('.tt');
                            const title = titleElem.text().trim();
                            if (title) {
                                const linkElem = $(item).find('a');
                                const slug = this.extractSlug(linkElem.attr('href') || '');
                                const thumbnailElem = $(item).find('img');
                                const thumbnail = thumbnailElem.attr('src') || '';
                                const countdownElem = $(item).find('.epx.cndwn');
                                const rawCountdown = countdownElem.attr('data-cndwn') || '';
                                const rawReleaseTime = countdownElem.attr('data-rlsdt') || '';
                                const formattedCountdown = this.formatCountdown(rawCountdown);
                                const formattedReleaseTime = this.formatReleaseTime(rawReleaseTime);
                                const episodeElem = $(item).find('.sb');
                                const currentEpisode = episodeElem.text().trim();
                                const url = linkElem.attr('href') || '';
                                
                                data[dayName].list.push({
                                    title: title,
                                    slug: slug,
                                    thumbnail: thumbnail ? new URL(thumbnail, this.baseUrl).toString() : '',
                                    countdown: { raw: rawCountdown, formatted: formattedCountdown },
                                    release_time: { raw: rawReleaseTime, formatted: formattedReleaseTime },
                                    current_episode: currentEpisode,
                                    url: url ? new URL(url, this.baseUrl).toString() : ''
                                });
                            }
                        });
                    }
                });
                
                return this.buildResponse(true, { schedule: data });
            }
        } catch (error) {
            return this.handleError(error, 'parse schedule');
        }
    }
    
    async ongoing(page: number = 1): Promise<ApiResponse> {
        try {
            const url = page === 1 ? '/ongoing/' : `/ongoing/page/${page}/`;
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);
            const data: any = { lists: [], pagination: {} };
            
            $('.listupd article.bs').each((_: any, el: any) => {
                data.lists.push(this.parseListItem($, el));
            });
            
            data.pagination = this.parsePagination($);
            
            return this.buildResponse(true, data);
        } catch (error) {
            return this.handleError(error, 'parse ongoing');
        }
    }
    
    async completed(page: number = 1): Promise<ApiResponse> {
        try {
            const url = page === 1 ? '/completed/' : `/completed/page/${page}/`;
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);
            const data: any = { lists: [], pagination: {} };
            
            $('.listupd article.bs').each((_: any, el: any) => {
                data.lists.push(this.parseListItem($, el));
            });
            
            data.pagination = this.parsePagination($);
            
            return this.buildResponse(true, data);
        } catch (error) {
            return this.handleError(error, 'parse completed');
        }
    }
    
    async azlist(page: number = 1, letter?: string): Promise<ApiResponse> {
        try {
            let url: string;
            if (letter) {
                url = page === 1 ? `/az-lists/?show=${letter}` : `/az-lists/page/${page}/?show=${letter}`;
            } else {
                url = page === 1 ? '/az-lists/' : `/az-lists/page/${page}/`;
            }
            
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);
            const data: any = { lists: [], pagination: {} };
            
            $('.listupd article.bs').each((_: any, el: any) => {
                data.lists.push(this.parseListItem($, el));
            });
            
            data.pagination = this.parsePagination($);
            
            return this.buildResponse(true, data);
        } catch (error) {
            return this.handleError(error, 'parse A-Z list');
        }
    }
    
    async genres(slug: string, page: number = 1): Promise<ApiResponse> {
        try {
            const url = page === 1 ? `/genres/${slug}/` : `/genres/${slug}/page/${page}/`;
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);
            
            const data: any = {
                page_type: 'genres',
                genre: {
                    name: '',
                    slug: slug,
                    total_pages: 0
                },
                lists: [],
                pagination: {}
            };
            
            const header = $('.bixbox .releases h1 span');
            if (header.length) {
                const genreName = header.text().trim().replace('Genre:', '').trim();
                data.genre.name = genreName;
            }
            
            $('article.bs').each((_: any, el: any) => {
                data.lists.push(this.parseListItem($, el));
            });
            
            data.pagination = this.parsePagination($);
            data.genre.total_pages = data.pagination.total_pages || 1;
            
            return this.buildResponse(true, data);
        } catch (error) {
            return this.handleError(error, 'parse genres');
        }
    }
    
    async season(slug: string): Promise<ApiResponse> {
        try {
            const url = `/season/${slug}/`;
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);
            
            const data: any = {
                page_type: 'seasons',
                season: {
                    year: '',
                    slug: slug
                },
                lists: [],
                pagination: {
                    has_pagination: false,
                    note: "Seasons page does not have pagination"
                }
            };
            
            const seasonHeader = $('.newseason h1');
            if (seasonHeader.length) {
                data.season.year = seasonHeader.text().trim();
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
                
                const genreList: Array<{name: string, slug: string, url: string}> = [];
                cardInfo.find('.card-info-bottom a[rel="tag"]').each((_: any, genreEl: any) => {
                    const genreHref = $(genreEl).attr('href') || '';
                    genreList.push({
                        name: $(genreEl).text().trim(),
                        slug: this.extractSlug(genreHref),
                        url: genreHref ? new URL(genreHref, this.baseUrl).toString() : ''
                    });
                });
                
                const episodesMatch = episodesInfo.match(/(\d+)\s+episodes/);
                const typeMatch = episodesInfo.match(/·\s+(.+)/);
                
                data.lists.push({
                    title: cardTitle.find('h2').text().trim(),
                    slug: this.extractSlug(cardLink.attr('href') || ''),
                    post_id: cardLink.attr('rel') || '',
                    thumbnail: img.attr('src') || '',
                    studio: {
                        name: studioSpan.text().trim(),
                        color_class: studioSpan.attr('class') || ''
                    },
                    episodes_info: episodesInfo,
                    type: typeMatch ? typeMatch[1].trim() : '',
                    episodes_count: episodesMatch ? parseInt(episodesMatch[1]) : 0,
                    status: cardInfo.find('.status').text().trim(),
                    alternative_titles: cardInfo.find('.alternative').text().trim(),
                    rating: parseFloat(ratingText) || 0,
                    description: description,
                    genres: genreList,
                    url: cardLink.attr('href') ? new URL(cardLink.attr('href') || '', this.baseUrl).toString() : ''
                });
            });
            
            return this.buildResponse(true, data);
        } catch (error) {
            return this.handleError(error, 'parse season');
        }
    }
    
    async studio(slug: string, page: number = 1): Promise<ApiResponse> {
        try {
            const url = page === 1 ? `/studio/${slug}/` : `/studio/${slug}/page/${page}/`;
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);
            
            const data: any = {
                page_type: 'studio',
                studio: {
                    name: '',
                    slug: slug,
                    total_pages: 0
                },
                lists: [],
                pagination: {}
            };
            
            const header = $('.bixbox .releases h1 span');
            if (header.length) {
                const studioName = header.text().trim();
                data.studio.name = studioName;
            }
            
            $('article.bs').each((_: any, el: any) => {
                data.lists.push(this.parseListItem($, el));
            });
            
            data.pagination = this.parsePagination($);
            data.studio.total_pages = data.pagination.total_pages || 1;
            
            return this.buildResponse(true, data);
        } catch (error) {
            return this.handleError(error, 'parse studio');
        }
    }
    
    async network(slug: string, page: number = 1): Promise<ApiResponse> {
        try {
            const url = page === 1 ? `/network/${slug}/` : `/network/${slug}/page/${page}/`;
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);
            
            const data: any = {
                page_type: 'network',
                network: {
                    name: '',
                    slug: slug,
                    total_pages: 0
                },
                lists: [],
                pagination: {}
            };
            
            const header = $('.bixbox .releases h1 span');
            if (header.length) {
                const networkName = header.text().trim();
                data.network.name = networkName;
            }
            
            $('article.bs').each((_: any, el: any) => {
                data.lists.push(this.parseListItem($, el));
            });
            
            data.pagination = this.parsePagination($);
            data.network.total_pages = data.pagination.total_pages || 1;
            
            return this.buildResponse(true, data);
        } catch (error) {
            return this.handleError(error, 'parse network');
        }
    }
    
    async country(slug: string, page: number = 1): Promise<ApiResponse> {
        try {
            const url = page === 1 ? `/country/${slug}/` : `/country/${slug}/page/${page}/`;
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);
            
            const data: any = {
                page_type: 'country',
                country: {
                    name: '',
                    slug: slug,
                    total_pages: 0
                },
                lists: [],
                pagination: {}
            };
            
            const header = $('.bixbox .releases h1 span');
            if (header.length) {
                const countryName = header.text().trim();
                data.country.name = countryName;
            }
            
            $('article.bs').each((_: any, el: any) => {
                data.lists.push(this.parseListItem($, el));
            });
            
            data.pagination = this.parsePagination($);
            data.country.total_pages = data.pagination.total_pages || 1;
            
            return this.buildResponse(true, data);
        } catch (error) {
            return this.handleError(error, 'parse country');
        }
    }
    
    async series(slug: string): Promise<ApiResponse> {
        try {
            const url = `/seri/${slug}/`;
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);
            
            const data: any = {
                id: '',
                slug: slug,
                cover: {
                    banner: '',
                    thumbnail: ''
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
                    updated_on: ''
                },
                rating: {
                    value: 0,
                    count: 0,
                    percentage: 0,
                    text: ''
                },
                trailer: {
                    url: '',
                    text: ''
                },
                bookmark: {
                    count: 0,
                    text: ''
                },
                genres: [],
                tags: [],
                download_batch: [],
                episode_nav: {
                    first_episode: { name: '', number: '', url: '' },
                    new_episode: { name: '', number: '', url: '' }
                },
                episodes: [],
                url: new URL(url, this.baseUrl).toString()
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
                const path = new URL(canonicalLink).pathname;
                const slugMatch = path.match(/\/(\d+)\/?$/);
                if (slugMatch) {
                    data.id = slugMatch[1];
                }
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
                        text: trailerBtn.text().trim()
                    };
                }
                
                const bookmarkDiv = coverSection.find('.bookmark .bmc');
                if (bookmarkDiv.length) {
                    const text = bookmarkDiv.text().trim();
                    const match = text.match(/(\d+)/);
                    data.bookmark = {
                        count: match ? parseInt(match[1]) : 0,
                        text: text
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
                    const infoMap: {[key: string]: string} = {
                        'Status:': 'status',
                        'Released:': 'released',
                        'Duration:': 'duration',
                        'Type:': 'type',
                        'Episodes:': 'total_episode'
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
                                url: $(el).attr('href') ? new URL($(el).attr('href') || '', this.baseUrl).toString() : ''
                            });
                        });
                    }
                    
                    const studioSpan = infoContent.find('span:contains("Studio:")');
                    if (studioSpan.length) {
                        studioSpan.find('a').each((_: any, el: any) => {
                            data.information.studio.push({
                                name: $(el).text().trim(),
                                url: $(el).attr('href') ? new URL($(el).attr('href') || '', this.baseUrl).toString() : ''
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
                            slug: this.extractSlug($(el).attr('href') || ''),
                            url: $(el).attr('href') ? new URL($(el).attr('href') || '', this.baseUrl).toString() : ''
                        });
                    });
                }
            }
            
            const tagsSection = $('.bottom.tags');
            if (tagsSection.length) {
                tagsSection.find('a[rel="tag"]').each((_: any, el: any) => {
                    data.tags.push({
                        name: $(el).text().trim(),
                        url: $(el).attr('href') ? new URL($(el).attr('href') || '', this.baseUrl).toString() : ''
                    });
                });
            }
            
            const downloadSection = $('.bixbox:contains("Download")');
            if (downloadSection.length) {
                downloadSection.find('.soraddlx').each((_: any, batchEl: any) => {
                    const batchTitle = $(batchEl).find('.sorattlx h3');
                    const batchData: any = {
                        title: batchTitle.text().trim(),
                        qualities: []
                    };
                    
                    $(batchEl).find('.soraurlx').each((_: any, qualityEl: any) => {
                        const qualityName = $(qualityEl).find('strong');
                        const qualityData: any = {
                            quality: qualityName.text().trim(),
                            links: []
                        };
                        
                        $(qualityEl).find('a').each((_: any, linkEl: any) => {
                            qualityData.links.push({
                                name: $(linkEl).text().trim(),
                                url: $(linkEl).attr('href') || ''
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
                    const episodeNum = this.extractEpisodeNumber(episodeNumber);
                    
                    let firstEpisodeUrl = '#';
                    if (episodeNum) {
                        const formattedNum = this.formatEpisodeNumber(parseInt(episodeNum));
                        firstEpisodeUrl = `/${slug}-episode-${formattedNum}-subtitle-indonesia/`;
                    }
                    
                    data.episode_nav.first_episode = {
                        name: episodeNumber,
                        number: episodeNum,
                        url: firstEpisodeUrl !== '#' ? new URL(firstEpisodeUrl, this.baseUrl).toString() : '#'
                    };
                }
                
                if (newEp.length) {
                    const numberSpan = newEp.find('.epcurlast');
                    const episodeNumber = numberSpan.text().trim();
                    const episodeNum = this.extractEpisodeNumber(episodeNumber);
                    const newEpLink = newEp.find('a');
                    const href = newEpLink.attr('href') || '';
                    
                    data.episode_nav.new_episode = {
                        name: episodeNumber,
                        number: episodeNum,
                        url: href ? new URL(href, this.baseUrl).toString() : ''
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
                        url: link.attr('href') ? new URL(link.attr('href') || '', this.baseUrl).toString() : ''
                    });
                });
            }
            
            return this.buildResponse(true, { detail: data });
        } catch (error) {
            return this.handleError(error, 'parse series detail');
        }
    }
    
    async watch(slug: string, episode: number): Promise<ApiResponse> {
        try {
            const episodeStr = this.formatEpisodeNumber(episode);
            const url = `/${slug}-episode-${episodeStr}-subtitle-indonesia/`;
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);
            
            const data: any = {
                id: '',
                title: '',
                slug: slug,
                episode_number: episode.toString(),
                episode_number_formatted: episodeStr,
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
                        total_episodes: ''
                    },
                    genres: [],
                    synopsis: ''
                },
                episode_navigation: {
                    prev_episode: { text: '', url: '' },
                    all_episodes: { text: '', url: '' },
                    next_episode: { text: '', url: '' }
                },
                related_episodes: [],
                meta: {
                    author: '',
                    date_published: '',
                    date_modified: '',
                    publisher: { name: '', logo: '' }
                },
                url: new URL(url, this.baseUrl).toString()
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
                        server_url: src
                    });
                }
            }
            
            const videoNav = $('.item.video-nav');
            if (videoNav.length) {
                const serverSelect = videoNav.find('select.mirror');
                if (serverSelect.length) {
                    let serverIndex = 0;
                    serverSelect.find('option').each((index: number, el: any) => {
                        const optionValue = $(el).attr('value');
                        const dataIndex = $(el).attr('data-index');
                        
                        if (optionValue && optionValue.trim() !== '' && dataIndex && dataIndex !== '0') {
                            let serverUrl = '';
                            let serverName = $(el).text().trim();
                            
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
                                    server_url: serverUrl
                                });
                                
                                if (index === 0){
                                    data.current_server = {
                                        server_id: serverId,
                                        server_url: serverUrl
                                    };
                                }
                                serverIndex++;
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
                        qualities: []
                    };
                    
                    $(batchEl).find('.soraurlx').each((_: any, qualityEl: any) => {
                        const qualityName = $(qualityEl).find('strong');
                        const qualityData: any = {
                            quality: qualityName.text().trim(),
                            links: []
                        };
                        
                        $(qualityEl).find('a').each((_: any, linkEl: any) => {
                            qualityData.links.push({
                                name: $(linkEl).text().trim(),
                                url: $(linkEl).attr('href') || ''
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
                    const infoMap: {[key: string]: string} = {
                        'Status:': 'status',
                        'Released:': 'released',
                        'Duration:': 'duration',
                        'Type:': 'type',
                        'Episodes:': 'total_episodes'
                    };
                    
                    Object.keys(infoMap).forEach(key => {
                        const span = infoContent.find(`span:contains("${key}")`);
                        if (span.length) {
                            data.series_info.information[infoMap[key]] = span.text().replace(key, '').trim();
                        }
                    });
                    
                    const networkSpan = infoContent.find('span:contains("Network:")');
                    if (networkSpan.length) {
                        networkSpan.find('a').each((_: any, el: any) => {
                            data.series_info.information.network.push({
                                name: $(el).text().trim(),
                                url: $(el).attr('href') ? new URL($(el).attr('href') || '', this.baseUrl).toString() : ''
                            });
                        });
                    }
                    
                    const studioSpan = infoContent.find('span:contains("Studio:")');
                    if (studioSpan.length) {
                        studioSpan.find('a').each((_: any, el: any) => {
                            data.series_info.information.studio.push({
                                name: $(el).text().trim(),
                                url: $(el).attr('href') ? new URL($(el).attr('href') || '', this.baseUrl).toString() : ''
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
                            slug: this.extractSlug($(el).attr('href') || ''),
                            url: $(el).attr('href') ? new URL($(el).attr('href') || '', this.baseUrl).toString() : ''
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
                        data.episode_navigation.prev_episode.url = prevLink.attr('href') ? new URL(prevLink.attr('href') || '', this.baseUrl).toString() : '';
                    }
                }
                
                if (allEps.length) {
                    data.episode_navigation.all_episodes.text = allEps.text().trim();
                    const allLink = episodeNav.find('.nvsc a');
                    if (allLink.length) {
                        data.episode_navigation.all_episodes.url = allLink.attr('href') ? new URL(allLink.attr('href') || '', this.baseUrl).toString() : '';
                    }
                }
                
                if (nextEp.length) {
                    data.episode_navigation.next_episode.text = nextEp.text().trim();
                    const nextLink = episodeNav.find('.nvs').last().find('a');
                    if (nextLink.length) {
                        data.episode_navigation.next_episode.url = nextLink.attr('href') ? new URL(nextLink.attr('href') || '', this.baseUrl).toString() : '';
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
                        url: titleLink.attr('href') ? new URL(titleLink.attr('href') || '', this.baseUrl).toString() : '',
                        thumbnail: thumb.attr('src') || '',
                        posted_by: spans.eq(0).text().trim(),
                        released: spans.eq(1).text().trim()
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
            
            return this.buildResponse(true, { watch: data });
        } catch (error) {
            return this.handleError(error, 'parse watch');
        }
    }
    
    async advancedsearch(mode: 'image' | 'text' = 'image', filter?: AdvancedSearchFilter, page: number = 1): Promise<ApiResponse> {
        try {
            if (mode === 'text') {
                return await this._advancedSearchTextMode();
            } else {
                return await this._advancedSearchImageMode(filter, page);
            }
        } catch (error) {
            return this.handleError(error, 'advanced search');
        }
    }
    
    private async _advancedSearchImageMode(filter?: AdvancedSearchFilter, page: number = 1): Promise<ApiResponse> {
        try {
            let url = '/seri/';
            const params = new URLSearchParams();
            
            if (page > 1) {
                params.append('page', page.toString());
            }
            
            if (filter) {
                const singleValueFilters = ['status', 'type', 'order', 'sub'];
                singleValueFilters.forEach(key => {
                    const value = (filter as any)[key];
                    if (value && value.trim() !== '') {
                        params.append(key, value);
                    }
                });
                
                const arrayFilters = ['genres', 'studios', 'seasons'];
                arrayFilters.forEach(key => {
                    const filterKey = key as keyof AdvancedSearchFilter;
                    if (filter[filterKey] && Array.isArray(filter[filterKey])) {
                        const filterArray = filter[filterKey] as string[];
                        if (filterArray.length > 0) {
                            filterArray.forEach(value => {
                                if (value && value.trim() !== '') {
                                    const paramKey = key === 'genres' ? 'genre[]' : 
                                                   key === 'studios' ? 'studio[]' : 
                                                   'season[]';
                                    params.append(paramKey, value);
                                }
                            });
                        }
                    }
                });
                
                if (filter.per_page) {
                    params.append('per_page', filter.per_page.toString());
                }
            }
            
            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
            
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);
            
            const data: any = {
                mode: 'image',
                title: '',
                applied_filters: filter || {},
                lists: [],
                pagination: {}
            };
            
            const header = $('.bixbox.bixboxarc.bbnofrm .releases h1 span');
            if (header.length) {
                data.title = header.text().trim();
            }
            
            $('.listupd article.bs').each((_: any, el: any) => {
                data.lists.push(this.parseListItem($, el));
            });
            
            data.pagination = this.parsePagination($);
            
            return this.buildResponse(true, data);
        } catch (error) {
            return this.handleError(error, 'image mode advanced search');
        }
    }
    
    private async _advancedSearchTextMode(): Promise<ApiResponse> {
        try {
            const response = await this.client.get('/seri/list-mode/');
            const $ = cheerio.load(response.data);
            
            const data: any = {
                mode: 'text',
                title: '',
                results: {}
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
                                    slug: this.extractSlug(href),
                                    rel_id: link.attr('rel') || '',
                                    url: href ? new URL(href, this.baseUrl).toString() : ''
                                });
                            }
                        });
                    }
                });
            }
            
            return this.buildResponse(true, data);
        } catch (error) {
            return this.handleError(error, 'text mode advanced search');
        }
    }
    
    async quickfilter(): Promise<ApiResponse> {
        try {
            const response = await this.client.get('/seri/');
            const $ = cheerio.load(response.data);
            const data: any = {
                checkbox_filters: {},
                radio_filters: {}
            };
            
            const quickFilter = $('.advancedsearch .quickfilter');
            if (quickFilter.length) {
                const checkboxFilters = ['genre', 'studio', 'season'];
                checkboxFilters.forEach(filterType => {
                    const filterDiv = quickFilter.find(`.filter.dropdown:contains("${filterType.charAt(0).toUpperCase() + filterType.slice(1)}")`);
                    if (filterDiv.length) {
                        const items: Array<{value: string, label: string}> = [];
                        filterDiv.find('input[type="checkbox"]').each((_: any, el: any) => {
                            items.push({
                                value: $(el).attr('value') || '',
                                label: $(el).next('label').text().trim()
                            });
                        });
                        
                        data.checkbox_filters[filterType] = {
                            label: filterDiv.find('.dropdown-toggle').text().trim(),
                            type: 'checkbox',
                            multiple: true,
                            items
                        };
                    }
                });
                
                const radioFilters = ['status', 'type', 'order', 'sub'];
                radioFilters.forEach(filterType => {
                    const filterDiv = quickFilter.find(`.filter.dropdown:contains("${filterType.charAt(0).toUpperCase() + filterType.slice(1)}")`);
                    if (filterDiv.length) {
                        const items: Array<{value: string, label: string}> = [];
                        filterDiv.find('input[type="radio"]').each((_: any, el: any) => {
                            items.push({
                                value: $(el).attr('value') || '',
                                label: $(el).next('label').text().trim()
                            });
                        });
                        
                        data.radio_filters[filterType] = {
                            label: filterDiv.find('.dropdown-toggle').text().trim(),
                            type: 'radio',
                            multiple: false,
                            items
                        };
                    }
                });
            }
            
            return this.buildResponse(true, data);
        } catch (error) {
            return this.handleError(error, 'parse quickfilter');
        }
    }
}

export default AnichinScraper;

if (typeof window !== 'undefined') {
    (window as any).AnichinScraper = AnichinScraper;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnichinScraper;
    module.exports.default = AnichinScraper;
}
