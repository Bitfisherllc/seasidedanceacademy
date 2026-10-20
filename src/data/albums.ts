import { albumPhotos } from './album-photos';

export const albums = albumPhotos.map((album) => ({
  date: album.date,
  title: album.title,
  slug: album.slug,
  href: `/photos--videos/${album.slug}.html`,
  image: album.images[0] || album.cover,
  video: album.video.length > 0,
  youtube: album.video,
  images: album.images,
}));

export const gallery = [
  { src: '/images/gallery/01.jpg', alt: 'Seaside Dance Academy dancers' },
  { src: '/images/gallery/02.jpg', alt: 'Seaside Dance Academy dancers' },
  { src: '/images/gallery/03.jpg', alt: 'Seaside Dance Academy competition' },
  { src: '/images/gallery/04.jpg', alt: 'Seaside Dance Academy competition' },
  { src: '/images/gallery/05.jpg', alt: 'Seaside Dance Academy performance' },
  { src: '/images/gallery/06.jpg', alt: 'Seaside Dance Academy performance' },
] as const;
