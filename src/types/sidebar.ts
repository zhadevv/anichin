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
        genres: Array<{ name: string; slug: string }>;
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
