import seed from '../src/data/hero.json' with { type: 'json' };
import { handlePage } from './page-store.js';

const options = {
  seed,
  fileName: 'hero.json',
  uploadName: 'hero-quote',
  bannerFallback: '',
  label: 'hero quote',
  banner: false,
  text: {
    classes: ['Quote', 280],
    news: ['Quote', 280],
    photos: ['Quote', 280],
    reviews: ['Quote', 280],
    directions: ['Quote', 280],
    qa: ['Quote', 280],
    contact: ['Quote', 280],
    registration: ['Quote', 280],
    instagram: ['Quote', 280],
    gallery: ['Quote', 280],
  },
};

export function handleHeroQuote(req, res) {
  return handlePage(req, res, options);
}

export default function handler(req, res) {
  return handleHeroQuote(req, res);
}
