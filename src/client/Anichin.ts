import { ApiResponse, ScraperConfig } from '../types/common';
import { AdvancedSearchFilter } from '../types/filters';
import { createRequestClient } from './RequestClient';
import * as api from '../api';

export class AnichinScraper {
    private readonly client: any;
    private readonly baseUrl: string;

    constructor(config: ScraperConfig = {}) {
        const { client, baseUrl } = createRequestClient(config);
        this.client = client;
        this.baseUrl = baseUrl;
    }

    private get ctx() {
        return { client: this.client, baseUrl: this.baseUrl };
    }

    async sidebar(): Promise<ApiResponse> {
        return api.fetchSidebar(this.ctx);
    }

    async home(page: number = 1): Promise<ApiResponse> {
        return api.fetchHome(this.ctx, page);
    }

    async search(query: string, page: number = 1): Promise<ApiResponse> {
        return api.fetchSearch(this.ctx, query, page);
    }

    async schedule(day?: string): Promise<ApiResponse> {
        return api.fetchSchedule(this.ctx, day);
    }

    async ongoing(page: number = 1): Promise<ApiResponse> {
        return api.fetchOngoing(this.ctx, page);
    }

    async completed(page: number = 1): Promise<ApiResponse> {
        return api.fetchCompleted(this.ctx, page);
    }

    async azlist(page: number = 1, letter?: string): Promise<ApiResponse> {
        return api.fetchAzList(this.ctx, page, letter);
    }

    async genres(slug: string, page: number = 1): Promise<ApiResponse> {
        return api.fetchGenre(this.ctx, slug, page);
    }

    async season(slug: string): Promise<ApiResponse> {
        return api.fetchSeason(this.ctx, slug);
    }

    async studio(slug: string, page: number = 1): Promise<ApiResponse> {
        return api.fetchStudio(this.ctx, slug, page);
    }

    async network(slug: string, page: number = 1): Promise<ApiResponse> {
        return api.fetchNetwork(this.ctx, slug, page);
    }

    async country(slug: string, page: number = 1): Promise<ApiResponse> {
        return api.fetchCountry(this.ctx, slug, page);
    }

    async series(slug: string): Promise<ApiResponse> {
        return api.fetchSeries(this.ctx, slug);
    }

    // Fetches an episode watch page. Automatically detects and falls back to
    // the "-tamat-" URL variant Anichin uses for a series' final episode.
    async watch(slug: string, episode: number): Promise<ApiResponse> {
        return api.fetchWatch(this.ctx, slug, episode);
    }

    async advancedsearch(mode: 'image' | 'text' = 'image', filter?: AdvancedSearchFilter, page: number = 1): Promise<ApiResponse> {
        return api.fetchAdvancedSearch(this.ctx, mode, filter, page);
    }

    async quickfilter(): Promise<ApiResponse> {
        return api.fetchQuickFilter(this.ctx);
    }
}

export default AnichinScraper;
