---
name: new-newsletter
description: Publish a new The Hub @PATH newsletter issue. Builds the web version (docs/newsletter-YYYY-MM.html) with a circular author photo beside each authored section, adds the archive entry, posts any sessions/events announced in the issue to the Events page, generates the colour PDF, and produces the matching emailable teaser in newsletter-email/. Use when the user wants to add, publish, or set up a new newsletter issue, or drops in newsletter content for an issue.
---

# Publish a newsletter issue (web + email)

You are setting up a new issue of **The Hub @PATH** newsletter. One source of content becomes
**two outputs**: a full web page on the site, and a short emailable "teaser" that links to it.

The live site is the static `docs/` folder (GitHub Pages, domain `https://www.hub.pathemployment.com`).
There is **no backend** — everything is hand-authored static HTML. Do not add JavaScript, build
steps, or external services.

## Step 0 — Gather the issue content

Ask the user for whatever you don't already have (they may paste it, attach a file, or point to a draft):

- **Issue number** (e.g. `Issue 03`) and **month/year** → filename slug `YYYY-MM` (e.g. `2026-06`).
- **Title** and **subtitle/tagline**.
- **Publish date** (e.g. `Monday, June 8, 2026`) and an approximate **read time** (e.g. `4 min read`).
- **Sections**: for each, the heading, the **author's name** (if a specific person wrote it), and the body text. Note any **session/event cards** (dates, location, a register link) or **pull quotes** — every dated session also has to go on the Events page (Step 3).
- **Author photos**: for each named author, confirm a photo exists at `docs/assets/people/firstname-lastname.jpg` (square, ~600x600). If a photo is missing, ask the user for one, or use the initials fallback (below).
- **A one-sentence summary** for the archive listing.
- **PDF** (optional): if they have one, it goes in `docs/assets/newsletters/`.

## Step 1 — Build the web page

1. Copy the canonical example **`docs/newsletter-2026-05.html`** to **`docs/newsletter-YYYY-MM.html`**. It is the reference for structure (masthead, sections, session cards, pull quotes, closer, sidebar).
2. Update the `<title>`, `<meta name="description">`, masthead (`issue-tag`, `h1`, `subtitle`, meta line with author/date/read-time), and each `<section class="newsletter-section">`.
3. Update the "In this issue" table of contents (`.newsletter-toc ol`) and the section `id`s so the anchors match.
4. **Bump the stylesheet cache-buster** on the new page's `<link rel="stylesheet" href="css/styles.css?v=...">` to today's date (e.g. `?v=20260608`) so visitors get current CSS.

### Author photo beside a section title
For any section written by a specific person, wrap the section number + heading in a `.section-head`
row and add a `.section-author` figure. This renders a circular photo centred in the space beside the
title, with a small name beneath (the styles already live in `docs/css/styles.css`):

```html
<div class="section-head">
  <div class="section-head__text">
    <span class="section-number">01</span>
    <h2>Section heading here</h2>
  </div>
  <figure class="section-author">
    <img class="section-author__photo" src="assets/people/jane-doe.jpg" alt="Jane Doe">
    <figcaption class="section-author__name">Jane Doe</figcaption>
  </figure>
</div>
```

If there's no photo, use the initials fallback in place of the `<img>` (pick a brand colour:
`#0076bf` blue, `#0b3954` navy, `#dc2657` pink, `#7cafae` sage):

```html
<span class="section-author__photo section-author__photo--initials" style="background:#0076bf" aria-hidden="true">JD</span>
```

Sections with **no specific author** (e.g. a letter from Kevin) just keep the plain
`<span class="section-number">` + `<h2>` with no `.section-head` wrapper.

## Step 2 — Add the archive entry

Add a new object to the **top** of the array in **`docs/data/newsletters.js`** (`window.HUB_NEWSLETTERS`),
newest first. Match the existing shape exactly:

```js
{
  "title": "Full title here",
  "date": "YYYY-MM-DD",
  "summary": "One-sentence summary for the archive listing.",
  "page": "newsletter-YYYY-MM.html",
  "file": "assets/newsletters/YYYY-MM-month.pdf",   // omit or update if no PDF
  "author": { "name": "Kevin Westwood", "photo": "assets/people/kevin-westwood.jpg" }
}
```

The archive page and the "latest issue" redirect are driven entirely by this file.

## Step 3 — Post any events to the Events page

Newsletters almost always announce sessions (webinars, PD days). **Every dated session in the issue
must also be added to the Events page** — otherwise people who only check Events will miss them.

1. Scan the issue for session/event details — usually the `.session-card` blocks in the newsletter HTML (dates, times, location, register link) and any "register" / "join us" calls to action.
2. For **each date** of each session, add an object to **`docs/data/events.js`** (`window.HUB_EVENTS`). A session offered on two dates = **two entries**. Match the existing shape:

```js
{
  "title": "Session title (match the newsletter wording)",
  "date": "YYYY-MM-DD",
  "time": "1:00 PM",
  "location": "Virtual (Zoom)",
  "description": "1-3 sentences describing the session.",
  "image": "",
  "registerUrl": "contact.html",
  "featured": true,        // optional — only on the next upcoming flagship session
  "host": "Presenter / author name"
}
```

3. **Avoid duplicates:** before adding, check `events.js` for an entry with the same title + date. If it's already there (e.g. carried over from a previous issue), skip it. Don't delete old/past events — the Events page hides past dates automatically.
4. Only `title` and `date` (YYYY-MM-DD) are required; include `time`, `location`, `host`, and `registerUrl` whenever the newsletter provides them.
5. **Weekly/recurring sessions:** if a session repeats weekly (e.g. a drop-in every Wednesday until a set date), add ONE entry with a `"weeklyUntil": "YYYY-MM-DD"` field (the last occurrence's date) alongside the start `date`. The Events calendar then repeats it on every matching weekday automatically, and the list/popup show it once as a range ("Wednesdays, July 8 – August 26, 2026"). Do **not** create a separate entry per week.

## Step 4 — Generate the colour PDF

The "Download PDF" button and the archive `file` field expect a PDF at
`docs/assets/newsletters/YYYY-MM-month.pdf`. Generate it **from the finished web page** so it matches
the brand styling (the print CSS in `styles.css` already outputs full colour for `.newsletter-page`):

```powershell
$edge = @("C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe","C:\Program Files\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
$tmp = Join-Path $env:TEMP ("edgepdf_" + [System.Guid]::NewGuid().ToString("N"))
$pdf = (Resolve-Path "docs").Path + "\assets\newsletters\YYYY-MM-month.pdf"
$src = "file:///" + (((Resolve-Path "docs\newsletter-YYYY-MM.html").Path) -replace '\\','/' -replace ' ','%20')
& $edge --headless=new --disable-gpu --user-data-dir="$tmp" --no-pdf-header-footer --virtual-time-budget=10000 --print-to-pdf="$pdf" $src
```

The dedicated `--user-data-dir` forces a fresh Edge instance so the export runs even if a normal Edge
window is open (otherwise the file silently isn't written). Confirm the archive entry's `file` field
points to this same path.

## Step 5 — Build the email teaser

The email is a short branded teaser that links to the web version. Email clients (especially Outlook)
strip external CSS and JavaScript, so it is a separate inline-styled file.

1. Copy **`newsletter-email/_template.html`** to **`newsletter-email/YYYY-MM-email.html`** (see
   `newsletter-email/2026-05-email.html` as a worked example).
2. Replace every `{{PLACEHOLDER}}`:
   - `{{PREHEADER}}`, `{{ISSUE_TAG}}`, `{{TITLE}}`, `{{SUBTITLE}}`, `{{DATE}}`
   - `{{INTRO}}` — a 2–3 sentence plain-text intro
   - `{{ARTICLES}}` — one **preview block per article** (a 1–2 sentence excerpt + a "Read more →" link), so readers get a taste and click through. Copy the exact block from the example for each article; set each link to the absolute web URL **+ the section's anchor id** (e.g. `…/newsletter-YYYY-MM.html#ot-webinar`).
   - `{{WEB_URL}}` — the **absolute** URL to the new page (closing button), e.g.
     `https://www.hub.pathemployment.com/newsletter-YYYY-MM.html`
3. **All links and images must be absolute** (`https://www.hub.pathemployment.com/...`). The header uses `logo-full.png` on a **white** band (do not use `logo-on-dark.png` — its black tile clashes with a coloured background). Keep images to just the logo. No `<link>` stylesheets, no JavaScript, no inline section photos (email clients block images and Outlook squares off circular images). The footer has no mailing address and no unsubscribe line — the list is managed elsewhere; do not add them back.

### How the user sends it (tell them this)
Outlook → new email → **Insert ▸ Attach File ▸ pick the `.html` ▸ click the arrow next to Insert ▸
"Insert as Text"** (drops the rendered email into the body). Fallback: open the `.html` in Edge/Chrome,
Ctrl+A, Ctrl+C, paste into a new message. **Send yourself a test first**, allow images, and click a
"Read more" link and the closing button to confirm they work.

## Step 6 — Verify

Render the web page to confirm it looks right (headless Edge screenshot), then open it for the user:

```powershell
$edge = @("C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe","C:\Program Files\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
$out = Join-Path $PWD "newsletter-email\_preview.png"
$file = "file:///" + ((Resolve-Path "docs\newsletter-YYYY-MM.html").Path -replace '\\','/' -replace ' ','%20')
& $edge --headless --disable-gpu --hide-scrollbars --window-size=1000,1400 --screenshot="$out" $file 2>$null
```

Read the screenshot, confirm the author photos and layout look right, then delete the preview
(`Remove-Item newsletter-email\_preview.png`) and open the real file for the user
(`Start-Process` the `docs\newsletter-YYYY-MM.html` path). Also open `newsletter-email/YYYY-MM-email.html`
so they can see the teaser.

Check: no leftover `{{...}}` placeholders in the email; every email link/image is absolute; the new
page appears in the archive sidebar; author photos resolve; **each announced session now appears on
the Events page** (`events.html`) with no duplicates; and the **PDF was written** to
`docs/assets/newsletters/` and matches the issue.

## Notes
- Don't commit unless the user asks.
- Full reference docs live in `README.md` under "Add a newsletter" / "Email a newsletter".
- Keep the brand palette: navy `#0b3954`, hub-blue `#0076bf`, spark-pink `#dc2657`, sage `#7cafae`.
