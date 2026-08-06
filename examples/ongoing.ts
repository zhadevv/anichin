import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();

scraper.ongoing(1).then(res => report('ongoing', res));
