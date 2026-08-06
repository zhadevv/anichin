export interface FilterGroup {
    label: string;
    type: 'checkbox' | 'radio';
    multiple: boolean;
    items: Array<{ value: string; label: string }>;
}

export function parseQuickFilterPage($: any): { checkbox_filters: Record<string, FilterGroup>; radio_filters: Record<string, FilterGroup> } {
    const data = {
        checkbox_filters: {} as Record<string, FilterGroup>,
        radio_filters: {} as Record<string, FilterGroup>,
    };

    const quickFilter = $('.advancedsearch .quickfilter');
    if (!quickFilter.length) return data;

    const checkboxFilters = ['genre', 'studio', 'season'];
    checkboxFilters.forEach(filterType => {
        const label = filterType.charAt(0).toUpperCase() + filterType.slice(1);
        const filterDiv = quickFilter.find(`.filter.dropdown:contains("${label}")`);
        if (filterDiv.length) {
            const items: Array<{ value: string; label: string }> = [];
            filterDiv.find('input[type="checkbox"]').each((_: any, el: any) => {
                items.push({
                    value: $(el).attr('value') || '',
                    label: $(el).next('label').text().trim(),
                });
            });

            data.checkbox_filters[filterType] = {
                label: filterDiv.find('.dropdown-toggle').text().trim(),
                type: 'checkbox',
                multiple: true,
                items,
            };
        }
    });

    const radioFilters = ['status', 'type', 'order', 'sub'];
    radioFilters.forEach(filterType => {
        const label = filterType.charAt(0).toUpperCase() + filterType.slice(1);
        const filterDiv = quickFilter.find(`.filter.dropdown:contains("${label}")`);
        if (filterDiv.length) {
            const items: Array<{ value: string; label: string }> = [];
            filterDiv.find('input[type="radio"]').each((_: any, el: any) => {
                items.push({
                    value: $(el).attr('value') || '',
                    label: $(el).next('label').text().trim(),
                });
            });

            data.radio_filters[filterType] = {
                label: filterDiv.find('.dropdown-toggle').text().trim(),
                type: 'radio',
                multiple: false,
                items,
            };
        }
    });

    return data;
}
