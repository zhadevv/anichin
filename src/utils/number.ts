export function formatEpisodeNumber(episode: number): string {
    return episode < 10 ? `0${episode}` : episode.toString();
}

export function extractEpisodeNumber(episodeText: string): string {
    if (!episodeText) return '';
    const match = episodeText.match(/\d+/);
    return match ? match[0] : '';
}
