const fs = require('fs');
const path = require('path');
const AnichinScraper = require('./src/Anichin.ts').default;

async function ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function saveResponse(filename, response) {
    const dir = path.dirname(filename);
    await ensureDirectory(dir);
    const data = JSON.stringify(response, null, 2);
    fs.writeFileSync(filename, data);
    console.log(`Saved ${filename}`);
}

async function main() {
    console.log('Testing Anichin Scraper v0.0.4...');
    
    const scraper = new AnichinScraper({
        baseUrl: 'https://anichin.cafe',
        requestDelay: 2000
    });
    
    await ensureDirectory('response_examples');
    
    try {
        const sidebar = await scraper.sidebar();
        await saveResponse('response_examples/sidebar.json', sidebar);
        
        const quickfilter = await scraper.quickfilter();
        await saveResponse('response_examples/quickfilter.json', quickfilter);
        
        const home1 = await scraper.home(1);
        await saveResponse('response_examples/with-pagination/home/home.json', home1);
        
        const home2 = await scraper.home(2);
        await saveResponse('response_examples/with-pagination/home/home-page-2.json', home2);
        
        const search1 = await scraper.search('A', 1);
        await saveResponse('response_examples/with-pagination/search/query_A.json', search1);
        
        const search2 = await scraper.search('A', 1);
        await saveResponse('response_examples/with-pagination/search/query_A-page-2.json', search2);
        
        const schedule1 = await scraper.schedule();
        await saveResponse('response_examples/with-pagination/schedule/all.json', schedule1);
        
        const schedule2 = await scraper.schedule('monday');
        await saveResponse('response_examples/with-pagination/schedule/monday.json', schedule2);
        
        const ongoing1 = await scraper.ongoing(1);
        await saveResponse('response_examples/with-pagination/ongoing/ongoing.json', ongoing1);
        
        const ongoing2 = await scraper.ongoing(2);
        await saveResponse('response_examples/with-pagination/ongoing/ongoing-page-2.json', ongoing2);
        
        const completed1 = await scraper.completed(1);
        await saveResponse('response_examples/with-pagination/completed/completed.json', completed1);
        
        const completed2 = await scraper.completed(2);
        await saveResponse('response_examples/with-pagination/completed/completed-page-2.json', completed2);
        
        const az1 = await scraper.azlist(1);
        await saveResponse('response_examples/with-pagination/azlist/all-page-1.json', az1);
        
        const az2 = await scraper.azlist(2);
        await saveResponse('response_examples/with-pagination/azlist/all-page-2.json', az2);
        
        const az3 = await scraper.azlist(1, 'A');
        await saveResponse('response_examples/with-pagination/azlist/letter_A/A-page-1.json', az3);
        
        const az4 = await scraper.azlist(2, 'A');
        await saveResponse('response_examples/with-pagination/azlist/letter_A/A-page-2.json', az4);
        
        const modetext = await scraper.advancedsearch('text');
        await saveResponse('response_examples/with-pagination/advanced_search/text-mode.json', modetext);
        
        const modeimage1 = await scraper.advancedsearch('image');
        await saveResponse('response_examples/with-pagination/advanced_search/image-mode/without-filter.json', modeimage1);
        
        const modeimage2 = await scraper.advancedsearch('image', {
          genres: ['action', 'fantasy'], 
          seasons: ['2025'], 
          status: 'ongoing'
        });
        await saveResponse('response_examples/with-pagination/advanced_search/image-mode/with-filter.json', modeimage2);
        
        const series = await scraper.series('battle-through-the-heavens-season-5');
        await saveResponse('response_examples/with-pagination/with-slug/series/battle-through-the-heavens-season-5.json', series);
        
        const watch = await scraper.watch('battle-through-the-heavens-season-5', 2);
        await saveResponse('response_examples/with-pagination/with-slug/series/watch/episode-2.json', watch);
        
        const genres1 = await scraper.genres('action', 1);
        await saveResponse('response_examples/with-pagination/with-slug/genres/action-page-1.json', genres1);
        
        const genres2 = await scraper.genres('action', 2);
        await saveResponse('response_examples/with-pagination/with-slug/genres/action-page-2.json', genres2);
        
        const season1 = await scraper.season('2025');
        await saveResponse('response_examples/with-pagination/with-slug/seasons/2025-page-1.json', season1);
                
        const network1 = await scraper.network('iqiyi', 1);
        await saveResponse('response_examples/with-pagination/with-slug/networks/iqiyi-page-1.json', network1);
        
        const network2 = await scraper.network('iqiyi', 2);
        await saveResponse('response_examples/with-pagination/with-slug/networks/iqiyi-page-2.json', network2);
        
        const studio = await scraper.studio('motion-magic', 1);
        await saveResponse('response_examples/with-pagination/with-slug/studios/motion_magic-page-1.json', studio);
        
        const country1 = await scraper.country('china', 1);
        await saveResponse('response_examples/with-pagination/with-slug/countries/china-page-1.json', country1);
        
        const country2 = await scraper.country('china', 2);
        await saveResponse('response_examples/with-pagination/with-slug/countries/china-page-2.json', country2);
        
        console.log('Testing completed! All files saved to response_examples/');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

if (require.main === module) {
    main();
}
