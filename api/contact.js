import nodemailer from 'nodemailer';

const FALLBACK =
  'The form is not sending yet. Call (410) 629-0377 or email seasidedanceacademy@gmail.com.';

function clean(value, max) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function smtpSettings() {
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  if (!user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  return {
    host: process.env.SMTP_HOST || '',
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  };
}

function lines(pairs) {
  return pairs
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (clean(body.company, 200)) return res.status(200).json({ ok: true, message: 'Sent.' });

  const email = clean(body.email, 120);
  if (!email || !email.includes('@')) {
    return res.status(400).json({ ok: false, message: 'Enter an email address.' });
  }

  const kind = body.kind === 'registration' ? 'registration' : 'contact';
  const text = kind === 'registration'
    ? lines([
        ['Billing name', `${clean(body.billingFirst, 80)} ${clean(body.billingLast, 80)}`.trim()],
        ['Email', email],
        ['Address', [clean(body.address1, 120), clean(body.address2, 120), clean(body.city, 80), clean(body.state, 40), clean(body.zip, 20), clean(body.country, 40)].filter(Boolean).join(', ')],
        ['Home phone', clean(body.homePhone, 40)],
        ['Cell phone', clean(body.cellPhone, 40)],
        ['Student', `${clean(body.studentFirst, 80)} ${clean(body.studentLast, 80)}`.trim()],
        ['Age', clean(body.studentAge, 20)],
        ['Birth date', clean(body.birthDate, 40)],
        ['Class', clean(body.classChoice, 120)],
        ['Class day', clean(body.classDay, 120)],
      ])
    : lines([
        ['Name', `${clean(body.firstName, 80)} ${clean(body.lastName, 80)}`.trim()],
        ['Email', email],
        ['Comment', clean(body.comment, 5000)],
      ]);

  if (kind === 'contact' && !clean(body.comment, 5000)) {
    return res.status(400).json({ ok: false, message: 'Enter a comment.' });
  }
  if (kind === 'registration' && !clean(body.classChoice, 120)) {
    return res.status(400).json({ ok: false, message: 'Choose a class.' });
  }

  const settings = smtpSettings();
  if (!settings?.host) {
    return res.status(503).json({ ok: false, message: FALLBACK });
  }

  const to = process.env.CONTACT_TO_EMAIL || 'seasidedanceacademy@gmail.com';
  try {
    const transport = nodemailer.createTransport(settings);
    await transport.sendMail({
      from: settings.auth.user,
      to,
      replyTo: email,
      subject: kind === 'registration' ? 'Class registration' : 'Studio message',
      text,
    });
  } catch {
    return res.status(502).json({ ok: false, message: FALLBACK });
  }

  return res.status(200).json({
    ok: true,
    message: kind === 'registration'
      ? 'Registration sent. The studio will be in touch.'
      : 'Message sent. The studio will be in touch.',
  });
}
