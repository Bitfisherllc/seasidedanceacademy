import seed from '../src/data/classes-page.json' with { type: 'json' };
import { handlePage } from './page-store.js';

const options = {
  seed,
  fileName: 'classes-page.json',
  uploadName: 'classes-banner',
  bannerFallback: '/images/hero/stage-green.jpg',
  label: 'classes page',
  text: {
    title: ['Heading', 40],
    year: ['Season', 20],
    season: ['Registration line', 120],
    start: ['Start line', 80],
    disclaimer: ['Note', 240, true],
    balletTitle: ['Ballet heading', 60],
    balletGuide: ['Ballet paragraph', 600, true],
    hipHopTitle: ['Hip hop heading', 40],
    hipHopGuide: ['Hip hop paragraph', 500, true],
  },
};

export function handleClasses(req, res) {
  return handlePage(req, res, options);
}

export default function handler(req, res) {
  return handleClasses(req, res);
}
