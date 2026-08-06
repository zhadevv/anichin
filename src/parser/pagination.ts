import { PaginationData } from '../types/common';
import { resolveUrl } from '../utils/url';

export function parsePagination($: any, baseUrl: string): PaginationData {
    const pagination: PaginationData = {
        current_page: 1,
        total_pages: 1,
        has_prev: false,
        has_next: false,
        prev: { url: '', text: '' },
        next: { url: '', text: '' },
        pages: [],
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
            url: resolveUrl(prevLink.attr('href'), baseUrl),
            text: prevLink.text().trim(),
        };
    }

    if (nextLink.length) {
        pagination.has_next = true;
        pagination.next = {
            url: resolveUrl(nextLink.attr('href'), baseUrl),
            text: nextLink.text().trim(),
        };
    }

    paginationDiv.find('.page-numbers').each((_: any, el: any) => {
        const pageNum = parseInt($(el).text().trim());
        if (!isNaN(pageNum)) {
            pagination.pages.push({
                number: pageNum,
                url: resolveUrl($(el).attr('href'), baseUrl),
                is_current: $(el).hasClass('current'),
            });
        }
    });

    if (pagination.pages.length > 0) {
        pagination.total_pages = Math.max(...pagination.pages.map(p => p.number));
    }

    return pagination;
}
