import seed from '../src/data/qa.json' with { type: 'json' };
import { handlePage } from './page-store.js';

const options = {
  seed,
  fileName: 'qa.json',
  uploadName: 'qa-banner',
  bannerFallback: '/images/hero/stage-lilac.jpg',
  label: 'Q & A page',
  text: {
    title: ['Heading', 40],
    lead: ['Paragraph', 280],
  },
  list: {
    max: 40,
    question: ['Question', 160],
    answer: ['Answer', 800],
  },
};

export function handleQa(req, res) {
  return handlePage(req, res, options);
}

export default function handler(req, res) {
  return handleQa(req, res);
}
