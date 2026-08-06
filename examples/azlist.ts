import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();
const letter = process.argv[2];

scraper.azlist(1, letter).then(res => report(letter ? `azlist (${letter})` : 'azlist (all)', res));
