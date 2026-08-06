export interface ApiResponse<T = any> {
    success: boolean;
    creator: string;
    data: T;
    metadata: any;
    message: string | null;
}

export interface ProxyConfig {
    host: string;
    port: number;
    protocol?: 'http' | 'https' | 'socks' | 'socks5';
    auth?: {
        username: string;
        password: string;
    };
}

export interface ScraperConfig {
    baseUrl?: string;
    userAgent?: string;
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
    proxy?: ProxyConfig;
    requestDelay?: number;
}

export interface ScraperContext {
    client: any;
    baseUrl: string;
}

export interface ListCardItem {
    title: string;
    slug: string;
    thumbnail: string;
    episode: string;
    type: string;
    badge: string;
    url: string;
}

export interface PaginationLink {
    url: string;
    text: string;
}

export interface PaginationPage {
    number: number;
    url: string;
    is_current: boolean;
}

export interface PaginationData {
    current_page: number;
    total_pages: number;
    has_prev: boolean;
    has_next: boolean;
    prev: PaginationLink;
    next: PaginationLink;
    pages: PaginationPage[];
}
