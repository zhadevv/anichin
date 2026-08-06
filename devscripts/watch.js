const { saveResponse, createScraper } = require('./_shared');

// Exercises both branches of the v0.0.5 tamat fallback: pass a slug/episode
// that is NOT the series' final episode as the first arg pair, and (optionally)
// a slug/episode that IS the final episode as the second pair, e.g.:
//   node devscripts/watch.js some-ongoing-series 3 release-that-witch 8
async function main() {
    const scraper = createScraper();

    const ongoingSlug = process.argv[2] || 'release-that-witch';
    const ongoingEpisode = parseInt(process.argv[3] || '1', 10);
    const ongoingRes = await scraper.watch(ongoingSlug, ongoingEpisode);
    await saveResponse(
        `response_examples/watch/${ongoingSlug}-episode-${ongoingEpisode}.json`,
        ongoingRes
    );
    console.log('is_final_episode:', ongoingRes.data && ongoingRes.data.watch.is_final_episode);

    const finalSlug = process.argv[4];
    const finalEpisode = process.argv[5] ? parseInt(process.argv[5], 10) : null;
    if (finalSlug && finalEpisode) {
        const finalRes = await scraper.watch(finalSlug, finalEpisode);
        await saveResponse(
            `response_examples/watch/${finalSlug}-episode-${finalEpisode}-tamat.json`,
            finalRes
        );
        console.log('is_final_episode:', finalRes.data && finalRes.data.watch.is_final_episode);
    }
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
