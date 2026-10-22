export const site = {
  name: 'Seaside Dance Academy',
  url: 'https://www.seasidedanceacademy.net',
  description:
    'Technical dance training in a supportive and encouraging environment for dancers at all levels. Studio at 16 S Main St, Berlin, Maryland.',
  phoneDisplay: '(410) 629-0377',
  phoneTel: '4106290377',
  email: 'seasidedanceacademy@gmail.com',
  director: 'Lisa Tingle',
  street: '16 S Main St',
  city: 'Berlin',
  region: 'Maryland',
  postal: '21811',
  addressLine: '16 S Main St, Berlin, Maryland 21811',
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
  { href: '/reviews.html', label: 'Reviews', icon: 'star', brand: false },
  { href: '/q-and-a.html', label: 'Q & A', icon: 'circle-question', brand: false },
  { href: '/contact.html', label: 'Contact', icon: 'envelope', brand: false },
] as const;

export const pages = {
  home: {
    title: 'Seaside Dance Academy | Berlin, MD',
    description:
      'Dance classes for ages 3 and up in Berlin, Maryland. Ballet, jazz, tap, hip hop, acro, pom, and Broadway. Registration is open for the 2026-2027 season.',
  },
  classes: {
    title: 'Dance Classes | Seaside Dance Academy',
    description:
      'See the 2026-2027 schedule, ages, days, and monthly tuition at Seaside Dance Academy in Berlin, Maryland. Classes begin September 14.',
  },
  registration: {
    title: 'Class Registration | Seaside Dance Academy',
    description:
      'Register for the 2026-2027 season at Seaside Dance Academy in Berlin, Maryland. Classes begin Monday, September 14. Call (410) 629-0377.',
  },
  news: {
    title: 'Studio News | Seaside Dance Academy',
    description:
      'News and Facebook updates from Seaside Dance Academy in Berlin, Maryland, including performances, awards, and studio life. Read the latest posts.',
  },
  photos: {
    title: 'Photos & Videos | Seaside Dance Academy',
    description:
      'Photo albums and videos from Seaside Dance Academy recitals, competitions, and studio life in Berlin, Maryland. Open an album to see the pictures.',
  },
  reviews: {
    title: 'Google Reviews | Seaside Dance Academy',
    description:
      'Read Google reviews from Seaside Dance Academy families in Berlin, Maryland, or leave a review for the studio. Written reviews come from Google.',
  },
  contact: {
    title: 'Contact | Seaside Dance Academy',
    description:
      'Call Seaside Dance Academy at (410) 629-0377 or email the studio at 16 S Main St, Berlin, Maryland 21811. Desk staff are available during operation hours.',
  },
  directions: {
    title: 'Directions | Seaside Dance Academy',
    description:
      'Get directions to Seaside Dance Academy at 16 S Main St, Berlin, Maryland 21811, about ten miles from Ocean City and Assateague Island.',
  },
  qa: {
    title: 'Class Questions | Seaside Dance Academy',
    description:
      'Answers about start dates, ages, tuition, and the Seaside Dance Academy studio at 16 S Main St in Berlin, Maryland. Classes begin September 14.',
  },
  instagram: {
    title: 'Instagram | Seaside Dance Academy',
    description:
      'Recent photos from the Seaside Dance Academy Instagram, @seasidedanceacademy_, in Berlin, Maryland. Follow the studio for new pictures.',
  },
} as const;
