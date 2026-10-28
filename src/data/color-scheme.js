export const DEFAULT_COLORS = {
  green: '#568f89',
  greenLight: '#62a59e',
  header: '#3d625e',
  menu: '#6d9c97',
  plate: '#2f4f4b',
  blue: '#556d8c',
  blueLight: '#6885aa',
  paper: '#e3e3e3',
  footer: '#000000',
  heading: '#333333',
};

export const COLOR_FIELDS = [
  { key: 'green', css: '--green', label: 'Green', note: 'Icons, lines, and the breadcrumb bar.' },
  { key: 'greenLight', css: '--green-light', label: 'Light green', note: 'The lighter green along the breadcrumb curve.' },
  { key: 'header', css: '--header', label: 'Header green', note: 'The top bar after the page starts to scroll.' },
  { key: 'menu', css: '--menu', label: 'Menu green', note: 'The menu bar, header button fill, and return arrow.' },
  { key: 'plate', css: '--plate', label: 'Dark plate', note: 'The tilted shape behind cards and the director photo.' },
  { key: 'blue', css: '--blue', label: 'Blue', note: 'The line under the current menu item.' },
  { key: 'blueLight', css: '--blue-light', label: 'Light blue', note: 'Menu icons on a phone.' },
  { key: 'paper', css: '--paper', label: 'Section gray', note: 'The gray bands between white sections.' },
  { key: 'footer', css: '--footer', label: 'Footer', note: 'The bottom of every page.' },
  { key: 'heading', css: '--heading', label: 'Headings', note: 'Headings and the text on header buttons.' },
];

const HEX = /^#[0-9a-fA-F]{6}$/;

export function activeColors(saved) {
  const next = { ...DEFAULT_COLORS };
  if (!saved || typeof saved !== 'object') return next;
  for (const key of Object.keys(DEFAULT_COLORS)) {
    const value = String(saved[key] ?? '').trim();
    if (HEX.test(value)) next[key] = value.toLowerCase();
  }
  return next;
}

export function colorStyle(saved) {
  const colors = activeColors(saved);
  const lines = COLOR_FIELDS.map((field) => `${field.css}: ${colors[field.key]};`);
  return `:root { ${lines.join(' ')} }`;
}
