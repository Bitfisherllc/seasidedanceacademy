const USERNAME = 'seasidedanceacademy_';
const CACHE_MS = 30 * 60 * 1000;

const profileHeaders = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'upgrade-insecure-requests': '1',
};

let feedCache = { at: 0, posts: [] };
const imageCache = new Map();

function sliceJsonObject(text, start) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  return '';
}

function postDate(node) {
  const text = `${node.accessibility_caption || ''} ${node.caption?.text || ''}`;
  const match = text.match(/on ([A-Z][a-z]+ \d{1,2}, \d{4})/);
  return match ? match[1] : '';
}

function parseTimeline(html) {
  const marker = 'polaris_ordered_timeline_connection":';
  let from = 0;
  while (from < html.length) {
    const found = html.indexOf(marker, from);
    if (found === -1) return [];
    const start = html.indexOf('{', found);
    if (start === -1) return [];
    try {
      const data = JSON.parse(sliceJsonObject(html, start));
      const edges = Array.isArray(data.edges) ? data.edges : [];
      if (edges.length) {
        return edges
          .map((edge) => edge.node)
          .filter((node) => node && node.code && node.display_uri)
          .filter((node) => !node.user || node.user.username === USERNAME)
          .map((node) => ({
            code: node.code,
            displayUri: node.display_uri,
            video: node.media_type === 2 || node.product_type === 'clips',
            date: postDate(node),
          }));
      }
    } catch {
      // Keep looking. The page includes the same label in more than one script.
    }
    from = found + marker.length;
  }
  return [];
}

async function fetchFeed() {
  const response = await fetch(`https://www.instagram.com/${USERNAME}/`, {
    headers: profileHeaders,
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) return [];
  return parseTimeline(await response.text());
}

export async function loadFeed() {
  if (feedCache.posts.length && Date.now() - feedCache.at < CACHE_MS) return feedCache.posts;
  try {
    const posts = await fetchFeed();
    if (posts.length) feedCache = { at: Date.now(), posts };
  } catch {
    // Keep the last good copy when Instagram does not answer.
  }
  return feedCache.posts;
}

export async function feedForClient() {
  const posts = await loadFeed();
  return posts.map((post) => ({
    code: post.code,
    video: post.video,
    date: post.date,
    image: `/api/instagram-image?code=${encodeURIComponent(post.code)}`,
  }));
}

function allowedImageHost(value) {
  try {
    const host = new URL(value).hostname;
    return host === 'cdninstagram.com' || host.endsWith('.cdninstagram.com') || host.endsWith('.fbcdn.net');
  } catch {
    return false;
  }
}

export async function imageForCode(code) {
  if (!/^[A-Za-z0-9_-]{5,30}$/.test(code)) return null;
  const cached = imageCache.get(code);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached;
  const post = (await loadFeed()).find((item) => item.code === code);
  if (!post || !allowedImageHost(post.displayUri)) return null;
  const response = await fetch(post.displayUri, { signal: AbortSignal.timeout(12000) });
  if (!response.ok) return null;
  const body = Buffer.from(await response.arrayBuffer());
  if (!body.length || body.length > 8_000_000) return null;
  const contentType = (response.headers.get('content-type') || 'image/jpeg').split(';')[0];
  if (!contentType.startsWith('image/')) return null;
  const image = { at: Date.now(), body, contentType };
  imageCache.set(code, image);
  return image;
}
