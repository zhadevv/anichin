import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();
const slug = process.argv[2] || 'tencent-video';

scraper.network(slug, 1).then(res => report(`network "${slug}"`, res));
