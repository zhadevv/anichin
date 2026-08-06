import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();

scraper.quickfilter().then(res => report('quickfilter', res));
