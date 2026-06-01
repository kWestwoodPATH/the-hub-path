# Authoring Guide — Course Interactive Features

The shared scripts in this folder add four features to every course HTML page
that includes them:

- **Progress dashboard** (auto)
- **Mark-module-complete buttons** (auto)
- **Resumable position** (auto)
- **Branching scenarios** (you author the markup)
- **Reflection journals** (you author the markup)
- **Reset & export controls** (auto)

All learner data is stored in the browser's localStorage on the learner's
own device. Nothing is sent to any server. No analytics. No tracking.

## Setup (already done for the two existing courses)

In `<head>`:

```html
<meta name="course-id" content="interview-skills">
<meta name="course-title" content="Interview Skills">
<link rel="stylesheet" href="_shared/course-features.css?v=YYYYMMDD">
<script src="_shared/course-features.js?v=YYYYMMDD" defer></script>
```

The `course-id` must be unique per course (used as a localStorage namespace).

When adding a third course, copy this block and change the two `content`
values. That's it.

---

## 1. Reflection journals — copy/paste this anywhere in a module

```html
<div data-reflection="m4-disclosure-reflection"
     data-prompt="What's one client you've worked with where disclosure came up? Looking back, what would you do differently?">
</div>
```

That's the whole thing. The script will turn it into a styled prompt with a
textarea that auto-saves to localStorage on every keystroke.

**Naming convention:** `{module-id}-{short-slug}`. For example
`m4-disclosure-reflection`, `m7-anxiety-noticing`. The id is what shows up
when learners export their reflections — make it self-explanatory.

**Privacy line:** the component automatically renders "Saved on your
device only — never sent anywhere." Authors don't need to add this.

**Best placement:** at the end of a module's main content, just before the
"Mark module complete" button gets auto-injected.

---

## 2. Branching scenarios — copy/adapt this template

```html
<section class="tc-scenario" data-scenario="marcus-disclosure">
  <span class="tc-scenario__label">Scenario</span>
  <h3>The Reluctant Disclosure</h3>

  <div class="tc-scenario__prompt">
    <p>Marcus, 31, comes in to prep for a second-round interview tomorrow —
    warehouse coordinator at a logistics firm. He mentions he was diagnosed
    with epilepsy two years ago. He hasn't disclosed. He tells you:
    <em>"I shouldn't need to, right? It's none of their business."</em></p>
    <strong>What do you say?</strong>
  </div>

  <div class="tc-scenario__choices">
    <button data-choice="A">"You're right — you don't have to disclose."</button>
    <button data-choice="B">"You really should tell them."</button>
    <button data-choice="C">"What's your worry about disclosing?"</button>
    <button data-choice="D">"The early-morning drowsiness might be relevant though…"</button>
  </div>

  <div data-outcome="A">
    <p>Marcus relaxes, but leaves your office without learning that he
    <em>does</em> have decisions to make later — about conditional-offer
    disclosure timing, and the accommodation he could request for early-
    morning shifts.</p>
    <p><strong>What you missed:</strong> he didn't ask "do I have to?"
    He asked you to confirm his existing belief. You agreed without
    exploring what he actually needs.</p>
  </div>

  <div data-outcome="B">
    <p>Marcus goes quiet. <em>"I'll think about it."</em> He doesn't book a
    follow-up. Two weeks later you hear he took a different job without
    disclosing.</p>
    <p><strong>What you missed:</strong> you skipped past his autonomy.
    Even if disclosure is the right move, he needs to be the one who
    decides — and he needs information he doesn't have yet to decide well.</p>
  </div>

  <div data-outcome="C">
    <p>Marcus is quiet for a moment, then says: <em>"I was let go from a
    job two years ago after I had a seizure at work. They said it was
    'restructuring' but I know what it was. I don't trust them not to do
    it again."</em></p>
    <p><strong>Now you have something to work with.</strong> His real
    obstacle isn't the rule about disclosure — it's a prior injury. The
    conversation can now address <em>that</em> rather than the abstract
    question. ✓ Recommended opener.</p>
  </div>

  <div data-outcome="D">
    <p>Marcus's face changes. He hears you advocating for the employer's
    interest, not his. He gets cautious, gives shorter answers. You may
    still get there, but you've made the next 20 minutes harder.</p>
    <p><strong>What you missed:</strong> the safety angle is real <em>and</em>
    it's also exactly what employers misuse to discriminate. Leading with
    it puts you on the wrong side of the trust line.</p>
  </div>

  <div class="tc-scenario__debrief">
    <h4>Debrief</h4>
    <p>The recommended opener is <strong>C — a question that surfaces the
    worry</strong>. Not because B and D are wrong on substance, but because
    Marcus's barrier isn't information; it's experience. Until you know
    what happened the first time, you can't help him decide what to do
    this time.</p>
    <p>The three-prompt framework that follows assumes you've already gotten
    Marcus to tell you what C reveals. If you skip C, the framework lands
    on someone who doesn't trust you yet.</p>
  </div>
</section>
```

### Rules

- **`data-scenario`** is the unique id for this scenario (used for
  localStorage persistence). Use `kebab-case`.
- **`data-choice`** values must match `data-outcome` values one-to-one.
  Typically just `A`, `B`, `C`, `D`.
- The **debrief stays hidden** until the learner has explored at least two
  choices. The script auto-injects a hint ("Try at least two different
  responses to unlock the debrief.") and removes it when the gate is met.
- The script handles all interactivity. You only write markup.

### Authoring tips

- **3–4 choices** is the sweet spot. Two is shallow; five gets repetitive.
- **Every choice has consequences** — even the "good" one should reveal
  a complication or trade-off. If one choice is obviously right, the
  scenario is a quiz, not a decision-judgement exercise.
- **Name the missed thing.** Each `data-outcome` should end with
  "**What you missed:**" or equivalent. The learning is in what wasn't
  obvious about the choice.
- **Debrief teaches the framework.** Don't repeat the consequences — use
  the debrief to introduce the rule/heuristic the scenario was designed
  to teach.

---

## 3. Reset / Export controls

Already in the dashboard footer:

- **⤓ Export my reflections** — downloads a Markdown file of all the
  learner's reflections from this course.
- **Reset my progress** — wipes all localStorage data for this course
  after a confirm dialog. Useful for shared devices or if a learner wants
  a clean start.

---

## 4. Storage namespacing

All keys are prefixed `thehub-course:{course-id}:`. For example, with
`course-id="interview-skills"`:

```
thehub-course:interview-skills:completed         JSON array of module ids
thehub-course:interview-skills:position          last module in view (id)
thehub-course:interview-skills:reflection:<id>   one per reflection prompt
thehub-course:interview-skills:scenario:<id>     JSON array of explored choices
```

This means **two courses on the same domain don't cross-contaminate**.
Adding a third course with a new `course-id` is automatically isolated.

---

## 5. What's *not* tracked

Deliberately:

- **No completion times, no timestamps** beyond export "exported on X".
- **No engagement metrics** (scroll depth, time on page, click counts).
- **No identifiers** (no user id, device id, session id, fingerprint).
- **No network calls** of any kind from this script.

If you ever add analytics, it should be a separate decision — see the
research report's note on Plausible/Umami self-hosted as the
privacy-respecting options.

---

## 6. Testing the features locally

Open either course HTML file in a browser:

1. The dashboard should appear just before module `m0`, showing
   "0 of N modules complete · 0%".
2. Scroll partway down. Click **Mark module complete** on any module.
3. Reload the page. The dashboard should now show 1 of N complete, and
   a banner at the bottom should offer to jump you back to where you
   were reading.
4. Click **Reset my progress** — confirm dialog appears; page reloads
   with empty state.

If any of these fail, open the browser DevTools console for the
`[course-features]` warning, then check that the `<meta name="course-id">`
tag is present.
