const { createScraper } = require('./_shared');

// Fast health check: hits only the homepage and confirms the response has
// the expected shape. Intended for a quick "is scraping still working"
// check without writing anything to disk or hitting every endpoint.
async function main() {
    const scraper = createScraper({ requestDelay: 0 });
    const res = await scraper.home(1);

    if (!res.success) {
        console.error('SMOKE TEST FAILED:', res.message);
        process.exitCode = 1;
        return;
    }

    const hasSlider = Array.isArray(res.data.home.slider);
    const hasLatest = Array.isArray(res.data.home.latest_release) && res.data.home.latest_release.length > 0;

    if (!hasSlider || !hasLatest) {
        console.error('SMOKE TEST FAILED: home() response shape looks wrong', {
            hasSlider,
            hasLatest,
        });
        process.exitCode = 1;
        return;
    }

    console.log('SMOKE TEST OK:', res.data.home.latest_release.length, 'items on the latest-release grid');
}

main().catch(err => {
    console.error('SMOKE TEST FAILED:', err);
    process.exitCode = 1;
});
