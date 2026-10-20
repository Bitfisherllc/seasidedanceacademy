const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TEST_SECRET = '1x0000000000000000000000000000000AA';
const ALLOWED_HOSTS = new Set([
  'www.seasidedanceacademy.net',
  'seasidedanceacademy.net',
  '127.0.0.1',
  'localhost',
]);
const ACTIONS = new Set(['contact', 'registration']);
const WINDOW_MS = 60_000;
const MAX_HITS = 8;
const hits = new Map();

function secretKey() {
  const configured = process.env.TURNSTILE_SECRET_KEY || '';
  if (process.env.NODE_ENV === 'production') {
    return configured === TEST_SECRET ? '' : configured;
  }
  return configured || TEST_SECRET;
}

function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function verifyTurnstile({ token, action, remoteip }) {
  const secret = secretKey();
  if (!secret) {
    return { ok: false, status: 503, error: 'Spam protection is not configured.' };
  }
  if (!ACTIONS.has(action)) {
    return { ok: false, status: 400, error: 'This form could not be checked.' };
  }
  if (typeof token !== 'string' || !token.trim() || token.length > 2048) {
    return { ok: false, status: 400, error: 'Complete the spam check before sending.' };
  }
  if (limited(remoteip || 'unknown')) {
    return { ok: false, status: 429, error: 'Too many attempts. Wait a minute and try again.' };
  }

  let result;
  try {
    const response = await fetch(SITEVERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: remoteip || undefined }),
    });
    result = await response.json();
  } catch {
    return { ok: false, status: 502, error: 'The spam check could not be completed. Try again.' };
  }

  if (!result?.success) {
    return { ok: false, status: 403, error: 'The spam check did not pass. Try again.' };
  }
  if (result.action && result.action !== action) {
    return { ok: false, status: 403, error: 'The spam check did not pass. Try again.' };
  }
  const testing = secret === TEST_SECRET;
  if (!testing && result.hostname && !ALLOWED_HOSTS.has(result.hostname)) {
    return { ok: false, status: 403, error: 'The spam check did not pass. Try again.' };
  }
  return { ok: true, status: 200 };
}
