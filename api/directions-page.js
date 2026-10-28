import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import seed from '../src/data/directions.json' with { type: 'json' };
import { readSession } from './studio-classes.js';
import { richWords } from './rich-text.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'src/data/directions.json');
const PUBLIC = path.join(ROOT, 'public');
const REPO = process.env.GITHUB_REPO || 'Bitfisherllc/seasidedanceacademy';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TEXT = {
  title: ['Heading', 40],
  note: ['Paragraph', 320, true],
  button: ['Button', 40],
  hours: ['Hours', 80],
};

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body) return JSON.parse(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

function words(value, label, max) {
  const clean = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) throw new Error(`${label} is required.`);
  if (clean.length > max) throw new Error(`${label} is too long.`);
  if (/[<>]/.test(clean)) throw new Error(`${label} cannot include < or >.`);
  return clean;
}

function photoSrc(value, label) {
  const clean = String(value ?? '').trim();
  if (!/^\/images\/[a-z0-9][a-z0-9./_-]*\.(?:jpe?g|png|webp)$/i.test(clean) || clean.includes('..')) {
    throw new Error(`${label} has to be a photo on this site.`);
  }
  const file = path.resolve(PUBLIC, clean.slice(1));
  if (!file.startsWith(path.resolve(PUBLIC, 'images') + path.sep)) {
    throw new Error(`${label} has to be a photo on this site.`);
  }
  if (!existsSync(file) && !clean.startsWith('/images/hero/directions-banner.')) {
    throw new Error(`${label} was not found.`);
  }
  return clean;
}

function photoFocus(value, label) {
  const match = String(value ?? '').trim().match(/^center (\d{1,2})%$/);
  const amount = match ? Number(match[1]) : NaN;
  if (!match || amount < 10 || amount > 90) throw new Error(`Slide ${label} so faces stay in view.`);
  return `center ${amount}%`;
}

function apply(current, body) {
  const next = JSON.parse(JSON.stringify(current));
  if (!next.banner) next.banner = { src: '/images/hero/portrait-smile.jpg', focus: 'center 50%' };
  const incoming = body.values && typeof body.values === 'object' ? body.values : {};
  let changed = false;
  for (const key of Object.keys(incoming)) {
    if (!TEXT[key] && key !== 'banner.src' && key !== 'banner.focus') {
      throw new Error('That part of the page cannot be changed.');
    }
  }
  for (const [key, [label, max, rich]] of Object.entries(TEXT)) {
    if (!Object.prototype.hasOwnProperty.call(incoming, key)) continue;
    next[key] = rich ? richWords(incoming[key], label, max) : words(incoming[key], label, max);
    changed = true;
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'banner.src') || Object.prototype.hasOwnProperty.call(incoming, 'banner.focus')) {
    const src = Object.prototype.hasOwnProperty.call(incoming, 'banner.src') ? incoming['banner.src'] : next.banner.src;
    const focus = Object.prototype.hasOwnProperty.call(incoming, 'banner.focus') ? incoming['banner.focus'] : next.banner.focus;
    next.banner = {
      src: photoSrc(src, 'the banner photo'),
      focus: photoFocus(focus, 'the banner photo'),
    };
    changed = true;
  }
  if (!changed) throw new Error('Nothing to save.');
  return next;
}

function sniff(bytes, type) {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8;
  if (type === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50;
  if (type === 'image/webp') return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  return false;
}

async function saveUpload(upload) {
  const type = String(upload?.type || '');
  const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : type === 'image/jpeg' ? 'jpg' : '';
  if (!ext) throw new Error('Use a JPG, PNG, or WebP photo.');
  const bytes = Buffer.from(String(upload?.data || '').replace(/\s/g, ''), 'base64');
  if (!bytes.length || bytes.length > 5 * 1024 * 1024 || !sniff(bytes, type)) {
    throw new Error('Use a JPG, PNG, or WebP photo under 5 MB.');
  }
  const filename = `directions-banner.${ext}`;
  const rel = `public/images/hero/${filename}`;
  if (process.env.VERCEL) {
    let sha = '';
    try {
      const current = await githubRequest(rel, 'GET');
      sha = current.sha || '';
    } catch (error) {
      if (error.status !== 404) throw error;
    }
    await githubRequest(rel, 'PUT', {
      message: 'Update the directions banner',
      content: bytes.toString('base64'),
      ...(sha ? { sha } : {}),
      branch: BRANCH,
    });
  } else {
    const folder = path.join(PUBLIC, 'images/hero');
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, filename), bytes);
  }
  return `/images/hero/${filename}`;
}

async function githubRequest(filePath, method, extra = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const error = new Error('Add GITHUB_TOKEN in the Vercel project settings so the directions page can save.');
    error.status = 503;
    throw error;
  }
  const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'seaside-dance-academy',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: method === 'GET' ? undefined : JSON.stringify(extra),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 404) {
      const error = new Error('That file is not in the repository yet.');
      error.status = 404;
      throw error;
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error('GitHub rejected the token. Check GITHUB_TOKEN in Vercel.');
    }
    if (response.status === 409) {
      const error = new Error('The directions page changed while saving. Try again.');
      error.status = 409;
      throw error;
    }
    throw new Error(payload.message || 'GitHub could not update the directions page.');
  }
  return payload;
}

async function loadPage() {
  if (process.env.VERCEL && process.env.GITHUB_TOKEN) {
    const payload = await githubRequest('src/data/directions.json', 'GET');
    const text = Buffer.from(String(payload.content || '').replace(/\n/g, ''), 'base64').toString('utf8');
    return { page: JSON.parse(text), sha: payload.sha };
  }
  if (!process.env.VERCEL) {
    return { page: JSON.parse(await readFile(FILE, 'utf8')), sha: '' };
  }
  return { page: seed, sha: '' };
}

async function store(page, sha) {
  const body = `${JSON.stringify(page, null, 2)}\n`;
  if (process.env.VERCEL) {
    await githubRequest('src/data/directions.json', 'PUT', {
      message: 'Update the directions page',
      content: Buffer.from(body, 'utf8').toString('base64'),
      sha,
      branch: BRANCH,
    });
    return true;
  }
  await writeFile(FILE, body);
  return false;
}

export async function handleDirections(req, res) {
  if ((req.method || 'GET') !== 'POST') {
    send(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }
  try {
    if (!readSession(req)) {
      send(res, 401, { ok: false, error: 'Sign in again.' });
      return;
    }
    const body = await readBody(req);
    if (body.image) {
      body.values = body.values && typeof body.values === 'object' ? body.values : {};
      body.values['banner.src'] = await saveUpload(body.image);
    }
    const loaded = await loadPage();
    let page = apply(loaded.page, body);
    let live = false;
    try {
      live = await store(page, loaded.sha);
    } catch (error) {
      if (error.status !== 409) throw error;
      const again = await loadPage();
      page = apply(again.page, body);
      live = await store(page, again.sha);
    }
    send(res, 200, { ok: true, page, live });
  } catch (error) {
    const message = error instanceof SyntaxError ? 'The directions page could not be read.' : error.message;
    send(res, error.status || 400, { ok: false, error: message || 'The directions page could not save.' });
  }
}

export default function handler(req, res) {
  return handleDirections(req, res);
}
