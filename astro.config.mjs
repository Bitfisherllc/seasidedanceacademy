import { defineConfig } from 'astro/config';
import { imageForId as facebookImage, feedForClient as facebookFeed } from './api/facebook-feed.js';
import { feedForClient, imageForCode } from './api/instagram-feed.js';
import { verifyTurnstile } from './api/turnstile-verify.js';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export default defineConfig({
  site: 'https://www.seasidedanceacademy.net',
  build: {
    format: 'file',
  },
  vite: {
    plugins: [
      {
        name: 'preserve-html-extension-dev',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url) return next();
            const [path, query = ''] = req.url.split('?');
            if (path === '/api/instagram') {
              const posts = await feedForClient();
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'public, max-age=60');
              res.end(JSON.stringify({ posts }));
              return;
            }
            if (path === '/api/instagram-image') {
              const code = new URLSearchParams(query).get('code') || '';
              const image = await imageForCode(code);
              if (!image) {
                res.statusCode = 404;
                res.end('Not found');
                return;
              }
              res.setHeader('Content-Type', image.contentType);
              res.setHeader('Cache-Control', 'public, max-age=3600');
              res.end(image.body);
              return;
            }
            if (path === '/api/facebook') {
              const posts = await facebookFeed();
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'public, max-age=60');
              res.end(JSON.stringify({ posts }));
              return;
            }
            if (path === '/api/turnstile') {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.setHeader('Allow', 'POST');
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Cache-Control', 'no-store');
                res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
                return;
              }
              let body = {};
              try {
                body = JSON.parse((await readBody(req)) || '{}');
              } catch {
                body = {};
              }
              const result = await verifyTurnstile({
                token: body.token,
                action: body.action,
                remoteip: req.socket?.remoteAddress || '',
              });
              res.statusCode = result.status;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'no-store');
              res.end(JSON.stringify({ ok: result.ok, error: result.error || '' }));
              return;
            }
            if (path === '/api/facebook-image') {
              const id = new URLSearchParams(query).get('id') || '';
              const image = await facebookImage(id);
              if (!image) {
                res.statusCode = 404;
                res.end('Not found');
                return;
              }
              res.setHeader('Content-Type', image.contentType);
              res.setHeader('Cache-Control', 'public, max-age=3600');
              res.end(image.body);
              return;
            }
            if (path.endsWith('.html')) {
              let stripped = path.replace(/\.html$/, '');
              if (stripped === '/index' || stripped === '') stripped = '/';
              req.url = stripped + (query ? `?${query}` : '');
            }
            next();
          });
        },
      },
    ],
  },
});
