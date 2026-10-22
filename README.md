# Seaside Dance Academy

Static rebuild of [seasidedanceacademy.net](https://www.seasidedanceacademy.net/) for deployment on Vercel. The layout, color system, and file organization follow the Sea Level Construction site. Page copy, class times, tuition, and studio facts come from the current Seaside Dance Academy website.

## Develop

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Contact and registration

Both forms open the visitor’s email app with the form filled in, addressed to seasidedanceacademy@gmail.com. The visitor sends the message from their own mailbox.

## Class desk

Studio staff manage the schedule at `/studio.html`. They can add a class, edit it, hide it, or delete it. Hidden classes stay in the desk and leave the public schedule, home page, search, and registration form.

The class desk password is `STUDIO_PASSWORD` in `.env` on this computer and in the Vercel project settings on the live site. It is not stored in the website files. On Vercel, also set a `GITHUB_TOKEN` that can update only this repository. A save commits the class list and the live site rebuilds.

Cloudflare Turnstile must pass, and the server must accept that token, before the email app opens. Set `PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` from the widget in the Cloudflare dashboard. Local development uses Cloudflare’s dummy keys when those variables are empty, so the widget is labeled for testing only.
