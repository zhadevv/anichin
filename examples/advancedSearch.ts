import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();

async function main() {
    const textMode = await scraper.advancedsearch('text');
    report('advancedsearch (text mode)', textMode);

    const imageMode = await scraper.advancedsearch('image', {
        status: 'ongoing',
        genres: ['action', 'fantasy'],
        seasons: ['2025'],
    });
    report('advancedsearch (image mode, filtered)', imageMode);
}

main();
