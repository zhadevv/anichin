import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();

scraper.completed(1).then(res => report('completed', res));
