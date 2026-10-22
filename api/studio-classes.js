import crypto from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import seed from '../src/data/classes.json' with { type: 'json' };
import { clockValue } from '../src/data/class-time.js';

const GROUPS = [
  { id: 'grow', label: 'Dance & Grow and Pre' },
  { id: 'ballet', label: 'Ballet, jazz, and tap' },
  { id: 'hip-hop', label: 'Hip hop' },
  { id: 'more', label: 'Other classes' },
];
const GROUP_IDS = new Set(GROUPS.map((group) => group.id));
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_IDS = new Set(DAYS);
const BILLING = new Set(['month', 'hour', 'half-hour']);
const COOKIE = 'studio_session';
const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/data/classes.json');
const REPO = process.env.GITHUB_REPO || 'Bitfisherllc/seasidedanceacademy';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const attempts = new Map();

function header(req, name) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()] ?? '';
  return Array.isArray(value) ? value[0] : String(value || '');
}

function clientIp(req) {
  const forwarded = header(req, 'x-forwarded-for').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || 'local';
}

function send(res, status, body, extra = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [key, value] of Object.entries(extra)) res.setHeader(key, value);
  res.end(JSON.stringify(body));
}

function password() {
  return process.env.STUDIO_PASSWORD || '';
}

function sameSecret(input, expected) {
  const left = crypto.createHash('sha256').update(String(input)).digest();
  const right = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(left, right);
}

function sign(exp) {
  return crypto.createHmac('sha256', password()).update(String(exp)).digest('base64url');
}

function sessionCookie(token, maxAge) {
  const secure = process.env.VERCEL ? '; Secure' : '';
  return `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

export function readSession(req) {
  const secret = password();
  if (!secret) return false;
  const pairs = header(req, 'cookie').split(';');
  const raw = pairs.map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`));
  if (!raw) return false;
  const token = decodeURIComponent(raw.slice(COOKIE.length + 1));
  const [exp, sig] = token.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = crypto.createHmac('sha256', secret).update(exp).digest('base64url');
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function lockedOut(ip) {
  const row = attempts.get(ip);
  if (!row) return false;
  if (Date.now() > row.reset) {
    attempts.delete(ip);
    return false;
  }
  return row.count >= 8;
}

function noteFailure(ip) {
  const row = attempts.get(ip) || { count: 0, reset: Date.now() + 10 * 60 * 1000 };
  if (Date.now() > row.reset) {
    row.count = 0;
    row.reset = Date.now() + 10 * 60 * 1000;
  }
  row.count += 1;
  attempts.set(ip, row);
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body) return JSON.parse(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

function localCatalog() {
  return readFile(FILE, 'utf8').then((text) => JSON.parse(text));
}

async function githubRequest(method, extra = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const error = new Error('Add GITHUB_TOKEN in the Vercel project settings so the class desk can save.');
    error.status = 503;
    throw error;
  }
  const response = await fetch(`https://api.github.com/repos/${REPO}/contents/src/data/classes.json`, {
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
    if (response.status === 401 || response.status === 403) {
      throw new Error('GitHub rejected the token. Check GITHUB_TOKEN in Vercel.');
    }
    if (response.status === 409) {
      const error = new Error('The class list changed while saving. Try again.');
      error.status = 409;
      throw error;
    }
    throw new Error(payload.message || 'GitHub could not update the class list.');
  }
  return payload;
}

async function loadCatalog() {
  if (process.env.VERCEL && process.env.GITHUB_TOKEN) {
    const payload = await githubRequest('GET');
    const text = Buffer.from(String(payload.content || '').replace(/\n/g, ''), 'base64').toString('utf8');
    return { catalog: JSON.parse(text), sha: payload.sha };
  }
  if (!process.env.VERCEL) return { catalog: await localCatalog(), sha: '' };
  return { catalog: seed, sha: '' };
}

function text(value, max, label, required) {
  const clean = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (required && !clean) throw new Error(`${label} is required.`);
  if (clean.length > max) throw new Error(`${label} is too long.`);
  return clean;
}

function slug(name) {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return base || 'class';
}

function freshId(name, used) {
  let next = slug(name);
  let count = 2;
  while (used.has(next)) next = `${slug(name)}-${count++}`;
  used.add(next);
  return next;
}

function normalize(input, previous) {
  if (!Array.isArray(input)) throw new Error('The class list is missing.');
  if (input.length > 80) throw new Error('Too many classes.');
  const known = new Set((previous || []).map((item) => item.id));
  const used = new Set();
  const cleaned = input.map((item) => {
    const name = text(item?.name, 80, 'Class name', true);
    const requested = text(item?.id, 60, 'Class id', false);
    const keep = requested && known.has(requested) && !used.has(requested);
    const id = keep ? requested : freshId(name, used);
    if (keep) used.add(id);
    const group = GROUP_IDS.has(item?.group) ? item.group : 'more';
    const sessions = [];
    for (const session of (Array.isArray(item?.sessions) ? item.sessions : []).slice(0, 8)) {
      const day = DAY_IDS.has(session?.day) ? session.day : '';
      const start = clockValue(session?.start);
      const end = clockValue(session?.end);
      if (!day && !start && !end) continue;
      if (!day || !start || !end) throw new Error('Each day needs a start time and an end time.');
      if (end <= start) throw new Error('The end time has to be later than the start time.');
      sessions.push({ day, start, end });
    }
    sessions.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
    const availability = text(item?.availability, 80, 'Availability', false);
    if (!sessions.length && !availability) throw new Error('Add a day and time, or say when the class is offered.');
    const billing = BILLING.has(item?.billing) ? item.billing : 'month';
    const amount = text(item?.amount, 12, 'Price', true).replace(/^\$/, '');
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) throw new Error('Price should be a number, such as 49 or 30.');
    return {
      id,
      name,
      ages: text(item?.ages, 40, 'Ages', true),
      sessions,
      availability,
      amount,
      billing,
      summary: text(item?.summary, 600, 'Description', true),
      recital: text(item?.recital, 200, 'Recital note', false),
      group,
      hidden: Boolean(item?.hidden),
      featured: Boolean(item?.featured),
      order: 0,
    };
  });
  const classes = [];
  for (const group of GROUPS) {
    cleaned
      .filter((item) => item.group === group.id)
      .forEach((item, order) => classes.push({ ...item, order }));
  }
  return classes;
}

async function store(classes, sha) {
  const body = `${JSON.stringify({ classes }, null, 2)}\n`;
  if (process.env.VERCEL) {
    await githubRequest('PUT', {
      message: 'Update the class schedule',
      content: Buffer.from(body, 'utf8').toString('base64'),
      sha,
      branch: BRANCH,
    });
    return true;
  }
  await writeFile(FILE, body);
  return false;
}

export async function handleStudio(req, res) {
  const method = req.method || 'GET';
  try {
    if (method === 'GET') {
      if (!readSession(req)) {
        send(res, 401, {
          ok: false,
          localHint: !process.env.VERCEL && !process.env.STUDIO_PASSWORD,
        });
        return;
      }
      const { catalog } = await loadCatalog();
      send(res, 200, {
        ok: true,
        classes: catalog.classes || [],
        groups: GROUPS,
        live: Boolean(process.env.VERCEL),
      });
      return;
    }

    if (method !== 'POST' && method !== 'PUT') {
      send(res, 405, { ok: false, error: 'Method not allowed' }, { Allow: 'GET, POST, PUT' });
      return;
    }

    const body = await readBody(req);
    const action = method === 'PUT' ? 'save' : body.action;

    if (action === 'logout') {
      send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
      return;
    }

    if (action === 'login') {
      const ip = clientIp(req);
      const secret = password();
      if (!secret) {
        send(res, 503, {
          ok: false,
          error: process.env.VERCEL
            ? 'Add STUDIO_PASSWORD in the Vercel project settings.'
            : 'Add STUDIO_PASSWORD in the .env file.',
        });
        return;
      }
      if (lockedOut(ip)) {
        send(res, 429, { ok: false, error: 'Too many tries. Wait ten minutes and try again.' });
        return;
      }
      if (!sameSecret(body.password || '', secret)) {
        noteFailure(ip);
        send(res, 401, { ok: false, error: 'That password is not right.' });
        return;
      }
      attempts.delete(ip);
      const exp = Date.now() + 12 * 60 * 60 * 1000;
      send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(`${exp}.${sign(exp)}`, 12 * 60 * 60) });
      return;
    }

    if (action === 'save') {
      if (!readSession(req)) {
        send(res, 401, { ok: false, error: 'Sign in again.' });
        return;
      }
      const loaded = await loadCatalog();
      let classes = normalize(body.classes, loaded.catalog.classes);
      let live = false;
      try {
        live = await store(classes, loaded.sha);
      } catch (error) {
        if (error.status === 409) {
          const again = await loadCatalog();
          classes = normalize(body.classes, again.catalog.classes);
          live = await store(classes, again.sha);
        } else {
          throw error;
        }
      }
      send(res, 200, { ok: true, classes, live });
      return;
    }

    send(res, 400, { ok: false, error: 'Unknown request.' });
  } catch (error) {
    const message = error instanceof SyntaxError ? 'The class list could not be read.' : error.message;
    send(res, error.status || 400, { ok: false, error: message || 'The class desk could not save.' });
  }
}

export default function handler(req, res) {
  return handleStudio(req, res);
}
