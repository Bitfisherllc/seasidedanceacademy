export const site = {
  name: 'Seaside Dance Academy',
  url: 'https://www.seasidedanceacademy.net',
  description:
    'Technical dance training in a supportive and encouraging environment for dancers at all levels. Studio at 16 S Main St Unit C, Berlin, Maryland.',
  phoneDisplay: '(410) 629-0377',
  phoneTel: '4106290377',
  email: 'seasidedanceacademy@gmail.com',
  director: 'Lisa Tingle',
  street: '16 S Main St Unit C',
  city: 'Berlin',
  region: 'MD',
  postal: '21811',
  addressLine: '16 S Main St Unit C, Berlin, MD 21811',
  contactAddressLine: '16 C South Main Street, Berlin, Maryland 21811',
  facebook: 'https://www.facebook.com/seasidedanceacademy/',
  instagram: 'https://www.instagram.com/seasidedanceacademy_/',
  youtube: 'https://www.youtube.com/channel/UCCv4nTJ4pOkba_B58Wo7C4Q',
  quote:
    'We pride ourselves in providing strong TECHNICAL dance training in a supportive & encouraging environment for dancers at all levels.',
  season: 'Registration now open for our 2026-2027 Season',
  seasonStart: 'Classes begin Monday September 14th',
  opened: 'September of 2001',
} as const;

export const nav = [
  { href: '/', label: 'Home', icon: 'house', brand: false },
  { href: '/classes.html', label: 'Classes', icon: 'person-running', brand: false },
  { href: '/registration.html', label: 'Registration', icon: 'clipboard-list', brand: false },
  { href: '/seaside-news.html', label: 'News', icon: 'facebook', brand: true },
  { href: '/photos--videos.html', label: 'Photos', icon: 'images', brand: false },
  { href: '/contact.html', label: 'Contact', icon: 'envelope', brand: false },
] as const;

export const pages = {
  home: {
    title: 'Seaside Dance Academy | Berlin, MD',
    description:
      'Dance classes for ages 3 and up in Berlin, Maryland. Ballet, jazz, tap, hip hop, acro, pom, and Broadway. Registration is open for the 2026-2027 season.',
  },
  classes: {
    title: 'Classes | Seaside Dance Academy',
    description:
      '2026-2027 class schedule, ages, and monthly tuition for Seaside Dance Academy in Berlin, Maryland. Classes begin Monday, September 14.',
  },
  registration: {
    title: 'Registration | Seaside Dance Academy',
    description:
      'Register for the 2026-2027 season at Seaside Dance Academy. Classes begin Monday, September 14.',
  },
  news: {
    title: 'Seaside News | Seaside Dance Academy',
    description: 'News from Seaside Dance Academy in Berlin, Maryland.',
  },
  photos: {
    title: 'Photos & Videos | Seaside Dance Academy',
    description: 'Photos and videos from Seaside Dance Academy recitals, competitions, and studio life.',
  },
  contact: {
    title: 'Contact | Seaside Dance Academy',
    description: 'Call Seaside Dance Academy at (410) 629-0377. Studio at 16 S Main St Unit C, Berlin, MD 21811.',
  },
} as const;
