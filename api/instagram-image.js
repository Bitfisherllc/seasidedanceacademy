import { imageForCode } from './instagram-feed.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method not allowed');
  }
  const code = String(req.query?.code || '');
  const image = await imageForCode(code);
  if (!image) return res.status(404).end('Not found');
  res.setHeader('Content-Type', image.contentType);
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.status(200).end(image.body);
}
