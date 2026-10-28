import seed from '../src/data/news-page.json' with { type: 'json' };
import { handlePage } from './page-store.js';

const options = {
  seed,
  fileName: 'news-page.json',
  uploadName: 'news-banner',
  bannerFallback: '/images/hero/stage-lilac.jpg',
  label: 'news page',
  text: {
    title: ['Heading', 40],
    lead: ['First paragraph', 220, true],
    account: ['Second paragraph', 160, true],
    button: ['Button', 40],
  },
};

export function handleNews(req, res) {
  return handlePage(req, res, options);
}

export default function handler(req, res) {
  return handleNews(req, res);
}
