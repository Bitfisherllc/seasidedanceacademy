const CLOCK = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function clockValue(value) {
  const match = CLOCK.exec(String(value || '').trim());
  if (!match) return '';
  return `${match[1]}:${match[2]}`;
}

export function formatClock(value) {
  const clock = clockValue(value);
  if (!clock) return '';
  const hour = Number(clock.slice(0, 2));
  const minute = clock.slice(3);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${suffix}`;
}

export function formatRange(start, end) {
  const from = formatClock(start);
  const to = formatClock(end);
  if (!from || !to) return '';
  return `${from}–${to}`;
}
