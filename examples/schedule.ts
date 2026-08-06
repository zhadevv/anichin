import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();
const day = process.argv[2];

scraper.schedule(day).then(res => report(day ? `schedule (${day})` : 'schedule (full week)', res));
