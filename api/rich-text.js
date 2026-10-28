const INLINE = new Set(['strong', 'em', 'u', 'a']);

function decode(text) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function escapeText(text) {
  return decode(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(value) {
  return escapeText(value).replace(/"/g, '&quot;');
}

function attrValue(attrs, name) {
  const match = String(attrs || '').match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i'));
  if (!match) return '';
  return match[2] ?? match[3] ?? match[4] ?? '';
}

function safeHref(raw) {
  const value = decode(String(raw || '')).trim();
  if (!value || /[\s<>]/.test(value)) return '';
  if (value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')) return value;
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:' || url.protocol === 'tel:') return url.href;
  } catch {
    return '';
  }
  return '';
}

export function sanitizeRich(value) {
  let source = String(value ?? '').replace(/\0/g, '');
  source = source.replace(/<!--[\s\S]*?-->/g, '');
  source = source.replace(/<(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  const parts = source.split(/(<[^>]+>)/g);
  const stack = [];
  let out = '';

  function emitClose(item) {
    const marks = item.marks ? item.marks.slice().reverse() : [item.tag];
    marks.forEach((tag) => {
      out += `</${tag}>`;
    });
  }

  function closeTop() {
    const item = stack.pop();
    if (item) emitClose(item);
  }

  function closeInline() {
    while (stack.length && INLINE.has(stack[stack.length - 1].tag)) closeTop();
  }

  function inList() {
    return stack.some((item) => item.tag === 'ul' || item.tag === 'ol');
  }

  function closeUntil(tag) {
    const index = stack.map((item) => item.tag).lastIndexOf(tag);
    if (index < 0) return;
    while (stack.length > index) closeTop();
  }

  function open(tag, html) {
    stack.push({ tag });
    out += html || `<${tag}>`;
  }

  for (const part of parts) {
    if (!part) continue;
    if (!part.startsWith('<')) {
      out += escapeText(part);
      continue;
    }
    if (/^<\s*br\b/i.test(part)) {
      out += '<br>';
      continue;
    }
    const opened = part.match(/^<\s*([a-z0-9]+)\b([^>]*)>$/i);
    const closed = part.match(/^<\s*\/\s*([a-z0-9]+)\s*>$/i);
    if (opened) {
      const name = opened[1].toLowerCase();
      const attrs = opened[2] || '';
      if (name === 'span') {
        const marks = [];
        if (/font-weight\s*:\s*(bold|[6-9]00)/i.test(attrs)) marks.push('strong');
        if (/font-style\s*:\s*italic/i.test(attrs)) marks.push('em');
        if (/text-decoration[^;"]*underline/i.test(attrs)) marks.push('u');
        if (marks.length) {
          stack.push({ tag: 'span', marks });
          marks.forEach((tag) => {
            out += `<${tag}>`;
          });
        }
      } else if (name === 'strong' || name === 'b') open('strong');
      else if (name === 'em' || name === 'i') open('em');
      else if (name === 'u') open('u');
      else if (name === 'a') {
        const href = safeHref(attrValue(attrs, 'href'));
        if (href) open('a', `<a href="${escapeAttr(href)}">`);
      } else if (name === 'ul' || name === 'ol') {
        closeInline();
        open(name);
      } else if (name === 'li') {
        closeInline();
        if (!inList()) open('ul');
        if (stack.length && stack[stack.length - 1].tag === 'li') closeTop();
        open('li');
      }
      continue;
    }
    if (closed) {
      const name = closed[1].toLowerCase();
      if (name === 'b') closeUntil('strong');
      else if (name === 'i') closeUntil('em');
      else if (name === 'span' || INLINE.has(name) || name === 'ul' || name === 'ol' || name === 'li') closeUntil(name);
      else if (name === 'div' || name === 'p' || /^h[1-6]$/.test(name) || name === 'blockquote') {
        closeInline();
        if (!out.endsWith('<br>')) out += '<br>';
      }
    }
  }
  while (stack.length) closeTop();
  out = out.replace(/[ \t\f\v]+/g, ' ');
  out = out.replace(/ *<br> */g, '<br>');
  out = out.replace(/(?:<br>){3,}/g, '<br><br>');
  out = out.replace(/^(?:<br>)+|(?:<br>)+$/g, '');
  let previous = '';
  while (previous !== out) {
    previous = out;
    out = out.replace(/<(strong|em|u|a)(\s[^>]*)?>\s*<\/\1>/g, '');
    out = out.replace(/<li>(?:<br>|\s)*<\/li>/g, '');
    out = out.replace(/<(ul|ol)>\s*<\/\1>/g, '');
  }
  return out.trim();
}

export function plainText(value) {
  return sanitizeRich(value)
    .replace(/<br>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export function richWords(value, label, max) {
  const html = sanitizeRich(value);
  const plain = plainText(html);
  if (!plain) throw new Error(`${label} is required.`);
  if ([...plain].length > max) throw new Error(`${label} is too long.`);
  return html;
}

export const richHtml = sanitizeRich;
