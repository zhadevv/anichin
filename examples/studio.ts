import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();
const slug = process.argv[2] || 'motion-magic';

scraper.studio(slug, 1).then(res => report(`studio "${slug}"`, res));
