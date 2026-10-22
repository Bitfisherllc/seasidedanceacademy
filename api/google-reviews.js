import seed from '../src/data/reviews.json' with { type: 'json' };

const QUERY = 'Seaside Dance Academy, 16 S Main St, Berlin, Maryland';
const CACHE_MS = 6 * 60 * 60 * 1000;
let cache = { at: 0, payload: null };

function saved() {
  return {
    ok: true,
    live: false,
    rating: seed.rating,
    count: seed.count,
    url: seed.url,
    reviews: seed.reviews,
  };
}

function dateLabel(value) {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  }).format(new Date(time));
}

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

async function google(path, options = {}) {
  const response = await fetch(`https://places.googleapis.com/v1/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || 'Google could not load the reviews.');
  }
  return payload;
}

async function loadLive() {
  const found = await google('places:searchText', {
    method: 'POST',
    headers: {
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.googleMapsUri',
    },
    body: JSON.stringify({ textQuery: QUERY }),
  });
  const place = (found.places || []).find((item) => {
    const name = clean(item.displayName?.text).toLowerCase();
    const address = clean(item.formattedAddress).toLowerCase();
    return name.includes('seaside') && address.includes('berlin');
  });
  if (!place?.id) throw new Error('Google did not find the studio.');
  const details = await google(`places/${place.id}`, {
    headers: {
      'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews',
    },
  });
  const reviews = (details.reviews || [])
    .map((review) => ({
      author: clean(review.authorAttribution?.displayName) || 'Google reviewer',
      rating: Math.max(1, Math.min(5, Math.round(Number(review.rating) || 0))),
      date: dateLabel(review.publishTime),
      text: clean(review.text?.text || review.originalText?.text),
      time: Date.parse(review.publishTime) || 0,
    }))
    .filter((review) => review.text)
    .sort((a, b) => b.time - a.time)
    .slice(0, 5)
    .map(({ time, ...review }) => review);
  if (!reviews.length) throw new Error('Google did not return any written reviews.');
  const rating = Number(details.rating);
  const count = Number(details.userRatingCount);
  return {
    ok: true,
    live: true,
    rating: Number.isFinite(rating) ? rating : seed.rating,
    count: Number.isFinite(count) ? count : seed.count,
    url: details.googleMapsUri || place.googleMapsUri || seed.url,
    reviews,
  };
}

export async function reviewsForClient() {
  if (!process.env.GOOGLE_PLACES_API_KEY) return saved();
  if (cache.payload && Date.now() - cache.at < CACHE_MS) return cache.payload;
  try {
    const payload = await loadLive();
    cache = { at: Date.now(), payload };
    return payload;
  } catch {
    return saved();
  }
}

export default async function handler(_req, res) {
  const payload = await reviewsForClient();
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.end(JSON.stringify(payload));
}
