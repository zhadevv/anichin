import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();

scraper.sidebar().then(res => report('sidebar', res));
