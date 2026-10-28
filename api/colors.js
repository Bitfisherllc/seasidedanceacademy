import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COLOR_FIELDS, DEFAULT_COLORS, activeColors } from '../src/data/color-scheme.js';
import { readBody, send } from './page-store.js';
import { readSession } from './studio-classes.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'src/data/colors.json');
const REL = 'src/data/colors.json';
const REPO = process.env.GITHUB_REPO || 'Bitfisherllc/seasidedanceacademy';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

function payload(colors, live) {
  return {
    ok: true,
    colors,
    defaults: DEFAULT_COLORS,
    fields: COLOR_FIELDS,
    live: Boolean(live),
  };
}

async function githubRequest(method, extra = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const error = new Error('Add GITHUB_TOKEN in the Vercel project settings so colors can save.');
    error.status = 503;
    throw error;
  }
  const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${REL}`, {
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
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 404) {
      const error = new Error('missing');
      error.status = 404;
      throw error;
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error('GitHub rejected the token. Check GITHUB_TOKEN in Vercel.');
    }
    if (response.status === 409) {
      const error = new Error('The colors changed while saving. Try again.');
      error.status = 409;
      throw error;
    }
    throw new Error(body.message || 'GitHub could not update the colors.');
  }
  return body;
}

async function loadColors() {
  if (process.env.VERCEL && process.env.GITHUB_TOKEN) {
    try {
      const current = await githubRequest('GET');
      const text = Buffer.from(String(current.content || '').replace(/\n/g, ''), 'base64').toString('utf8');
      return { colors: activeColors(JSON.parse(text)), sha: current.sha || '' };
    } catch (error) {
      if (error.status !== 404) throw error;
      return { colors: { ...DEFAULT_COLORS }, sha: '' };
    }
  }
  try {
    return { colors: activeColors(JSON.parse(await readFile(FILE, 'utf8'))), sha: '' };
  } catch {
    return { colors: { ...DEFAULT_COLORS }, sha: '' };
  }
}

async function storeColors(colors, sha) {
  const body = `${JSON.stringify(colors, null, 2)}\n`;
  if (process.env.VERCEL) {
    await githubRequest('PUT', {
      message: 'Update the site colors',
      content: Buffer.from(body, 'utf8').toString('base64'),
      ...(sha ? { sha } : {}),
      branch: BRANCH,
    });
    return true;
  }
  await writeFile(FILE, body);
  return false;
}

function colorsFromBody(body, fallback) {
  if (body.restore) return { ...DEFAULT_COLORS };
  const incoming = body.colors && typeof body.colors === 'object' ? body.colors : null;
  if (!incoming) throw new Error('Choose a color for each part of the site.');
  const next = { ...fallback };
  for (const key of Object.keys(DEFAULT_COLORS)) {
    const value = String(incoming[key] ?? '').trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
      const field = COLOR_FIELDS.find((item) => item.key === key);
      throw new Error(`${field?.label || 'A color'} needs a color like #568f89.`);
    }
    next[key] = value.toLowerCase();
  }
  return next;
}

export async function handleColors(req, res) {
  const method = req.method || 'GET';
  try {
    if (!readSession(req)) {
      send(res, 401, { ok: false, error: 'Sign in again.' });
      return;
    }
    if (method === 'GET') {
      const loaded = await loadColors();
      send(res, 200, payload(loaded.colors, process.env.VERCEL));
      return;
    }
    if (method !== 'POST') {
      send(res, 405, { ok: false, error: 'Method not allowed' });
      return;
    }
    const body = await readBody(req);
    const loaded = await loadColors();
    const colors = colorsFromBody(body, loaded.colors);
    let live = false;
    try {
      live = await storeColors(colors, loaded.sha);
    } catch (error) {
      if (error.status !== 409) throw error;
      const again = await loadColors();
      live = await storeColors(colors, again.sha);
    }
    send(res, 200, payload(colors, live));
  } catch (error) {
    const message = error instanceof SyntaxError ? 'The colors could not be read.' : error.message;
    send(res, error.status || 400, { ok: false, error: message || 'The colors could not save.' });
  }
}

export default function handler(req, res) {
  return handleColors(req, res);
}
