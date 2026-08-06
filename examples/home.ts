import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();

scraper.home(1).then(res => report('home', res));
