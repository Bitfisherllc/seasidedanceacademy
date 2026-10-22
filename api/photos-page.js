import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import seed from '../src/data/photos-page.json' with { type: 'json' };
import { readSession } from './studio-classes.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'src/data/photos-page.json');
const PUBLIC = path.join(ROOT, 'public');
const REPO = process.env.GITHUB_REPO || 'Bitfisherllc/seasidedanceacademy';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

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

function optionalAlt(value) {
  const clean = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  return words(clean, 'Description', 180);
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
  const fresh = clean.startsWith('/images/hero/photos-banner.') || clean.startsWith('/images/albums/covers/');
  if (!existsSync(file) && !fresh) throw new Error(`${label} was not found.`);
  return clean;
}

function safeSlug(value) {
  const slug = String(value || '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80 || slug === 'instagram') {
    throw new Error('That gallery cannot be changed.');
  }
  return slug;
}

function slugify(title) {
  const slug = String(title || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  if (!slug || slug === 'instagram') throw new Error('Choose a different gallery name.');
  return slug;
}

function uniqueSlug(page, title) {
  const base = slugify(title);
  let slug = base;
  let count = 2;
  while (page.albums?.[slug]) {
    slug = `${base.slice(0, 56)}-${count}`;
    count += 1;
    if (count > 40) throw new Error('Choose a different gallery name.');
  }
  return slug;
}

function photoList(value) {
  if (!Array.isArray(value)) throw new Error('The photo list could not be read.');
  if (value.length > 200) throw new Error('A gallery can hold 200 photos.');
  return value.map((item) => photoSrc(item, 'a gallery photo'));
}

function photoFocus(value, label) {
  const match = String(value ?? '').trim().match(/^center (\d{1,2})%$/);
  const amount = match ? Number(match[1]) : NaN;
  if (!match || amount < 10 || amount > 90) throw new Error(`Slide ${label} so faces stay in view.`);
  return `center ${amount}%`;
}

function apply(current, body) {
  const next = JSON.parse(JSON.stringify(current));
  if (!next.banner) next.banner = { src: '/images/hero/duo-sequin.jpg', focus: 'center 18%' };
  if (!next.albums || typeof next.albums !== 'object') next.albums = {};
  if (body.title != null) next.title = words(body.title, 'Heading', 60);
  if (body.banner) {
    next.banner = {
      src: photoSrc(body.banner.src, 'the banner photo'),
      focus: photoFocus(body.banner.focus, 'the banner photo'),
    };
  }
  if (body.album) {
    const slug = safeSlug(body.album.slug);
    if (!next.albums[slug]) throw new Error('That album cannot be changed.');
    const previous = next.albums[slug];
    next.albums[slug] = {
      title: words(body.album.title, 'Title', 180),
      date: words(body.album.date, 'Date', 40),
      cover: photoSrc(body.album.cover, 'the cover photo'),
      focus: photoFocus(body.album.focus, 'the cover photo'),
    };
    if (Array.isArray(previous.images)) next.albums[slug].images = previous.images;
    if (previous.alts && typeof previous.alts === 'object') next.albums[slug].alts = previous.alts;
  }
  if (body.photos) {
    const slug = safeSlug(body.photos.slug);
    if (!next.albums[slug]) throw new Error('That gallery cannot be changed.');
    const images = photoList(body.photos.images);
    let added = '';
    if (body.photos.add) {
      added = photoSrc(body.photos.add, 'the gallery photo');
      if (!images.includes(added)) images.push(added);
    }
    if (images.length > 200) throw new Error('A gallery can hold 200 photos.');
    const previousAlts = next.albums[slug].alts && typeof next.albums[slug].alts === 'object' ? next.albums[slug].alts : {};
    const alts = {};
    images.forEach((src) => {
      if (typeof previousAlts[src] === 'string' && previousAlts[src].trim()) alts[src] = previousAlts[src].trim();
    });
    if (added) {
      const description = optionalAlt(body.photos.alt);
      if (description) alts[added] = description;
    }
    next.albums[slug].images = images;
    if (Object.keys(alts).length) next.albums[slug].alts = alts;
    else delete next.albums[slug].alts;
    if (images.length && !images.includes(next.albums[slug].cover)) next.albums[slug].cover = images[0];
  }
  if (body.gallery) {
    const slug = safeSlug(body.gallery.slug);
    if (next.albums[slug]) throw new Error('That gallery already exists.');
    const cover = photoSrc(body.gallery.cover, 'the gallery photo');
    next.albums[slug] = {
      title: words(body.gallery.title, 'Title', 180),
      date: words(body.gallery.date, 'Date', 40),
      cover,
      focus: 'center 50%',
      images: [cover],
    };
  }
  if (body.title == null && !body.banner && !body.album && !body.photos && !body.gallery) throw new Error('Nothing to save.');
  return next;
}

function sniff(bytes, type) {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8;
  if (type === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50;
  if (type === 'image/webp') return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  return false;
}

async function saveUpload(upload) {
  const kind = String(upload?.kind || '');
  const slug = kind === 'banner' ? '' : safeSlug(upload?.slug);
  if (kind !== 'banner' && kind !== 'cover' && kind !== 'gallery') throw new Error('That photo cannot be changed.');
  const type = String(upload?.type || '');
  const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : type === 'image/jpeg' ? 'jpg' : '';
  if (!ext) throw new Error('Use a JPG, PNG, or WebP photo.');
  const bytes = Buffer.from(String(upload?.data || '').replace(/\s/g, ''), 'base64');
  if (!bytes.length || bytes.length > 5 * 1024 * 1024 || !sniff(bytes, type)) {
    throw new Error('Use a JPG, PNG, or WebP photo under 5 MB.');
  }
  const filename = kind === 'banner'
    ? `photos-banner.${ext}`
    : kind === 'cover'
      ? `${slug}.${ext}`
      : `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const folderName = kind === 'banner' ? 'hero' : kind === 'cover' ? path.join('albums', 'covers') : path.join('albums', slug);
  const rel = `public/images/${kind === 'banner' ? 'hero' : kind === 'cover' ? 'albums/covers' : `albums/${slug}`}/${filename}`;
  if (process.env.VERCEL) {
    let sha = '';
    try {
      const current = await githubRequest(rel, 'GET');
      sha = current.sha || '';
    } catch (error) {
      if (error.status !== 404) throw error;
    }
    await githubRequest(rel, 'PUT', {
      message: 'Update a photos page image',
      content: bytes.toString('base64'),
      ...(sha ? { sha } : {}),
      branch: BRANCH,
    });
  } else {
    const folder = path.join(PUBLIC, 'images', folderName);
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, filename), bytes);
  }
  if (kind === 'banner') return `/images/hero/${filename}`;
  if (kind === 'cover') return `/images/albums/covers/${filename}`;
  return `/images/albums/${slug}/${filename}`;
}

async function githubRequest(filePath, method, extra = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const error = new Error('Add GITHUB_TOKEN in the Vercel project settings so the photos page can save.');
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
      const error = new Error('The photos page changed while saving. Try again.');
      error.status = 409;
      throw error;
    }
    throw new Error(payload.message || 'GitHub could not update the photos page.');
  }
  return payload;
}

async function loadPage() {
  if (process.env.VERCEL && process.env.GITHUB_TOKEN) {
    const payload = await githubRequest('src/data/photos-page.json', 'GET');
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
    await githubRequest('src/data/photos-page.json', 'PUT', {
      message: 'Update the photos page',
      content: Buffer.from(body, 'utf8').toString('base64'),
      sha,
      branch: BRANCH,
    });
    return true;
  }
  await writeFile(FILE, body);
  return false;
}

export async function handlePhotos(req, res) {
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
    const loaded = await loadPage();
    if (body.gallery) {
      body.gallery.slug = uniqueSlug(loaded.page, body.gallery.title);
      if (body.image) {
        body.image.kind = 'gallery';
        body.image.slug = body.gallery.slug;
      }
    }
    if (body.image) {
      const src = await saveUpload(body.image);
      if (body.image.kind === 'banner') {
        body.banner = body.banner && typeof body.banner === 'object' ? body.banner : {};
        body.banner.src = src;
      } else if (body.image.kind === 'gallery') {
        if (body.photos) body.photos.add = src;
        else if (body.gallery) body.gallery.cover = src;
      } else {
        body.album = body.album && typeof body.album === 'object' ? body.album : {};
        body.album.cover = src;
        body.album.slug = body.image.slug;
      }
    }
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
    send(res, 200, { ok: true, page, live, slug: body.gallery?.slug || body.photos?.slug || '' });
  } catch (error) {
    const message = error instanceof SyntaxError ? 'The photos page could not be read.' : error.message;
    send(res, error.status || 400, { ok: false, error: message || 'The photos page could not save.' });
  }
}

export default function handler(req, res) {
  return handlePhotos(req, res);
}
