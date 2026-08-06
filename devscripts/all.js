const { saveResponse, createScraper, ensureDirectory } = require('./_shared');
const { LIBRARY_VERSION } = require('../src/constants/version');

// Live smoke run across every endpoint, saving one real response per
// endpoint under response_examples/. This is the devscripts equivalent of
// the old root-level test.js and is meant to be run manually against the
// live site, not as part of CI (see docs/architecture/request.md for why
// this library doesn't mock the network in its own test suite for this
// script specifically).
async function main() {
    console.log(`Testing Anichin Scraper v${LIBRARY_VERSION}...`);

    const scraper = createScraper();
    ensureDirectory('response_examples');

    const sidebar = await scraper.sidebar();
    await saveResponse('response_examples/sidebar.json', sidebar);

    const home = await scraper.home(1);
    await saveResponse('response_examples/home/page-1.json', home);

    const ongoing = await scraper.ongoing(1);
    await saveResponse('response_examples/ongoing/page-1.json', ongoing);

    const completed = await scraper.completed(1);
    await saveResponse('response_examples/completed/page-1.json', completed);

    const search = await scraper.search('release that witch', 1);
    await saveResponse('response_examples/search/release-that-witch.json', search);

    const quickfilter = await scraper.quickfilter();
    await saveResponse('response_examples/quickfilter.json', quickfilter);

    const advancedImage = await scraper.advancedsearch('image', { status: 'ongoing' }, 1);
    await saveResponse('response_examples/advanced_search/image-mode.json', advancedImage);

    const advancedText = await scraper.advancedsearch('text');
    await saveResponse('response_examples/advanced_search/text-mode.json', advancedText);

    const schedule = await scraper.schedule();
    await saveResponse('response_examples/schedule/full-week.json', schedule);

    const azlist = await scraper.azlist(1);
    await saveResponse('response_examples/azlist/page-1.json', azlist);

    const series = await scraper.series('release-that-witch');
    await saveResponse('response_examples/anime/release-that-witch.json', series);

    // Exercise both watch() branches: a regular episode, then (if the
    // series info we just fetched has a completed status) its final episode.
    const watchOngoing = await scraper.watch('release-that-witch', 1);
    await saveResponse('response_examples/watch/release-that-witch-episode-1.json', watchOngoing);

    if (series.success && series.data.detail.information.status?.toLowerCase().includes('complete')) {
        const totalEpisodes = parseInt(series.data.detail.information.total_episode, 10);
        if (!isNaN(totalEpisodes)) {
            const watchFinal = await scraper.watch('release-that-witch', totalEpisodes);
            await saveResponse(
                `response_examples/watch/release-that-witch-episode-${totalEpisodes}-final.json`,
                watchFinal
            );
            console.log('final episode is_final_episode:', watchFinal.data && watchFinal.data.watch.is_final_episode);
        }
    }

    console.log('Done.');
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
