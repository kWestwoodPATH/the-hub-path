# theHUB @PATH — Website

Static HTML site for theHUB @PATH. No build step. Open `index.html` in a browser to preview locally.

## Structure

```
website/
├── index.html             Home
├── jobs.html              Job board (data: data/jobs.json)
├── events.html            Events (data: data/events.json)
├── newsletters.html       Newsletter archive (data: data/newsletters.json)
├── contact.html           Contact + service request forms
├── privacy.html           Privacy policy (Google Analytics covered)
├── css/styles.css         All site styling (brand palette as CSS variables)
├── js/site.js             Nav, GA loader, content loaders, job filtering
├── data/
│   ├── jobs.js            Edit to update job board (window.HUB_JOBS)
│   ├── events.js          Edit to update events (window.HUB_EVENTS)
│   └── newsletters.js     Edit to update newsletter archive (window.HUB_NEWSLETTERS)
└── assets/
    ├── logos/             logo-full.png, logo-mark.png, logo-tagline.png
    ├── people/            Drop staff photos here (see README in folder)
    ├── events/            Optional event images
    └── newsletters/       Drop newsletter PDFs here
```

## How to maintain

Data lives in `data/*.js` files as plain arrays. Edit them in any text editor — the format is JSON-like JavaScript. **Why JS, not JSON?** Browsers block local JSON fetches when you open HTML files directly (file://), so the data is loaded as a script instead. This way the site works whether you double-click `index.html` or deploy it to a web server.

### Add a job
Edit `data/jobs.js`. Each entry needs `title`, `employer`. Optional: `location`, `type`, `category`, `posted` (YYYY-MM-DD), `url`.

### Add an event
Edit `data/events.js`. Required: `title`, `date` (YYYY-MM-DD). Optional: `time`, `location`, `description`, `image`, `registerUrl`, `featured` (true/false), `host`. Past events drop off automatically.

### Add a newsletter
For a quick archive entry pointing to a PDF:
1. Drop the PDF in `assets/newsletters/` (e.g. `2026-04-spring.pdf`).
2. Add an entry to `data/newsletters.js` with `title`, `date`, `summary`, and `file` (e.g. `"assets/newsletters/2026-04-spring.pdf"`).

For a full web-styled newsletter (recommended — see May 2026 as the example):
1. Copy `newsletter-2026-05.html`, rename it (e.g. `newsletter-2026-06.html`), and edit the wording.
2. Add an entry to `data/newsletters.js` with `page` pointing to the new HTML file and `file` pointing to the PDF. The archive will show a Read button (web) and a PDF button.
3. **Post any sessions to the Events page:** for each dated session announced in the issue, add an entry to `data/events.js` (one per date; required fields `title` + `date`). Skip any that are already listed.
4. **Generate the PDF** at `assets/newsletters/YYYY-MM-month.pdf` from the finished page so it matches the brand styling (headless Edge: `msedge --headless=new --no-pdf-header-footer --print-to-pdf="…\YYYY-MM-month.pdf" "file:///…/newsletter-YYYY-MM.html"`, using a temp `--user-data-dir` so it runs even if Edge is open). The newsletter print CSS outputs full colour.

> Tip: the `/new-newsletter` skill does all of the above (web page, author photos, archive entry, events, PDF, and the email teaser) in one go — start a new chat, type `/new-newsletter`, and paste the issue content.

**Author photo (sections written by a specific person):** show the writer as a circular photo beside the section title. Save the photo as `assets/people/firstname-lastname.jpg` (square crop ~600x600), then wrap the section number + heading in a `.section-head` row with a `.section-author` figure:
```html
<div class="section-head">
  <div class="section-head__text">
    <span class="section-number">01</span>
    <h2>Section title here</h2>
  </div>
  <figure class="section-author">
    <img class="section-author__photo" src="assets/people/jane-doe.jpg" alt="Jane Doe">
    <figcaption class="section-author__name">Jane Doe</figcaption>
  </figure>
</div>
```
If there's no photo yet, use the initials fallback instead of the `<img>`:
```html
<span class="section-author__photo section-author__photo--initials" style="background:#0076bf" aria-hidden="true">JD</span>
```
(Sections with no specific author — e.g. a letter from Kevin — just keep the plain `<span class="section-number">` + `<h2>` with no `.section-head` wrapper.)

### Email a newsletter (previews → link to the web version)
The web version is the full newsletter; the email shows a short excerpt of each article with a "Read more →" link, plus a closing button to the full issue. Email clients (especially Outlook) strip external CSS and JavaScript, so the email is a separate inline-styled file in `newsletter-email/`.
1. Copy `newsletter-email/_template.html` to `newsletter-email/<YYYY-MM>-email.html` (see `2026-05-email.html` as the worked example).
2. Replace the `{{PLACEHOLDERS}}`: issue tag, title, subtitle, date, a 2–3 sentence intro, the `{{ARTICLES}}` preview blocks (one per article — a 1–2 sentence excerpt + a "Read more →" link pointing at the section's anchor on the web page), and the **absolute** `WEB_URL` for the closing button. The header uses `logo-full.png` on white (not `logo-on-dark.png`). The list is managed elsewhere, so the footer has no mailing address or unsubscribe line — don't add them.
3. **Send from Outlook:** new email → **Insert ▸ Attach File ▸ pick the `.html` ▸ click the arrow next to Insert ▸ "Insert as Text"** (drops the rendered email into the body). Fallback: open the `.html` in Edge/Chrome, Ctrl+A, Ctrl+C, paste into a new message.
4. **Always send yourself a test first**, allow images, and click a "Read more" link and the closing button to confirm they work.

### Add staff photos
Save as `firstname-lastname.jpg` (e.g. `shannon-mccracken.jpg`) in `assets/people/`. The contact page already references those filenames.

## Google Analytics setup

1. Create a GA4 property in your Google Analytics account. Copy the Measurement ID (looks like `G-XXXXXXXXXX`).
2. Open `js/site.js`. Find the line:  
   `const GA_ID = 'G-XXXXXXXXXX';`  
   Replace `G-XXXXXXXXXX` with your real ID.
3. Analytics will only load for visitors who accept the cookie banner. IP anonymization is enabled by default.

## Forms

All four contact-page forms are currently placeholders — submitting shows an alert. When you're ready to wire them up to email, the cleanest options are:

- **Microsoft Forms** — embed an iframe (you're already on M365).
- **Formspree / Web3Forms / Getform** — paste an `action` URL into each `<form>` tag; submissions email a Hub inbox.

## Hosting

This is plain static HTML. It will run on:
- GitHub Pages (free, simple)
- Netlify or Cloudflare Pages (free tier, easier deploys + form handling)
- Your existing PATH web hosting if there's a folder you can drop files into

## Brand reference

Colors and typography pulled from the 2026 style guide. Defined as CSS variables at the top of `css/styles.css` so changes flow site-wide:

- `--hub-blue: #0076bf`
- `--spark-pink: #dc2657`
- `--path-navy: #0b3954`
- `--capacity-sage: #7cafae`
- Font: DM Sans (loaded from Google Fonts), Arial fallback
