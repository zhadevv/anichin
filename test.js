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
    console.log(`✓ Saved: ${filename}`);
}

async function generateExamples() {
    const scraper = new AnichinScraper();
    const baseDir = 'response_examples';
    
    console.log('Generating response examples...\n');
    
    try {
        // 1. Homepage examples
        console.log('📺 Generating homepage examples...');
        const homeResponse = await scraper.home();
        await saveResponse(path.join(baseDir, 'home', 'home.json'), homeResponse);
        
        const homePage2 = await scraper.home(2);
        await saveResponse(path.join(baseDir, 'home', 'page', 'home_2.json'), homePage2);
        
        // 2. Sidebar
        console.log('\nGenerating sidebar example...');
        const sidebarResponse = await scraper.sidebar();
        await saveResponse(path.join(baseDir, 'sidebar.json'), sidebarResponse);
        
        // 3. Search examples
        console.log('\nGenerating search examples...');
        const searchResponse = await scraper.search('renegade immortal');
        await saveResponse(
            path.join(baseDir, 'search', 'query', 'renegade%20immortal', 'renegade%20immortal.json'), 
            searchResponse
        );
        
        const searchPage2 = await scraper.search('renegade immortal', 2);
        await saveResponse(
            path.join(baseDir, 'search', 'query', 'renegade%20immortal', 'page', 'renegade%20immortal_2.json'),
            searchPage2
        );
        
        // 4. Schedule examples
        console.log('\nGenerating schedule examples...');
        const scheduleResponse = await scraper.schedule();
        await saveResponse(path.join(baseDir, 'schedule', 'schedule.json'), scheduleResponse);
        
        const mondaySchedule = await scraper.schedule('monday');
        await saveResponse(path.join(baseDir, 'schedule', 'day', 'schedule_monday.json'), mondaySchedule);
        
        // 5. Series detail example
        console.log('\nGenerating series detail examples...');
        const seriesResponse = await scraper.series('battle-through-the-heavens-season-5');
        await saveResponse(
            path.join(baseDir, 'series', 'slug', 'battle-through-the-heavens-season-5', 'battle-through-the-heavens-season-5.json'),
            seriesResponse
        );
        
        // 6. Watch example
        console.log('\nGenerating watch example...');
        const watchResponse = await scraper.watch('renegade_immortal', 130);
        await saveResponse(
            path.join(baseDir, 'watch', 'slug', 'renegade_immortal', 'episode', '130.json'),
            watchResponse
        );
        
        // 7. Ongoing series
        console.log('\n⏳enerating ongoing series examples...');
        const ongoingResponse = await scraper.ongoing();
        await saveResponse(path.join(baseDir, 'lists', 'ongoing', 'ongoing.json'), ongoingResponse);
        
        const ongoingPage2 = await scraper.ongoing(2);
        await saveResponse(path.join(baseDir, 'lists', 'ongoing', 'page', 'ongoing_2.json'), ongoingPage2);
        
        // 8. Completed series
        console.log('\nGenerating completed series examples...');
        const completedResponse = await scraper.completed();
        await saveResponse(path.join(baseDir, 'lists', 'completed', 'completed.json'), completedResponse);
        
        // 9. A-Z List
        console.log('\nGenerating A-Z list examples...');
        const azListResponse = await scraper.azlist();
        await saveResponse(path.join(baseDir, 'lists', 'azlist', 'azlist.json'), azListResponse);
        
        const azListA = await scraper.azlist(1, 'A');
        await saveResponse(path.join(baseDir, 'lists', 'azlist', 'letter', 'A.json'), azListA);
        
        // 10. Genres
        console.log('\nGenerating genres examples...');
        const actionGenre = await scraper.genres('action');
        await saveResponse(path.join(baseDir, 'lists', 'genres', 'action', 'action.json'), actionGenre);
        
        // 11. Season
        console.log('\nGenerating season examples...');
        const winterSeason = await scraper.season('winter-2024');
        await saveResponse(path.join(baseDir, 'lists', 'season', 'winter-2024', 'winter-2024.json'), winterSeason);
        
        // 12. Studio
        console.log('\nGenerating studio examples...');
        const studioResponse = await scraper.studio('motion-magic');
        await saveResponse(path.join(baseDir, 'lists', 'studio', 'motion-magic', 'motion-magic.json'), studioResponse);
        
        // 13. Network
        console.log('\nGenerating network examples...');
        const networkResponse = await scraper.network('iqiyi');
        await saveResponse(path.join(baseDir, 'lists', 'network', 'iqiyi', 'iqiyi.json'), networkResponse);
        
        // 14. Country
        console.log('\nGenerating country examples...');
        const chinaCountry = await scraper.country('china');
        await saveResponse(path.join(baseDir, 'lists', 'country', 'china', 'china.json'), chinaCountry);
        
        // 15. Advanced Search - Text Mode
        console.log('\nGenerating advanced search text mode...');
        const advancedText = await scraper.advancedsearch('text');
        await saveResponse(path.join(baseDir, 'search', 'advanced', 'text_mode.json'), advancedText);
        
        // 16. Advanced Search - Image Mode
        console.log('\nGenerating advanced search image mode...');
        const advancedImage = await scraper.advancedsearch('image');
        await saveResponse(path.join(baseDir, 'search', 'advanced', 'image_mode.json'), advancedImage);
        
        // 17. Quick Filter
        console.log('\nGenerating quick filter...');
        const quickFilter = await scraper.quickfilter();
        await saveResponse(path.join(baseDir, 'filters', 'quickfilter.json'), quickFilter);
        
        console.log('\nAll examples generated successfully!');
        
    } catch (error) {
        console.error('\nError generating examples:', error);
    }
}

async function main() {
    try {
        await generateExamples();
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { generateExamples };
