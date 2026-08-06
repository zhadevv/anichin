import { AnichinScraper } from './client/Anichin';

export { AnichinScraper };
export type { ApiResponse, ScraperConfig, ProxyConfig, ScraperContext, ListCardItem, PaginationData } from './types/common';
export type { AdvancedSearchFilter } from './types/filters';
export type { SidebarData } from './types/sidebar';
export { LIBRARY_VERSION } from './constants/version';

export default AnichinScraper;

if (typeof window !== 'undefined') {
    (window as any).AnichinScraper = AnichinScraper;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnichinScraper;
    module.exports.default = AnichinScraper;
}
