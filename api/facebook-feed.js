const PAGE = 'seasidedanceacademy';
const CACHE_MS = 30 * 60 * 1000;

const pageHeaders = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
  'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
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

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function postedDate(seconds) {
  const time = Number(seconds);
  if (!Number.isFinite(time) || time < 1_000_000_000) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  }).format(new Date(time * 1000));
}

function videoLength(milliseconds) {
  const total = Math.round(Number(milliseconds) / 1000);
  if (!Number.isFinite(total) || total < 1) return '';
  if (total < 60) return `${total} sec`;
  const minutes = Math.round(total / 60);
  return `${minutes} min`;
}

function viewLabel(value) {
  if (value == null || value === '') return '';
  const text = typeof value === 'number' ? value.toLocaleString('en-US') : String(value).trim();
  if (!text || /view/i.test(text)) return text;
  return `${text} views`;
}

function parseReels(html) {
  const marker = 'aggregated_fb_shorts":';
  let from = 0;
  while (from < html.length) {
    const found = html.indexOf(marker, from);
    if (found === -1) return [];
    const start = html.indexOf('{', found);
    if (start === -1) return [];
    try {
      const data = JSON.parse(sliceJsonObject(html, start));
      const edges = Array.isArray(data.edges) ? data.edges : [];
      const posts = edges
        .map((edge) => edge.profile_reel_node?.node || edge.node)
        .map((node) => {
          if (!node) return null;
          const video = node.short_form_video_context?.video;
          const id = String(video?.id || '');
          const image = node.short_form_video_context?.playback_video?.thumbnailImage?.uri || video?.first_frame_thumbnail || '';
          if (!/^\d{8,25}$/.test(id) || !image) return null;
          const context = node.short_form_video_context || {};
          return {
            id,
            href: `https://www.facebook.com/reel/${id}/`,
            text: cleanText(node.message?.text),
            date: postedDate(node.creation_time),
            length: videoLength(video?.playable_duration_in_ms),
            views: viewLabel(context.play_count_reduced),
            displayUri: image,
          };
        })
        .filter(Boolean);
      if (posts.length) return posts;
    } catch {
      // The reels page repeats this label outside the post list.
    }
    from = found + marker.length;
  }
  return [];
}

async function fetchFeed() {
  const response = await fetch(`https://www.facebook.com/${PAGE}/reels/`, {
    headers: pageHeaders,
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) return [];
  return parseReels(await response.text());
}

export async function loadFeed() {
  if (feedCache.posts.length && Date.now() - feedCache.at < CACHE_MS) return feedCache.posts;
  try {
    const posts = await fetchFeed();
    if (posts.length) feedCache = { at: Date.now(), posts };
  } catch {
    // Keep the last good copy when Facebook does not answer.
  }
  return feedCache.posts;
}

export async function feedForClient() {
  const posts = await loadFeed();
  return posts.map((post) => ({
    id: post.id,
    href: post.href,
    text: post.text,
    date: post.date,
    length: post.length,
    views: post.views,
    image: `/api/facebook-image?id=${encodeURIComponent(post.id)}`,
  }));
}

function allowedImageHost(value) {
  try {
    const host = new URL(value).hostname;
    return host === 'fbcdn.net' || host.endsWith('.fbcdn.net');
  } catch {
    return false;
  }
}

export async function imageForId(id) {
  if (!/^\d{8,25}$/.test(id)) return null;
  const cached = imageCache.get(id);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached;
  const post = (await loadFeed()).find((item) => item.id === id);
  if (!post || !allowedImageHost(post.displayUri)) return null;
  const response = await fetch(post.displayUri, {
    headers: { referer: 'https://www.facebook.com/' },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) return null;
  const body = Buffer.from(await response.arrayBuffer());
  if (!body.length || body.length > 8_000_000) return null;
  const contentType = (response.headers.get('content-type') || 'image/jpeg').split(';')[0];
  if (!contentType.startsWith('image/')) return null;
  const image = { at: Date.now(), body, contentType };
  imageCache.set(id, image);
  return image;
}
