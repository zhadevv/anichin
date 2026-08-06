import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();
const slug = process.argv[2] || 'china';

scraper.country(slug, 1).then(res => report(`country "${slug}"`, res));
