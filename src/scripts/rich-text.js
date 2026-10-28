import { plainText, sanitizeRich } from '../../api/rich-text.js';

function syncEditor(area, max, count, onChange) {
  const html = sanitizeRich(area.innerHTML);
  const plain = plainText(html);
  onChange(html);
  if (count) count.textContent = `${[...plain].length} of ${max}`;
  if ([...plain].length > max) area.dataset.over = '1';
  else delete area.dataset.over;
}

function createEditor(max, html, onChange) {
  const box = document.createElement('div');
  box.className = 'rich-edit';
  const tools = document.createElement('div');
  tools.className = 'rich-tools';
  tools.setAttribute('role', 'toolbar');
  tools.setAttribute('aria-label', 'Paragraph formatting');
  const bold = document.createElement('button');
  bold.type = 'button';
  bold.className = 'rich-tool';
  bold.title = 'Bold';
  bold.setAttribute('aria-label', 'Bold');
  const boldMark = document.createElement('strong');
  boldMark.textContent = 'B';
  bold.append(boldMark);
  const under = document.createElement('button');
  under.type = 'button';
  under.className = 'rich-tool';
  under.title = 'Underline';
  under.setAttribute('aria-label', 'Underline');
  const underMark = document.createElement('span');
  underMark.style.textDecoration = 'underline';
  underMark.textContent = 'U';
  under.append(underMark);
  const italic = document.createElement('button');
  italic.type = 'button';
  italic.className = 'rich-tool';
  italic.title = 'Italic';
  italic.setAttribute('aria-label', 'Italic');
  const italicMark = document.createElement('em');
  italicMark.textContent = 'I';
  italic.append(italicMark);
  const bullets = document.createElement('button');
  bullets.type = 'button';
  bullets.className = 'rich-tool';
  bullets.title = 'Bulleted list';
  bullets.setAttribute('aria-label', 'Bulleted list');
  bullets.textContent = '•';
  const numbers = document.createElement('button');
  numbers.type = 'button';
  numbers.className = 'rich-tool';
  numbers.title = 'Numbered list';
  numbers.setAttribute('aria-label', 'Numbered list');
  numbers.textContent = '1.';
  const link = document.createElement('button');
  link.type = 'button';
  link.className = 'rich-tool rich-tool-link';
  link.title = 'Link';
  link.setAttribute('aria-label', 'Link');
  link.textContent = 'Link';
  tools.append(bold, italic, under, bullets, numbers, link);
  const linkRow = document.createElement('div');
  linkRow.className = 'rich-link';
  linkRow.hidden = true;
  const linkInput = document.createElement('input');
  linkInput.type = 'text';
  linkInput.placeholder = 'https://';
  linkInput.setAttribute('aria-label', 'Link address');
  const linkApply = document.createElement('button');
  linkApply.type = 'button';
  linkApply.className = 'rich-tool rich-tool-link';
  linkApply.textContent = 'Add';
  const linkRemove = document.createElement('button');
  linkRemove.type = 'button';
  linkRemove.className = 'rich-tool rich-tool-link';
  linkRemove.textContent = 'Remove';
  linkRow.append(linkInput, linkApply, linkRemove);
  const area = document.createElement('div');
  area.className = 'rich-area';
  area.contentEditable = 'true';
  area.spellcheck = true;
  area.setAttribute('role', 'textbox');
  area.setAttribute('aria-multiline', 'true');
  area.innerHTML = sanitizeRich(html);
  const count = document.createElement('p');
  count.className = 'rich-count';
  const note = document.createElement('p');
  note.className = 'rich-note';
  note.textContent = 'Bold, italic, underline, lists, and links. Press Enter for a new line.';
  function format(command) {
    area.focus();
    document.execCommand(command, false);
    syncEditor(area, max, count, onChange);
  }
  let savedRange = null;
  function saveRange() {
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount || !area.contains(selection.anchorNode)) return;
    savedRange = selection.getRangeAt(0).cloneRange();
  }
  function restoreRange() {
    if (!savedRange) return;
    area.focus();
    const selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);
  }
  function currentLink() {
    const node = document.getSelection()?.anchorNode;
    const element = node?.nodeType === 1 ? node : node?.parentElement;
    return element?.closest('a') || null;
  }
  bold.addEventListener('click', () => format('bold'));
  italic.addEventListener('click', () => format('italic'));
  under.addEventListener('click', () => format('underline'));
  bullets.addEventListener('click', () => format('insertUnorderedList'));
  numbers.addEventListener('click', () => format('insertOrderedList'));
  link.addEventListener('click', () => {
    saveRange();
    const existing = currentLink();
    linkInput.value = existing?.getAttribute('href') || '';
    linkRow.hidden = false;
    linkInput.focus();
  });
  linkApply.addEventListener('click', () => {
    const href = linkInput.value.trim();
    const safe = /^(https?:\/\/|mailto:|tel:|\/(?!\/))\S+$/i.test(href) && !/["'<>]/.test(href) ? href : '';
    if (!safe) {
      linkInput.setCustomValidity('Use a web address, email link, or phone link.');
      linkInput.reportValidity();
      return;
    }
    linkInput.setCustomValidity('');
    restoreRange();
    if (!savedRange || savedRange.collapsed) document.execCommand('insertHTML', false, sanitizeRich(`<a href="${safe}">${safe}</a>`));
    else document.execCommand('createLink', false, safe);
    linkRow.hidden = true;
    syncEditor(area, max, count, onChange);
  });
  linkRemove.addEventListener('click', () => {
    restoreRange();
    document.execCommand('unlink', false);
    linkRow.hidden = true;
    syncEditor(area, max, count, onChange);
  });
  linkInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      linkApply.click();
    }
  });
  area.addEventListener('beforeinput', (event) => {
    if (event.inputType !== 'insertParagraph') return;
    const node = document.getSelection()?.anchorNode;
    const element = node?.nodeType === 1 ? node : node?.parentElement;
    if (element?.closest('li')) return;
    event.preventDefault();
    document.execCommand('insertLineBreak');
  });
  area.addEventListener('paste', (event) => {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text/html') || event.clipboardData?.getData('text/plain') || '';
    document.execCommand('insertHTML', false, sanitizeRich(pasted));
    syncEditor(area, max, count, onChange);
  });
  area.addEventListener('drop', (event) => event.preventDefault());
  area.addEventListener('input', () => syncEditor(area, max, count, onChange));
  function markTools() {
    if (!area.isConnected) {
      document.removeEventListener('selectionchange', markTools);
      return;
    }
    const node = document.getSelection()?.anchorNode;
    if (!node || !area.contains(node)) {
      bold.classList.remove('is-on');
      italic.classList.remove('is-on');
      under.classList.remove('is-on');
      bullets.classList.remove('is-on');
      numbers.classList.remove('is-on');
      link.classList.remove('is-on');
      return;
    }
    bold.classList.toggle('is-on', document.queryCommandState('bold'));
    italic.classList.toggle('is-on', document.queryCommandState('italic'));
    under.classList.toggle('is-on', document.queryCommandState('underline'));
    bullets.classList.toggle('is-on', document.queryCommandState('insertUnorderedList'));
    numbers.classList.toggle('is-on', document.queryCommandState('insertOrderedList'));
    const element = node.nodeType === 1 ? node : node.parentElement;
    link.classList.toggle('is-on', Boolean(element?.closest('a')));
  }
  document.addEventListener('selectionchange', markTools);
  box.append(tools, linkRow, area, count, note);
  syncEditor(area, max, count, onChange);
  box.area = area;
  return box;
}

export function appendRichField(parent, { name, max, html }) {
  const hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.name = name;
  const box = createEditor(max, html, (value) => {
    hidden.value = value;
  });
  box.append(hidden);
  parent.append(box);
}

export function upgradeTextarea(textarea) {
  if (!(textarea instanceof HTMLTextAreaElement) || textarea.dataset.rich === '1') return;
  textarea.dataset.rich = '1';
  const max = Number(textarea.getAttribute('maxlength')) || 800;
  textarea.removeAttribute('maxlength');
  textarea.required = false;
  const box = createEditor(max, textarea.value, (value) => {
    textarea.value = value;
  });
  textarea.hidden = true;
  textarea.before(box);
  textarea.addEventListener('rich-sync', () => {
    box.area.innerHTML = sanitizeRich(textarea.value);
    textarea.value = sanitizeRich(textarea.value);
    box.area.dispatchEvent(new Event('input'));
  });
}

export function paintRich(node, html) {
  if (node instanceof HTMLElement) node.innerHTML = sanitizeRich(html);
}

export { sanitizeRich };
