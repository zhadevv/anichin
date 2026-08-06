import AnichinScraper from '../src/index';
import { report } from './_helpers';

const scraper = new AnichinScraper();
const slug = process.argv[2] || 'release-that-witch';
const episode = parseInt(process.argv[3] || '1', 10);

// watch() automatically falls back to the "-tamat-" URL if `episode`
// turns out to be the series' final episode — no need to know that ahead
// of time. Check `res.data.watch.is_final_episode` afterward if you care.
scraper.watch(slug, episode).then(res => report(`watch "${slug}" episode ${episode}`, res));
