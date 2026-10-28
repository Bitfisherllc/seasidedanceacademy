import seed from '../src/data/reviews-page.json' with { type: 'json' };
import { handlePage } from './page-store.js';

const options = {
  seed,
  fileName: 'reviews-page.json',
  uploadName: 'reviews-banner',
  bannerFallback: '/images/hero/group-pink.jpg',
  label: 'reviews page',
  text: {
    title: ['Heading', 40],
    subtitle: ['Subtitle', 40],
    heading: ['Section heading', 80],
    lead: ['Paragraph', 360, true],
    readLabel: ['Read button', 40],
    writeLabel: ['Write button', 40],
  },
};

export function handleReviewsPage(req, res) {
  return handlePage(req, res, options);
}

export default function handler(req, res) {
  return handleReviewsPage(req, res);
}
