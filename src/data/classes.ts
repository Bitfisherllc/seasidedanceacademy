import catalog from './classes.json';
import pageCopy from './classes-page.json';
import { clockValue, formatRange } from './class-time.js';

export const disclaimer = pageCopy.disclaimer;
export const balletGuide = pageCopy.balletGuide;
export const hipHopGuide = pageCopy.hipHopGuide;

export const classGroups = [
  { id: 'grow', label: 'Dance & Grow and Pre' },
  { id: 'ballet', label: 'Ballet, jazz, and tap' },
  { id: 'hip-hop', label: 'Hip hop' },
  { id: 'more', label: 'Other classes' },
] as const;

export const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export type ClassGroup = (typeof classGroups)[number]['id'];
export type Weekday = (typeof weekdays)[number];
export type Billing = 'month' | 'hour' | 'half-hour';

export type ClassSession = {
  day: Weekday;
  start: string;
  end: string;
  time: string;
};

export type DanceClass = {
  id: string;
  name: string;
  ages: string;
  sessions: ClassSession[];
  days: string;
  when: string;
  availability: string;
  amount: string;
  billing: Billing;
  tuition: string;
  summary: string;
  recital?: string;
  group: ClassGroup;
  hidden: boolean;
  featured: boolean;
  order: number;
};

const groupIds = new Set<string>(classGroups.map((group) => group.id));
const dayIds = new Set<string>(weekdays);

function asGroup(value: string): ClassGroup {
  return groupIds.has(value) ? (value as ClassGroup) : 'more';
}

function asBilling(value: string): Billing {
  if (value === 'hour' || value === 'half-hour') return value;
  return 'month';
}

function pluralDay(day: string) {
  return day.endsWith('s') ? day : `${day}s`;
}

function daysOffered(sessions: ClassSession[]) {
  const names = weekdays.filter((day) => sessions.some((session) => session.day === day));
  if (names.length === 0) return '';
  if (names.length === 1) return pluralDay(names[0]);
  if (names.length === 2) return `${pluralDay(names[0])} and ${pluralDay(names[1])}`;
  const last = names[names.length - 1];
  return `${names.slice(0, -1).map(pluralDay).join(', ')}, and ${pluralDay(last)}`;
}

function priceLine(amount: string, billing: Billing) {
  const unit = billing === 'hour' ? 'per hour' : billing === 'half-hour' ? 'per ½ hour' : 'per month';
  const dollars = amount.startsWith('$') ? amount : `$${amount}`;
  return `${dollars} ${unit}`;
}

export const allClasses: DanceClass[] = catalog.classes
  .map((item) => {
    const sessions = (item.sessions || [])
      .filter((session) => dayIds.has(session.day) && clockValue(session.start) && clockValue(session.end))
      .map((session) => ({
        day: session.day as Weekday,
        start: clockValue(session.start),
        end: clockValue(session.end),
        time: formatRange(session.start, session.end),
      }))
      .sort((a, b) => weekdays.indexOf(a.day) - weekdays.indexOf(b.day));
    const billing = asBilling(item.billing);
    const amount = String(item.amount || '').replace(/^\$/, '');
    const availability = item.availability || '';
    return {
      id: item.id,
      name: item.name,
      ages: item.ages,
      sessions,
      days: daysOffered(sessions),
      when: sessions.length
        ? sessions.map((session) => `${pluralDay(session.day)} ${session.time}`).join(' or ')
        : availability,
      availability,
      amount,
      billing,
      tuition: priceLine(amount, billing),
      summary: item.summary,
      recital: item.recital || undefined,
      group: asGroup(item.group),
      hidden: Boolean(item.hidden),
      featured: Boolean(item.featured),
      order: Number(item.order) || 0,
    };
  })
  .sort((a, b) => a.order - b.order);

export const classes = allClasses.filter((item) => !item.hidden);

export const homeClasses = classes.filter((item) => item.featured);

export function classesIn(group: ClassGroup) {
  return classes.filter((item) => item.group === group);
}
