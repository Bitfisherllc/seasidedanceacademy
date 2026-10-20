import { verifyTurnstile } from './turnstile-verify.js';

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || '';
  return String(raw).split(',')[0].trim();
}

function bodyOf(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  const body = bodyOf(req);
  const result = await verifyTurnstile({
    token: body.token,
    action: body.action,
    remoteip: clientIp(req),
  });
  res.setHeader('Cache-Control', 'no-store');
  res.status(result.status).json({ ok: result.ok, error: result.error || '' });
}
