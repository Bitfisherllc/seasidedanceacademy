import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import seed from '../src/data/home.json' with { type: 'json' };
import { readSession } from './studio-classes.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'src/data/home.json');
const PUBLIC = path.join(ROOT, 'public');
const REPO = process.env.GITHUB_REPO || 'Bitfisherllc/seasidedanceacademy';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const DEFAULT_BANDS = [
  { src: '/images/albums/march-14th-2018/022.jpg', focus: 'center 26%' },
  { src: '/images/gallery/01.jpg', focus: 'center 50%' },
];
const DEFAULT_SLIDES = [1, 2, 3, 4, 5, 6].map((number) => ({
  src: `/images/gallery/0${number}.jpg`,
  focus: 'center 50%',
}));

const FIELDS = {
  'hero.line': ['Banner line', 140],
  'hero.choices.0.title': ['First box', 24],
  'hero.choices.0.note': ['First box note', 80],
  'hero.choices.1.title': ['Second box', 24],
  'hero.choices.1.note': ['Second box note', 80],
  'hero.choices.2.title': ['Third box', 24],
  'hero.choices.2.note': ['Third box note', 80],
  'welcome.place': ['Small heading', 40],
  'welcome.name': ['Large heading', 48],
  'welcome.quote': ['Paragraph', 320],
  'welcome.call': ['Call label', 40],
  'studio.title': ['Heading', 40],
  'studio.subtitle': ['Subheading', 60],
  'studio.paragraphs.0': ['Paragraph 1', 800],
  'studio.paragraphs.1': ['Paragraph 2', 800],
  'studio.paragraphs.2': ['Paragraph 3', 800],
  'studio.paragraphs.3': ['Paragraph 4', 800],
  'studio.facts.0': ['Point 1', 40],
  'studio.facts.1': ['Point 2', 40],
  'studio.facts.2': ['Point 3', 40],
  'studio.facts.3': ['Point 4', 40],
  'classes.title': ['Heading', 40],
  'classes.subtitle': ['Subheading', 60],
  'classes.lines.0': ['First line', 140],
  'classes.lines.1': ['Second line', 140],
  'classes.button': ['Button', 32],
  'director.title': ['Heading', 40],
  'director.name': ['Name', 48],
  'director.paragraphs.0': ['Paragraph 1', 1200],
  'director.paragraphs.1': ['Paragraph 2', 1200],
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

function at(doc, keyPath) {
  return keyPath.split('.').reduce((node, part) => node?.[part], doc);
}

function put(doc, keyPath, value) {
  const parts = keyPath.split('.');
  let node = doc;
  for (const part of parts.slice(0, -1)) node = node[part];
  node[parts[parts.length - 1]] = value;
}

function words(value, label, max) {
  const clean = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) throw new Error(`${label} is required.`);
  if (clean.length > max) throw new Error(`${label} is too long.`);
  if (/[<>]/.test(clean)) throw new Error(`${label} cannot include < or >.`);
  return clean;
}

function optionalWords(value, label, max) {
  const clean = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
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
  if (!existsSync(file) && !clean.startsWith('/images/bands/band-') && !clean.startsWith('/images/studio/director.') && !clean.startsWith('/images/hero/home-banner.') && !/^\/images\/slides\/slide-[1-8]\./.test(clean)) {
    throw new Error(`${label} was not found.`);
  }
  return clean;
}

function photoFocus(value, label) {
  const match = String(value ?? '').trim().match(/^center (\d{1,2})%$/);
  const amount = match ? Number(match[1]) : NaN;
  if (!match || amount < 10 || amount > 90) throw new Error(`Slide ${label} so the photo stays in the strip.`);
  return `center ${amount}%`;
}

function apply(current, values) {
  const next = JSON.parse(JSON.stringify(current));
  if (!Array.isArray(next.bands) || next.bands.length < 2) next.bands = DEFAULT_BANDS.map((band) => ({ ...band }));
  const incoming = values && typeof values === 'object' ? values : {};
  for (const key of Object.keys(incoming)) {
    if (key === 'slides') continue;
    if (!FIELDS[key] && !/^bands\.[01]\.(src|focus|alt)$/.test(key) && key !== 'director.photo' && key !== 'hero.image' && key !== 'hero.focus') {
      throw new Error('That part of the page cannot be changed.');
    }
  }
  for (const [key, [label, max]] of Object.entries(FIELDS)) {
    const value = Object.prototype.hasOwnProperty.call(incoming, key) ? incoming[key] : at(next, key);
    put(next, key, words(value, label, max));
  }
  for (const index of [0, 1]) {
    const srcKey = `bands.${index}.src`;
    const focusKey = `bands.${index}.focus`;
    const altKey = `bands.${index}.alt`;
    const label = index === 0 ? 'the top photo' : 'the bottom photo';
    const previous = next.bands[index];
    const src = Object.prototype.hasOwnProperty.call(incoming, srcKey) ? incoming[srcKey] : previous.src;
    const focus = Object.prototype.hasOwnProperty.call(incoming, focusKey) ? incoming[focusKey] : previous.focus;
    const alt = Object.prototype.hasOwnProperty.call(incoming, altKey)
      ? optionalWords(incoming[altKey], 'Photo description', 180)
      : src === previous.src
        ? previous.alt || ''
        : '';
    next.bands[index] = { src: photoSrc(src, label), focus: photoFocus(focus, label), ...(alt ? { alt } : {}) };
  }
  const directorPhoto = Object.prototype.hasOwnProperty.call(incoming, 'director.photo')
    ? incoming['director.photo']
    : next.director?.photo || '/images/studio/lisa-tingle.jpg';
  next.director.photo = photoSrc(directorPhoto, 'the director photo');
  const heroImage = Object.prototype.hasOwnProperty.call(incoming, 'hero.image')
    ? incoming['hero.image']
    : next.hero?.image || '/images/hero/duo-blue.jpg';
  const heroFocus = Object.prototype.hasOwnProperty.call(incoming, 'hero.focus')
    ? incoming['hero.focus']
    : next.hero?.focus || 'center 50%';
  next.hero.image = photoSrc(heroImage, 'the banner photo');
  next.hero.focus = photoFocus(heroFocus, 'the banner photo');
  next.slides = Object.prototype.hasOwnProperty.call(incoming, 'slides')
    ? readSlides(incoming.slides)
    : readSlides(Array.isArray(next.slides) && next.slides.length ? next.slides : DEFAULT_SLIDES);
  return next;
}

function readSlides(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 8) {
    throw new Error('Use between 1 and 8 photos.');
  }
  return value.map((slide, index) => {
    const label = `photo ${index + 1}`;
    const alt = optionalWords(slide?.alt, 'Photo description', 180);
    return {
      src: photoSrc(slide?.src, label),
      focus: photoFocus(slide?.focus, label),
      ...(alt ? { alt } : {}),
    };
  });
}

function sniff(bytes, type) {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8;
  if (type === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50;
  if (type === 'image/webp') return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  return false;
}

async function saveUpload(upload) {
  const index = Number(upload?.index);
  if (index !== 0 && index !== 1 && index !== 2 && index !== 3) throw new Error('That photo cannot be changed.');
  const type = String(upload?.type || '');
  const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : type === 'image/jpeg' ? 'jpg' : '';
  if (!ext) throw new Error('Use a JPG, PNG, or WebP photo.');
  const bytes = Buffer.from(String(upload?.data || '').replace(/\s/g, ''), 'base64');
  if (!bytes.length || bytes.length > 5 * 1024 * 1024 || !sniff(bytes, type)) {
    throw new Error('Use a JPG, PNG, or WebP photo under 5 MB.');
  }
  const uploads = [
    ['bands', 'band-1'],
    ['bands', 'band-2'],
    ['studio', 'director'],
    ['hero', 'home-banner'],
  ];
  const [folderName, base] = uploads[index];
  const filename = `${base}.${ext}`;
  const rel = `public/images/${folderName}/${filename}`;
  if (process.env.VERCEL) {
    let sha = '';
    try {
      const current = await githubRequest(rel, 'GET');
      sha = current.sha || '';
    } catch (error) {
      if (error.status !== 404) throw error;
    }
    await githubRequest(rel, 'PUT', {
      message: 'Update a home page photo',
      content: bytes.toString('base64'),
      ...(sha ? { sha } : {}),
      branch: BRANCH,
    });
  } else {
    const folder = path.join(PUBLIC, 'images', folderName);
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, filename), bytes);
  }
  return `/images/${folderName}/${filename}`;
}

async function saveSlide(upload) {
  const index = Number(upload?.index);
  if (!Number.isInteger(index) || index < 0 || index > 7) throw new Error('That photo cannot be changed.');
  const type = String(upload?.type || '');
  const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : type === 'image/jpeg' ? 'jpg' : '';
  if (!ext) throw new Error('Use a JPG, PNG, or WebP photo.');
  const bytes = Buffer.from(String(upload?.data || '').replace(/\s/g, ''), 'base64');
  if (!bytes.length || bytes.length > 5 * 1024 * 1024 || !sniff(bytes, type)) {
    throw new Error('Use a JPG, PNG, or WebP photo under 5 MB.');
  }
  const filename = `slide-${index + 1}.${ext}`;
  const rel = `public/images/slides/${filename}`;
  if (process.env.VERCEL) {
    let sha = '';
    try {
      const current = await githubRequest(rel, 'GET');
      sha = current.sha || '';
    } catch (error) {
      if (error.status !== 404) throw error;
    }
    await githubRequest(rel, 'PUT', {
      message: 'Update a home page photo',
      content: bytes.toString('base64'),
      ...(sha ? { sha } : {}),
      branch: BRANCH,
    });
  } else {
    const folder = path.join(PUBLIC, 'images/slides');
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, filename), bytes);
  }
  return `/images/slides/${filename}`;
}

async function githubRequest(filePath, method, extra = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const error = new Error('Add GITHUB_TOKEN in the Vercel project settings so the home page can save.');
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
      const error = new Error('The home page changed while saving. Try again.');
      error.status = 409;
      throw error;
    }
    throw new Error(payload.message || 'GitHub could not update the home page.');
  }
  return payload;
}

async function loadPage() {
  if (process.env.VERCEL && process.env.GITHUB_TOKEN) {
    const payload = await githubRequest('src/data/home.json', 'GET');
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
    await githubRequest('src/data/home.json', 'PUT', {
      message: 'Update the home page',
      content: Buffer.from(body, 'utf8').toString('base64'),
      sha,
      branch: BRANCH,
    });
    return true;
  }
  await writeFile(FILE, body);
  return false;
}

export async function handleHome(req, res) {
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
    if (Array.isArray(body.images) && body.images.length) {
      body.values = body.values && typeof body.values === 'object' ? body.values : {};
      if (!Array.isArray(body.values.slides)) throw new Error('The slideshow could not be saved.');
      for (const image of body.images) {
        const src = await saveSlide(image);
        const index = Number(image.index);
        if (!body.values.slides[index] || typeof body.values.slides[index] !== 'object') {
          throw new Error('That photo cannot be changed.');
        }
        body.values.slides[index].src = src;
      }
    }
    if (body.image) {
      body.values = body.values && typeof body.values === 'object' ? body.values : {};
      body.values[`bands.${Number(body.image.index)}.src`] = await saveUpload(body.image);
    }
    const loaded = await loadPage();
    let page = apply(loaded.page, body.values);
    let live = false;
    try {
      live = await store(page, loaded.sha);
    } catch (error) {
      if (error.status !== 409) throw error;
      const again = await loadPage();
      page = apply(again.page, body.values);
      live = await store(page, again.sha);
    }
    send(res, 200, { ok: true, home: page, live });
  } catch (error) {
    const message = error instanceof SyntaxError ? 'The home page could not be read.' : error.message;
    send(res, error.status || 400, { ok: false, error: message || 'The home page could not save.' });
  }
}

export default function handler(req, res) {
  return handleHome(req, res);
}
