# RoboBricks — Kids Robotics & LEGO Building Club HTML Template

A multipage HTML5 template for kids' robotics, LEGO engineering and coding clubs, with a full parent dashboard.

**Stack:** HTML5 · CSS3 (custom properties) · Bootstrap 5.3 · Bootstrap Icons · Vanilla JavaScript (ES6+) · Google Fonts. No jQuery, no build step.

---

Full illustrated documentation with live component examples: open `documentation/index.html`.

## 1. Getting started

Open `index.html` (it forwards to `pages/index.html`) in a browser, or serve the folder with any static server:

```bash
npx serve .        # or: python3 -m http.server
```

Bootstrap, Bootstrap Icons and Google Fonts load from CDNs, so an internet connection is needed. To self-host, download them and replace the URLs in each page's `<head>` (search for `cdn.jsdelivr.net` and `fonts.googleapis.com`). If you self-host Bootstrap, also update `BS_LTR` / `BS_RTL` at the top of `assets/js/main.js`.

## 2. File structure

```
/
├── index.html            Entry point, forwards to pages/index.html
├── pages/
│   ├── index.html        Home 1 (classic)
│   ├── home-2.html       Home 2 "The Maker Lab" (dark, interactive robot)
│   ├── about.html  programs.html  program-details.html  instructors.html
│   ├── showcase.html  events.html  gallery.html  blog.html  blog-details.html
│   ├── faq.html  contact.html  login.html  register.html  404.html
│   └── dashboard/
│       ├── index.html            Overview
│       ├── children.html         My Children
│       ├── child-profile.html    Child Profile
│       ├── programs.html         Programs
│       ├── schedule.html         Upcoming Sessions (calendar + list)
│       ├── progress.html         Project Progress (timeline tracker)
│       ├── badges.html           Skill Badges wall
│       ├── achievements.html     Achievements
│       ├── showcase.html         Showcase Projects
│       ├── payments.html         Payments
│       ├── payment-history.html  Payment History
│       ├── invoices.html         Invoices
│       ├── messages.html         Messages
│       ├── notifications.html    Notifications
│       ├── profile.html          Profile Settings
│       └── settings.html         Account Settings
├── documentation/        Illustrated guide with live component demos
└── assets/
    ├── css/style.css       Tokens, components, all public sections
    ├── css/dashboard.css   Dashboard layout and widgets
    ├── css/rtl.css         RTL adjustments
    ├── js/main.js          Shared site behaviour
    ├── js/dashboard.js     Dashboard behaviour
    └── img/                Favicon, fallback SVG illustrations
```

Pages in `pages/` reference assets as `../assets/…`; dashboard pages use `../../assets/…`. Links between pages are plain relative links (`about.html`, `dashboard/index.html`), so the folder works from any host or sub-folder.

## 3. Customising the brand

All colours, fonts, radii and shadows live as CSS custom properties at the top of `assets/css/style.css`:

| Token | Default | Use |
|---|---|---|
| `--rb-navy` | `#0A0A0A` | Text, outlines, dark sections |
| `--rb-blue` | `#0A0A0A` | Secondary buttons / solid fills (yellow in dark mode) |
| `--rb-yellow` | `#FACC15` | Primary CTA, highlights |
| `--rb-orange` | `#FACC15` | Alerts, accents |
| `--rb-mint` | `#FACC15` | Success, progress |
| `--rb-sky` | `#FFF8D6` | Soft backgrounds |
| `--rb-white` | `#FFFFFF` | Page background |
| `--rb-gray` | `#4E4E4E` | Body text |

Dark-mode values are overridden in the `[data-bs-theme="dark"]` block directly below.

**Fonts:** Nunito (headings), Manrope (body), Space Grotesk (technical labels). Change `--rb-font-display`, `--rb-font-body`, `--rb-font-tech` and the Google Fonts URL in each `<head>`.

**Signature style:** components use a 2px navy outline with a hard offset shadow (`--rb-shadow`) to feel like stacked bricks. Reduce it globally by setting `--rb-shadow: none`.

## 4. Theme & direction

Both preferences are stored in `localStorage` and applied before first paint by a small inline script in every `<head>`:

| Key | Values | Toggle attribute |
|---|---|---|
| `robotics-theme` | `light` / `dark` | `data-theme-toggle` |
| `robotics-dir` | `ltr` / `rtl` | `data-dir-toggle` |

Add either attribute to any button to make it a toggle. When RTL is on, the page swaps to `bootstrap.rtl.min.css` automatically and `rtl.css` applies the remaining adjustments. Layout CSS uses logical properties (`inset-inline`, `margin-inline`, `border-inline`), so sidebars, progress bars, timelines and forms mirror without extra rules.

> The demo content is English, so headings may show punctuation on the "wrong" side in RTL. With real Arabic or Hebrew copy this resolves itself. Set `<html lang="ar">` (or `he`) when you translate.

## 5. JavaScript hooks (data attributes)

| Attribute | What it does |
|---|---|
| `data-reveal` | Fades element in on scroll |
| `data-count="1800" data-suffix="+"` | Animated number counter |
| `data-progress="78"` | Animates a bar's width to 78% |
| `data-ring="78"` | Animates a `.ring` progress circle |
| `data-finder` | Program finder (tabs + filters). Edit the `PROGRAMS` array in `main.js` |
| `data-filter-group="#target"` + `data-filter="cat"` | Filter children of `#target` by their `data-cat` |
| `data-faq-search` | Live FAQ search with highlighting |
| `form[data-validate]` | Accessible validation; `data-success` sets the toast, `data-redirect` navigates after success |
| `form[data-newsletter]` | Newsletter form handler |
| `data-lightbox="img.svg"` | Opens image in the gallery modal |
| `data-countdown="2026-11-14T09:00:00+05:30"` | Event countdown |
| `data-toast="Message"` | Shows a toast on click (handy for demo actions) |
| `data-calendar` | Dashboard calendar. Sessions are in `SESSIONS` in `dashboard.js` |
| `data-messages` | Dashboard chat (thread switching, sending) |
| `data-table-search="#table"` | Live table filter |

`window.RoboBricks.toast("Saved")` is available for your own scripts.

**Forms are front-end only.** Connect them to your backend or a form service by replacing the `setTimeout` in the `form[data-validate]` handler in `main.js` with a `fetch()` call.

## 6. Images

The demo uses **real photography** throughout: kids building robots, LEGO builds and mentor portraits, all free for commercial use under the Pexels and Unsplash licences. Full list with photographers in `CREDITS.md`.

How it works:

- Photos are hotlinked from the Pexels / Unsplash CDNs at a sensible width (`w=` in the URL), so the download stays small and no licence-restricted files are redistributed.
- Every `<img>` has a `data-fallback` pointing to a bundled SVG illustration in `assets/img/`. If a photo can't load (offline, blocked network, photo removed), `main.js` swaps in the illustration automatically, so layouts never show broken images.
- The footer bricks and the 404 robot are intentional brand illustrations, not photo slots.

**For a live site**, replace the demo photos with your own club's photography (always with written parent consent) or download the demo photos and self-host them:

```html
<img src="../assets/img/my-hero.jpg" data-fallback="../assets/img/hero-makerspace.svg" alt="…">
```

Recommended sizes: hero 1600×1400, project/showcase 1200×900, mentor portraits 800×840, blog thumbnails 1200×790, Open Graph 1200×630.

## 7. SEO & accessibility

- Semantic landmarks, one `<h1>` per page, breadcrumb navigation with `BreadcrumbList` JSON-LD
- JSON-LD for `EducationalOrganization`, `Course`, `Event`, `Article`, `FAQPage`
- Open Graph and Twitter card tags (update `https://robobricks.example.com` to your domain)
- Visible focus states, skip link, keyboard-operable tabs (arrow keys), ARIA live regions for filters and toasts
- `prefers-reduced-motion` disables animation
- Dashboard pages are marked `noindex`

## 8. Browser support

Latest Chrome, Edge, Firefox and Safari, plus iOS Safari and Chrome for Android. Tested from 320px to 1920px.

## 9. Credits

- Bootstrap 5.3 — MIT
- Bootstrap Icons — MIT
- Nunito, Manrope, Space Grotesk — SIL Open Font License
- Photography — Pexels & Unsplash photographers, see `CREDITS.md`
- Illustrations (fallbacks, footer, 404) — original, included with the template

LEGO® is a trademark of the LEGO Group, which does not sponsor or endorse this template. Rename "LEGO" references to "brick building" if you sell or use the template without a licence to use the mark.
