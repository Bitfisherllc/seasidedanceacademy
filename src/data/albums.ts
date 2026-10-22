import { albumPhotos } from './album-photos';
import photosPageData from './photos-page.json';

type SavedAlbum = { title?: string; date?: string; cover?: string; focus?: string; images?: string[]; alts?: Record<string, string> };

const savedAlbums = photosPageData.albums as Record<string, SavedAlbum>;

function photoList(saved: SavedAlbum, fallback: string[]) {
  return Array.isArray(saved.images) ? saved.images : fallback;
}

export const photosPage = {
  title: photosPageData.title,
  banner: photosPageData.banner,
};

const savedGalleries = albumPhotos.map((album) => {
  const saved = savedAlbums[album.slug] || {};
  const images = photoList(saved, album.images);
  return {
    date: saved.date || album.date,
    title: saved.title || album.title,
    slug: album.slug,
    href: `/photos--videos/${album.slug}.html`,
    image: saved.cover || images[0] || album.cover,
    focus: saved.focus || 'center 50%',
    video: album.video.length > 0,
    youtube: album.video,
    images,
    alts: saved.alts || {},
  };
});

const knownGalleries = new Set(savedGalleries.map((album) => album.slug));

const addedGalleries = Object.entries(savedAlbums)
  .filter(([slug]) => !knownGalleries.has(slug))
  .map(([slug, saved]) => {
    const images = photoList(saved, []);
    return {
      date: saved.date || '',
      title: saved.title || 'Gallery',
      slug,
      href: `/photos--videos/${slug}.html`,
      image: saved.cover || images[0] || '',
      focus: saved.focus || 'center 50%',
      video: false,
      youtube: '',
      images,
      alts: saved.alts || {},
    };
  });

export const albums = [...addedGalleries, ...savedGalleries];

export const gallery = [
  { src: '/images/gallery/01.jpg', alt: 'Seaside Dance Academy dancers in pink costumes performing a group routine on stage' },
  { src: '/images/gallery/02.jpg', alt: 'A Seaside Dance Academy dancer holding a standing split on stage' },
  { src: '/images/gallery/03.jpg', alt: 'Two Seaside Dance Academy dancers performing a lift on a dark stage' },
  { src: '/images/gallery/04.jpg', alt: 'Seaside Dance Academy dancers in red costumes performing at a GROOVE competition' },
  { src: '/images/gallery/05.jpg', alt: 'Seaside Dance Academy dancers in black and green costumes during a stage performance' },
  { src: '/images/gallery/06.jpg', alt: 'Seaside Dance Academy dancers in black costumes holding colorful umbrellas on stage' },
] as const;

export function photoAlt(title: string, src: string, index: number, alts?: Record<string, string>) {
  const custom = alts?.[src]?.trim();
  if (custom) return custom;
  return `${title}, photo ${index + 1}`;
}

export function albumDescription(title: string, date: string) {
  const lead = date ? `${title}. ${date}.` : `${title}.`;
  const base = `${lead} Photos from Seaside Dance Academy in Berlin, Maryland.`;
  const extra = `${base} Look through the pictures in this album.`;
  const chosen = base.length < 140 && extra.length <= 160 ? extra : base;
  if (chosen.length <= 160) return chosen;
  const shorter = `Photos from ${title} at Seaside Dance Academy in Berlin, Maryland.`;
  if (shorter.length <= 160) return shorter;
  return `${shorter.slice(0, 157).trimEnd()}…`;
}
