import { appendRichField, paintRich } from './rich-text.js';

export function appendQuoteField(fields) {
  const wrap = document.createElement('label');
  wrap.className = 'home-edit-label';
  wrap.append(document.createTextNode('Quote'));
  const input = document.createElement('textarea');
  input.name = 'heroQuote';
  input.required = true;
  input.maxLength = 280;
  input.rows = 4;
  input.value = document.querySelector('[data-hero-quote]')?.textContent?.trim() || '';
  wrap.append(input);
  fields.append(wrap);
}

export async function saveHeroQuote(quote) {
  const node = document.querySelector('[data-hero-quote]');
  const key = node?.dataset.heroKey || '';
  const response = await fetch('/api/hero-quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: { [key]: quote } }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'The quote could not save.');
  if (node && key && payload.page?.[key]) node.textContent = payload.page[key];
  return payload;
}

export function mountPageEditor(options) {
  const dialog = document.querySelector(options.dialog);
  const form = document.querySelector(options.form);
  const fields = document.querySelector(options.fields);
  const title = document.querySelector(options.title);
  const note = document.querySelector(options.note);
  const status = document.querySelector(options.status);
  if (!dialog || !form || !fields || form.dataset.ready === '1') return;
  form.dataset.ready = '1';

  let mode = '';
  let pendingUpload = null;
  const albums = Array.isArray(options.photoAlbums) ? options.photoAlbums : [];

  function focusAmount(value) {
    const match = String(value || '').match(/(\d{1,2})%/);
    const amount = match ? Number(match[1]) : 50;
    return Math.max(10, Math.min(90, amount));
  }

  function addPhoto() {
    const image = document.querySelector(`[data-home-photo="${options.photoKey}"]`);
    pendingUpload = null;
    const preview = document.createElement('div');
    preview.className = 'hero-preview';
    const previewImage = document.createElement('img');
    previewImage.alt = '';
    previewImage.src = image?.src || '';
    preview.append(previewImage);
    const sliderLabel = document.createElement('label');
    sliderLabel.className = 'home-edit-label';
    sliderLabel.append(document.createTextNode('Move the photo'));
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.name = 'focus';
    slider.min = '10';
    slider.max = '90';
    slider.value = String(focusAmount(image?.dataset.focus || ''));
    const place = () => {
      previewImage.style.objectPosition = `center ${slider.value}%`;
    };
    slider.addEventListener('input', place);
    place();
    sliderLabel.append(slider);
    const albumLabel = document.createElement('label');
    albumLabel.className = 'home-edit-label';
    albumLabel.append(document.createTextNode('Photos on the site'));
    const albumPick = document.createElement('select');
    albumPick.name = 'album';
    const blank = document.createElement('option');
    blank.value = '';
    blank.textContent = 'Choose an album';
    albumPick.append(blank);
    albums.forEach((album, albumIndex) => {
      const option = document.createElement('option');
      option.value = String(albumIndex);
      option.textContent = album.title;
      albumPick.append(option);
    });
    const picks = document.createElement('div');
    picks.className = 'band-picks';
    albumPick.addEventListener('change', () => {
      picks.replaceChildren();
      const album = albums[Number(albumPick.value)];
      if (!album) return;
      album.images.forEach((imageSrc) => {
        const choice = document.createElement('button');
        choice.type = 'button';
        choice.dataset.src = imageSrc;
        const thumb = document.createElement('img');
        thumb.src = imageSrc;
        thumb.alt = '';
        choice.append(thumb);
        choice.addEventListener('click', () => {
          pendingUpload = null;
          const filePick = form.querySelector('input[name="upload"]');
          if (filePick) filePick.value = '';
          picks.querySelectorAll('button').forEach((button) => button.classList.remove('is-on'));
          choice.classList.add('is-on');
          previewImage.src = imageSrc;
          previewImage.dataset.chosen = imageSrc;
        });
        picks.append(choice);
      });
    });
    albumLabel.append(albumPick);
    const uploadLabel = document.createElement('label');
    uploadLabel.className = 'home-edit-label';
    uploadLabel.append(document.createTextNode('Or upload a photo'));
    const upload = document.createElement('input');
    upload.type = 'file';
    upload.name = 'upload';
    upload.accept = 'image/jpeg,image/png,image/webp';
    upload.addEventListener('change', () => {
      const file = upload.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        if (status) status.textContent = 'Use a photo under 5 MB.';
        upload.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        pendingUpload = { type: file.type, data: result.split(',')[1] || '' };
        previewImage.src = result;
        delete previewImage.dataset.chosen;
        picks.querySelectorAll('button').forEach((button) => button.classList.remove('is-on'));
      };
      reader.readAsDataURL(file);
    });
    uploadLabel.append(upload);
    fields.append(preview, sliderLabel, albumLabel, picks, uploadLabel);
    if (options.quote !== false) appendQuoteField(fields);
  }

  function openEditor(kind) {
    mode = kind;
    pendingUpload = null;
    if (status) status.textContent = '';
    fields.replaceChildren();
    if (kind === 'banner') {
      if (title) title.textContent = 'Banner';
      if (note) note.textContent = options.bannerNote;
      addPhoto();
    } else {
      if (title) title.textContent = options.copyTitle;
      if (note) note.textContent = options.copyNote;
      options.copyFields.forEach((field) => {
        const wrap = document.createElement('label');
        wrap.className = 'home-edit-label';
        wrap.append(document.createTextNode(field.label));
        if (field.long) {
          const node = document.querySelector(`[${options.dataAttr}="${field.key}"]`);
          appendRichField(wrap, { name: field.key, max: field.max, html: node?.innerHTML || '' });
        } else {
          const input = document.createElement('input');
          input.name = field.key;
          input.required = true;
          input.maxLength = field.max;
          input.value = document.querySelector(`[${options.dataAttr}="${field.key}"]`)?.textContent?.trim() || '';
          wrap.append(input);
        }
        fields.append(wrap);
      });
    }
    dialog.showModal();
  }

  document.querySelectorAll('[data-edit]').forEach((button) => {
    button.addEventListener('click', () => openEditor(button.dataset.edit || ''));
  });

  document.querySelector(options.cancel)?.addEventListener('click', () => dialog.close());

  async function savePage(event) {
    event.preventDefault();
    if (!mode || !status) return;
    const values = {};
    if (mode === 'banner') {
      const image = document.querySelector(`[data-home-photo="${options.photoKey}"]`);
      const previewImage = form.querySelector('.hero-preview img');
      const slider = form.querySelector('input[name="focus"]');
      const chosen = previewImage?.dataset.chosen || image?.getAttribute('src') || '';
      values['banner.src'] = chosen.startsWith('data:') ? image?.getAttribute('src') || '' : new URL(chosen, location.origin).pathname;
      values['banner.focus'] = `center ${slider?.value || '50'}%`;
    } else {
      if (form.querySelector('.rich-area[data-over]')) {
        status.textContent = 'Shorten the paragraph. Formatting is not counted, but the words are.';
        return;
      }
      options.copyFields.forEach((field) => {
        const input = form.elements.namedItem(field.key);
        values[field.key] = input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement ? input.value : '';
      });
    }
    const save = form.querySelector('.home-edit-save');
    if (save) save.disabled = true;
    status.textContent = 'Saving…';
    try {
      const response = await fetch(options.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values, image: pendingUpload }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || `The ${options.copyTitle.toLowerCase()} page could not save.`);
      if (mode === 'banner' && payload.page?.banner) {
        const image = document.querySelector(`[data-home-photo="${options.photoKey}"]`);
        const src = payload.page.banner.src;
        if (image && src) {
          image.src = src.includes(options.bannerMark) ? `${src}?v=${Date.now()}` : src;
          image.style.objectPosition = payload.page.banner.focus;
          image.dataset.focus = payload.page.banner.focus;
        }
        const quoteInput = form.querySelector('textarea[name="heroQuote"]');
        if (quoteInput instanceof HTMLTextAreaElement) await saveHeroQuote(quoteInput.value);
      }
      if (mode === 'copy' && payload.page) {
        options.copyFields.forEach((field) => {
          const node = document.querySelector(`[${options.dataAttr}="${field.key}"]`);
          if (node && payload.page[field.key]) {
            if (field.long) paintRich(node, payload.page[field.key]);
            else node.textContent = payload.page[field.key];
          }
        });
      }
      pendingUpload = null;
      window.studioSaved(dialog instanceof HTMLDialogElement ? dialog : null);
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : `The ${options.copyTitle.toLowerCase()} page could not save.`;
    } finally {
      if (save) save.disabled = false;
    }
  }

  form.addEventListener('submit', savePage);
  form.querySelector('.home-edit-save')?.addEventListener('click', savePage);
}
