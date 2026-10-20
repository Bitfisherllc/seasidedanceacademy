const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad';

interface TurnstileRenderOptions {
  sitekey: string;
  action?: string;
  theme?: 'light' | 'dark' | 'auto';
  appearance?: 'always' | 'execute' | 'interaction-only';
}

interface TurnstileApi {
  ready: (callback: () => void) => void;
  render: (element: HTMLElement, options: TurnstileRenderOptions) => string;
  getResponse: (widgetId: string) => string | undefined;
  reset: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onTurnstileLoad?: () => void;
  }
}

let loading: Promise<void> | null = null;

function loadApi() {
  if (window.turnstile) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    window.onTurnstileLoad = () => resolve();
    const script = document.createElement('script');
    script.src = SCRIPT;
    script.dataset.turnstileApi = '';
    script.onerror = () => {
      loading = null;
      reject(new Error('Turnstile failed to load'));
    };
    document.head.append(script);
  });
  return loading;
}

async function renderSlot(slot: HTMLElement) {
  if (slot.dataset.widgetId || !slot.dataset.sitekey) return;
  await loadApi();
  if (slot.dataset.widgetId || !window.turnstile) return;
  slot.dataset.widgetId = window.turnstile.render(slot, {
    sitekey: slot.dataset.sitekey,
    action: slot.dataset.action,
    theme: 'light',
    appearance: 'always',
  });
}

export function mountTurnstile(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-turnstile]').forEach((slot) => {
    void renderSlot(slot);
  });
}

function fail(status: HTMLElement, message: string) {
  status.classList.add('is-error');
  status.textContent = message;
}

export async function passedSpamCheck(form: HTMLFormElement, status: HTMLElement) {
  const slot = form.querySelector<HTMLElement>('[data-turnstile]');
  if (!slot?.dataset.sitekey) {
    fail(status, 'This form is unavailable until spam protection is configured.');
    return false;
  }
  try {
    await renderSlot(slot);
  } catch {
    fail(status, 'The spam check could not be loaded. Try again.');
    return false;
  }
  const widgetId = slot.dataset.widgetId || '';
  const token = widgetId ? window.turnstile?.getResponse(widgetId) : '';
  if (!token) {
    fail(status, 'Complete the spam check before sending.');
    return false;
  }
  status.classList.remove('is-error');
  status.textContent = 'Checking the form…';
  try {
    const response = await fetch('/api/turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: slot.dataset.action || '' }),
    });
    const result = await response.json().catch(() => ({ ok: false, error: '' }));
    if (!response.ok || !result.ok) {
      fail(status, result.error || 'The spam check did not pass. Try again.');
      if (widgetId) window.turnstile?.reset(widgetId);
      return false;
    }
  } catch {
    fail(status, 'The spam check could not be completed. Try again.');
    if (widgetId) window.turnstile?.reset(widgetId);
    return false;
  }
  if (widgetId) window.turnstile?.reset(widgetId);
  return true;
}
