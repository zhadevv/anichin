export function resolveUrl(href: string | undefined | null, baseUrl: string): string {
    if (!href) return '';
    try {
        return new URL(href, baseUrl).toString();
    } catch {
        return '';
    }
}
