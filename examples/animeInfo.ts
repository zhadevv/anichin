import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();
const slug = process.argv[2] || 'release-that-witch';

scraper.series(slug).then(res => report(`series "${slug}"`, res));
