import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();
const query = process.argv[2] || 'release that witch';

scraper.search(query, 1).then(res => report(`search "${query}"`, res));
