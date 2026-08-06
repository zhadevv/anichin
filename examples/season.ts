import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();
const slug = process.argv[2] || '2025';

scraper.season(slug).then(res => report(`season "${slug}"`, res));
