import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();
const slug = process.argv[2] || 'action';

scraper.genres(slug, 1).then(res => report(`genre "${slug}"`, res));
