import type { APIRoute } from 'astro';
import { albums } from '../data/albums';
import { site } from '../data/site';

const paths = [
  '/',
  '/classes.html',
  '/registration.html',
  '/seaside-news.html',
  '/photos--videos.html',
  '/reviews.html',
  '/q-and-a.html',
  '/photos--videos/instagram.html',
  ...albums.map((album) => album.href),
  '/contact.html',
  '/directions.html',
];

export const GET: APIRoute = () => {
  const urls = paths
    .map((path) => `  <url><loc>${new URL(path, site.url).href}</loc></url>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
