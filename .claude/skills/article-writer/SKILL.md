---
name: article-writer
description: Use when you have a cluster plan (cluster-<slug>.data.js from pillar-cluster-planner) and want to write its articles. Run manually with a cluster file path and a count N — it picks the next N unwritten pages (pillar → article → Q&A), confirms with you, deeply researches and writes each in the house voice, wires internal links, publishes to WordPress as a draft, and marks each done. Run repeatedly to work through the cluster in batches.
---

# Article Writer

## Overview

Turn unwritten cluster pages into published, SEO-sound, human-readable WordPress drafts —
in controlled batches. Input is a `cluster-<slug>.data.js` from `pillar-cluster-planner`
(the build spec + tracker) and a count N. Output is N drafts in WordPress, internal links
wired, and the data file's `done` flags flipped.

This skill is **workflow only — it holds no SEO rules of its own.**

**REQUIRED BACKGROUND:** Read the `seo-core` skill (`.claude/skills/seo-core/SKILL.md`),
the canonical SEO brain. It governs everything this skill produces:
- **§2** — content structure & internal-link rules (3-direction model, published-only,
  anchor text)
- **§3** — on-page & E-E-A-T (titles/meta/headings/schema, Trust, author byline, FAQ note)
- **§4** — writing quality, readability, voice, anti-AI-slop, and the two-gate
  title/heading check
- **§5** — the pre-publish checklist (QC gate) this skill runs before publishing

## When to Use
- "Write 4 articles from `docs/seo/clusters/cluster-start-running.data.js`"
- After `pillar-cluster-planner` has produced a cluster data file
- Repeatedly, in batches, to work through a large cluster over time

## Step 0 — Inputs & preflight
Require from the user: **cluster file path** + **count N**. Then:
- Load the data file with the ledger helper: `node docs/seo/ledger.mjs stats` (totals +
  latest scheduled date) — it auto-locates the cluster file; pass a path to target a
  different one.
- Check WordPress creds exist in `.env.local`: `WP_BASE_URL`, `WP_USER`, `WP_APP_PASSWORD`,
  `WP_AUTHOR`. **If any are missing, stop** and tell the user exactly what to add (create
  a WP application password under Users → Profile). Don't attempt to publish without them.

## Step 1 — Select the next N (don't write yet)
From pages with `done:false`, pick the next **N** by priority **pillar → article → qa**
(file order within each type). The pillar gets written first so spokes have a hub to link
up to. Use `node docs/seo/ledger.mjs open N` — it applies the priority order for you.

## Step 2 — Confirm with the user
Show the picked list — `title · type · slug · keyword` — and **wait for the user's go.**
The user may swap any item out before writing. Never start writing unconfirmed.
**Decide draft-vs-schedule HERE, at confirm time, so the batch publishes exactly once:**
if the repo convention is scheduled posts (check the ledger's `created` pattern), propose
the schedule in the confirmation — e.g. "2/day at 09:00, starting <day after the ledger's
max `created` date>". Do NOT publish plain drafts first and re-publish to schedule later —
that's a whole redundant publish pass (and re-uploads heroes).

## Execution model — parallel write, serial cleanup
The batch runs in **two phases** so pages don't contend on shared state (the cluster
`.data.js` and the pillar post):

- **Phase A — parallel (Steps 3–4):** the batch is researched, written, QC-gated, and
  published **concurrently**. Each page writes only its **own** content file +
  `<slug>.spec.json`, publishes itself, and **returns** a result record (see below). No
  Phase-A worker may edit the cluster `.data.js` or any other page's post — those are shared
  and clobber under parallelism.

  **Dispatch granularity — group pages into SETS, one subagent per set (NOT one per page).**
  Each subagent loads `article-writer` + `seo-core` once and amortizes that fixed cost across
  its whole set, so grouping is a big token win with no speed cost:
  - **Set size ≈ 3–5 pages** per subagent (default **4**). One-page-per-agent is the
    token-worst case — it reloads both skills for every single page (measured ~3× the tokens
    of a 4-page set). Avoid it unless the batch is tiny (≤2 pages → just one set).
  - **Run the sets concurrently**, capped ~4–6 subagents in flight (≈ up to ~16 pages'
    worth). A 20-page batch = ~5 sets of 4, all dispatched at once → wall-clock ≈ one set
    (~13–16 min), tokens ≈ amortized per-page rate.
  - Within a set the subagent writes its pages **sequentially** (its own context, no
    contention) and returns **one record per page**.
  - **Featured images: plan heroes centrally — one Pexels search per topic.** At Phase 0 the
    orchestrator runs ONE Pexels search per topic (not per page), picks exact photos, and hands
    each page a deterministic `photoId` in its dispatch brief; specs use
    `featuredImage:{source:"pexels", photoId:<id>, alt}`. This removes per-page searches and
    rate-limit risk entirely (previously verified: 3-of-4 heroes failed under parallel
    fetches). If heroes still come back unset, retry them **one at a time** in Phase B.
  - **Shared lookups: one external verification per SET, not per page.** QA pages each need an
    authoritative external link, but the pool is small and reusable (PubMed, NHS, CDC,
    parkrun.org.uk…). The subagent verifies/sources each distinct domain ONCE for its whole
    set and reuses the URLs across its pages — never one fetch per page.
- **Phase B — cleanup (Steps 5–6, orchestrator only):** once all sets finish, the
  orchestrator does the shared-state writes. **Only the pillar update and the `.data.js`
  ledger are strictly serial** (single writer each). The **sibling cross-links edit distinct
  target posts, so run them in parallel sets** (Step 5) — this keeps Phase B off the critical
  path. Also retry any failed featured images serially. Do the pillar downlinks + the
  single-pass ledger edits once. **Hero failures are tracked in
  `docs/seo/assets/heroes/pending-reupload.json`** — read it at Phase B, retry its items
  one at a time, and keep the list current (add failures, remove successful re-sets). Phase B's serial core is fixed overhead, so it amortizes
  best over a **larger** Phase A — batch generously rather than many tiny batches each with a
  Phase B tail.

**Each Phase-A page returns:** `{ slug, type, postId, status, publishAt, wordCount,
qcResult, components:[...], linksPlacedUp:[...] (targets published BEFORE the wave it linked
to), wantsDownlinkFrom:[pillar + sibling slugs it *would* link to but that were unpublished
at write time], featuredImage }`. Phase B consumes these records — the subagents never touch
the file.

Wall-clock ≈ the slowest single page, not the sum. Ordering (pillar→article→qa) still
decides Phase-A dispatch priority so a same-batch pillar publishes first, but spokes no
longer wait on each other.

## Step 3 — Per page: research, then write (Phase A, parallel)
Each page is handled independently and concurrently. Within a page, do these in order:

### 3a. Deep research (per article)
Research the page's **exact keyword**: read top-ranking pages, note what they cover, the
format readers expect, and gaps you can beat. Capture concrete specifics you can write
with first-hand authority (E-E-A-T Experience, seo-core §3).

**QA pages — skip the deep SERP research (do a light check only).** A `qa` page is short
(~440 words) and its core answer is already given in the brief's `answer` field. Don't run
the full top-ranking-pages sweep for it. Instead: (1) trust the brief's `answer` as the
BLUF, (2) do at most **one quick lookup** only if a specific figure/fact needs verifying,
(3) reuse facts from the already-published pillar/siblings you're linking to. Reserve the
full deep-research pass for `article` and `pillar` pages, where depth actually moves
rankings. This cuts fetch time/tokens on roughly half a typical batch with no quality loss.

**Token-efficient fetching (same depth, less context):** pull sources through whatever
fetch/index tools the current environment offers (e.g. a fetch-and-index helper), not raw
web-search dumps — index the top-ranking pages, then query the index for the specifics you
need (coverage, formats, gaps, figures). Only the relevant snippets enter context. Research the
same sources as deeply as before — this changes *how* they're read, not *how much*.

### 3b. Gather context from the data file
Pull the page's own brief (`h1`, `h2s`, `secondary`, `intent`, and `answer` for `qa`)
**plus related pages already in the file** — the pillar (`linksUp`), its `siblings`, and
same-`facet` pages — so links and framing are right. Prefer the ledger helper:
`node docs/seo/ledger.mjs brief <slug> [slug…]` prints the page object(s) plus
`_publishedTargets` (all `done:true` slugs) and `_sameFacetDone` in one call.

**Don't parse the whole file into context.** The cluster `.data.js` can hold 100+ pages.
Extract only the current page's object + its `linksUp`/`siblings`/same-`facet` entries + the
list of `done:true` slugs (valid link targets) — via the `brief` command above or a targeted
read — instead of loading all pages. (Step 6's `done:true` Edit still targets just
this page's object.) If the orchestrator already handed you the brief + published-sibling
list inline, use that and skip re-reading the file for context entirely.

### 3c. Title/heading two-gate check (seo-core §4)
Run every title and H2 through both gates (SEO + Human); rewrite until both pass. Only
then write the body.

### 3c2. Pick the archetype + component palette (seo-core §4) — **anti-sameness step**
Before writing, choose the **article archetype** (Practical Guide / Story-led / Myth-buster /
Comparison / Q&A — seo-core §4) that fits this page's intent. Then plan a **3–5 component
budget** and a **tone palette (≤2–3 tones)** that fit the archetype. Pick components
**fit-first** (seo-core §4); use the last article's recorded `components` only as a tiebreaker
to avoid lazy repetition (vary the opening hook and dominant tone too). Note the chosen
archetype + components in the Step 7
report. This is what stops the cluster reading as copy-paste.

### 3d. Write the body (seo-core §3 + §4)
**Wrap the whole body in `<div class="s5k-article">` and use the seo-core §4 visual
component classes** — pick the **3–5** that fit the chosen archetype (the full library is in
seo-core §4: core, data/visual, narrative/structure), apply tone modifiers for harmony, and
**never inline styles**. Include **one coach's-experience observation/anecdote** (seo-core §4
voice — realistic but no fabricated facts), and **vary the opening hook** (not the
"[Keyword] is mostly about X" formula). Styling lives once in
`docs/seo/styles/s5k-article.css`, installed in WP → Appearance → Customize → Additional
CSS (one-time). **If you used any component/tone class new to the stylesheet, remind the
user to re-paste the CSS** before publishing, or those parts render unstyled.
House voice — **casual and very simple, easy to understand** (site requirement — Pass
Group): plain everyday words, short sentences, every technical term explained in the same
sentence it first appears, written for a founder with no technical team. Apply §4
readability (BLUF, short paragraphs, 15–20-word sentences, bullets, bold key terms, active
voice, anti-AI-slop) and §3 on-page (title ≤60, one H1, H2s from the brief/PAA,
natural keyword/semantic use). Word counts from the page `type` (pillar hub ~2,000;
article ~1,000–1,500; qa ~300–500 with the answer in the first ~50 words).

**Meta + focus keyword — get it right first draft (kills Rank Math re-lint churn):** write
the meta description **≤155 chars** (not 156–160 — the lint gate rejects overruns), and use
the **exact focus keyword at least twice** — once in the **first paragraph** and again
naturally in the body — plus in the title and meta. Under-using the keyword is the most
common auto re-lint; front-load it.

**Aim comfortably inside the lint band on the first draft — don't skate the edges** (the
lint gate is Article `900–2600`, FAQPage `200–700`). **Draft to the middle of the band, not
the floor** — a too-short first draft forces an expand→re-lint loop that wastes a whole
retry. First-draft aim points: **article ~1,200** (band 1,050–1,400; never draft <1,050 or
>2,550), **qa ~440** (band 380–500; never <250 or >680), **pillar ~2,200** (never >2,550).
If a draft lands outside, fix it before publishing — but drafting to the aim point up front
avoids the retry entirely.

### 3e. Visuals — break the prose walls (seo-core §4 cadence)
Aim for **one visual break every ~300 words**. Free sourcing, in priority:
1. **CSS components** — the diagram default. Use `s5k-intervals` (run-walk strip),
   `s5k-progress` (week ramp bars), `s5k-timeline`, `s5k-numberline`/`s5k-gauge` (key
   figures), `s5k-comparison`/`s5k-dodont` (side-by-sides). **NEVER inline `<svg>`** —
   WordPress KSES strips it (publisher lint fails on `<svg`); see seo-core §4.
2. **App screenshots** where the app is referenced — strongest E-E-A-T (upload to WP media,
   reference the URL, keyword-aware `alt`).
3. **Real photos** via `s5k-figure` + `<img>` (featured image below, or in-body hotlink).
**Featured image (every post):** add `featuredImage:{source:"pexels", query:"...", alt:"..."}`
to the spec — the publisher fetches from Pexels, uploads, and sets it (needs
`PEXELS_API_KEY` in `.env.local`). Or `{source:"file", path, alt}` for an app screenshot.
Respect moderation — ≤2 heavy callouts, never decorate every paragraph (seo-core §4).
Prefer a deterministic `featuredImage:{source:"pexels", photoId:<id>, alt}` (pick the exact
photo) so the saved hero matches any inline hero you embed; `query` is the fuzzy fallback.

**Featured-image upload (works via multipart):** the publisher sets featured images over
REST using a **`multipart/form-data`** upload. (The host's **Caddy WAF blocks raw
`image/jpeg` bodies** with a 403 — verified 2026-06-29 — but multipart form uploads pass
fine. Always upload multipart, never a raw binary body.) It also mirrors each hero to
`docs/seo/assets/heroes/<slug>.jpg` + logs it in `manifest.json` (slug, postId, alt,
photographer, caption) as a backup / for manual re-set. If an upload ever fails, the
publisher warns and continues (post still publishes); re-set the image from the manifest.

### 3f. Internal links — published-only, at write time (seo-core §2)
- From this page, link **up** to the pillar and **sideways** to 1–3 genuinely related
  siblings — **only targets already `done:true` BEFORE this wave started** (no dead links,
  and no linking to same-batch pages that publish concurrently — their status is unknown to
  you). Descriptive, varied anchor text; important links high on the page; ~2–5 per 1,500
  words. Record these in `linksPlacedUp`.
- Use the full canonical link form `<blogBase>/<slug>/` (from `docs/seo/site-config.json`; StepTo5K: `https://stepto5k.com/blog/<slug>/`, trailing slash) — never root-relative `/slug` or bare-domain.
- For any relevant target that is **not yet published** (including same-batch siblings and
  the pillar if it's in this batch), **do not link it and do not edit it** — instead add it
  to `wantsDownlinkFrom` in your returned record. Phase B wires all of these centrally. This
  is what keeps the parallel wave conflict-free.

### 3g. Pre-publish QC gate (seo-core §5)
Run the finished draft through the **seo-core §5 checklist**. Tag every item pass/fail.
**Any fail = rewrite and re-check; do not advance to Step 4 until the page passes in full.**
Carry the pass/fail result into the Step 7 report (fails cite the §ref and what was fixed).

## Step 4 — Publish to WordPress (draft, or scheduled)
**Always publish through the canonical script — do NOT hand-write the publish call.** It
enforces the seo-core invariants deterministically (so they stay consistent every run) and
sets everything correctly:

```
node docs/seo/publish-article.mjs <spec.json>
```

Write a `<slug>.spec.json` next to the content file (both in `docs/seo/pages/<cluster>/`):
`{ slug, title, seoTitle, metaDescription, focusKeyword, contentFile, category:{name,slug},
   tags:[{name,slug}], schema:"Article"|"FAQPage", publishAt?:"<local ISO>", postId?:<id for updates> }`.

**Draft vs scheduled:** omit `publishAt` → the post is a plain **draft** (default; the user
reviews then publishes). When the user asks to **"schedule" / "scheduled"**, they mean
**WordPress's native scheduler** — set **`publishAt`** to a local ISO datetime (e.g.
`"2026-07-16T09:00:00"`) and the publisher sets the post to `status:future`; WordPress flips
it live at that time. "Scheduled" NEVER means a Claude cron/loop — don't ask which approach.
For a per-day batch, give each set (1 article + 1 QA) the same `publishAt`, +1 day per set,
and set each page's data-file `created` to that same `publishAt` date (Step 6). The draft-vs-
schedule choice was made at Step 2 — publish the batch ONCE in its final form; don't draft
first and re-publish to schedule later.

**Rescheduling an already-published post (schedule-only change):** add/update `publishAt` in
the spec via `node docs/seo/ledger.mjs schedule <slug> <ISO>` and re-run the publisher. Be
aware a full publisher re-run re-uploads the hero (duplicate media entry); that's acceptable
for occasional fixes, but never re-run a whole batch just to change dates.

**Continue the existing cadence — never schedule into the past or onto taken dates.** When
scheduling a batch (or the repo's convention is scheduled posts), find the latest date already
in the pipeline: the **max `created` date in the cluster `.data.js`** (spot-check WP if unsure —
latest `future`/`publish` post). `ledger.mjs stats` prints both the latest date and the next
free day. Start the batch the **next day** after that date, NOT from
today; give each set its own day, +1 day per set, at 09:00 local (repo convention). This keeps
the daily drip unbroken and avoids colliding with dates that already have posts queued.

**Tagging (seo-core §2 — let the publisher do it):** set a top-level **`"facet"`** in the spec
(the page's raw cluster facet, e.g. `"run-walk"`, `"breathing"`) and keep `tags` minimal —
just `[{name:"Beginner",slug:"beginner"}]`. The publisher auto-adds the **facet tag** (the
topical relator, via the `facetTags` map in site-config) and, for `schema:"FAQPage"`, the **`quick-answers`**
tag. Result: articles → `[Beginner, <facet>]`; qa → `[Beginner, <facet>, Quick Answers]` (≤4).
This is what powers "related QAs/articles for a post" = same facet tag + `quick-answers`.

The script:
- runs a **lint gate** (title/meta length, focus-keyword placement, `s5k-article` wrapper,
  **≥3 distinct `s5k-` visual components** excluding the `s5k-article` wrapper, external link,
  word count) — **refuses to publish on any fail**, so
  the §5 checklist's `auto` items can't be skipped;
- creates/updates the post — **`status:"draft"`** by default, or **`status:"future"`** (WordPress
  scheduled) when the spec has `publishAt`; resolves/creates category + tags;
- injects `Article`/`FAQPage` schema + the site-config author byline;
- sets **Rank Math meta** via `rankmath/v1/updateMeta` (the standard `/wp/v2` `meta` field
  drops these keys; without this the score sits ~13/100 — see seo-core §3);
- prints the draft **post ID + edit link**.

If the lint gate fails, fix the content per the cited § and re-run — never bypass it.

## Step 5 — Reverse-link + cross-link (Phase B — orchestrator only)
Run this **once, after the whole parallel wave completes**, from the orchestrator — never
from the per-page subagents.

**What is actually serial vs parallel:** the only true contention points are the **pillar
post** and the **`.data.js` ledger** (many pages write to each → must be one writer). The
**sibling cross-links edit DISTINCT target files** (each `<slug>.html` + its own post), so
they are **safe to run in parallel** — group them into subagent sets the same way Phase A
does (each target post edited by exactly one worker, re-published once). This roughly halves
Phase B wall-clock vs doing all re-publishes one-by-one.

Using the returned records:
- **One pillar update (SERIAL, orchestrator):** collect every page's `wantsDownlinkFrom`
  entry that names the pillar and add all those downlinks (descriptive anchors) in a
  **single** pillar edit + re-publish. Not one edit per page. See the pillar-saturation rule
  below.
- **Intra-batch sibling cross-links (PARALLELIZABLE):** for each `wantsDownlinkFrom` naming a
  same-batch page (now published), add the downlink into that target. **Batch all edits for a
  given target post, then re-publish it once** — different target posts run concurrently.
- **Already-published outside siblings:** add downlinks into relevant done pages the same way.

**Pillar saturation — don't cram + trim.** As the cluster grows the pillar can't hold a link
to every spoke. Keep the pillar's downlinks in a **dedicated hub/related-links section** (an
allowed `s5k-` list component) and add new spokes there — **never trim or compact existing
pillar prose to make room.** If that section would push the pillar past the lint cap, link
only the most relevant new spokes from the pillar and leave the rest to sibling/facet
cross-links; note which were left off.

This is the third link direction and the "link new pages in immediately" rule (seo-core §2);
parallelism just moves the sibling pass off the critical path.

## Step 6 — Mark done (Phase B, serial — one pass, orchestrator only)
After the wave, write **all** the batch's ledger updates to the `.data.js` in a **single
edit pass** from the returned records — subagents must not have touched the file. Use the
ledger helper, one command per page (it edits only that page's `done:false` block and
verifies the file still parses):

    node docs/seo/ledger.mjs done <slug> --created <date> --components a,b,c --links /x,/y [--deferred /z]

For each
published page set `done:true` and add a **`"created": "YYYY-MM-DD"`** field next to the
slug (viewer show/sort). Use the **scheduled publish date** (the spec's `publishAt` date)
when scheduled; fall back to today's date only for plain (un-scheduled) drafts. On the same
page object append what was actually built:
- **`components: [...]`** — the `s5k-` component classes actually used in the article (exclude
  the `s5k-article` wrapper).
- **`linksPlaced: [...]`** — internal sibling/pillar slugs actually wired in — both the
  page's own write-time up-links (`linksPlacedUp`) and the Phase-B cross-links added into it.
- **`linksDeferred: [...]`** — planned internal slugs still unpublished **after** Phase B
  (i.e. targets outside this batch that don't exist yet) — reverse-link fodder for a future
  run. Same-batch links resolved in Phase B are NOT deferred.

Don't touch other fields.

## Step 7 — Report
Per run, report:
- pages drafted, each with its WP **draft edit link / post ID**
- **QC gate result** per page (seo-core §5): passed, or any fails + what was rewritten
- reverse-links added to the pillar/siblings
- links **deferred** (target not yet published)
- research notes / any gaps or thin spots worth a later pass

## Quick Reference
```
cluster path + N → load + cred preflight → pick next N (pillar→article→qa) → CONFIRM
PHASE A (parallel, one subagent per SET of ~3–5 pages, cap ~4–6 sets in flight):
  research (fetch-and-index) → context (own brief + published siblings only)
  → two-gate titles → write (seo-core §3/§4) → link up to PRE-wave PUBLISHED only
  → QC gate (seo-core §5) → publish WP → RETURN record (postId, wantsDownlinkFrom, ledger)
PHASE B (orchestrator, once):
  SERIAL: one pillar update (downlinks in a hub section, never trim prose)
  PARALLEL: intra-batch sibling cross-links (distinct target posts, one re-publish each)
  → single-pass .data.js done:true + created + components/linksPlaced/linksDeferred
  → report (links + deferred)
```

## Common Mistakes
| Mistake | Fix |
|---------|-----|
| Writing before confirming the picked list | Always show the N and wait for go (Step 2) |
| Linking to unpublished pages | Link only `done:true` targets; log the rest (seo-core §2) |
| Forgetting to reverse-link the pillar | Step 5 (Phase B) — one pillar update links down to every new page |
| Parallel subagents editing the cluster file or pillar | Forbidden — they clobber. Only the pillar + `.data.js` are serial; subagents return records, orchestrator does those two once in Phase B |
| Doing all Phase-B sibling re-publishes one-by-one | Sibling cross-links edit DISTINCT posts — run them in parallel sets (Step 5); only pillar + ledger are serial |
| Trimming pillar prose to fit new downlinks | Keep downlinks in a dedicated hub section; never compact existing content. If over the cap, link only the top spokes and note the rest (Step 5) |
| Draft too short → expand → re-lint | Draft to the aim point (article ~1,200, qa ~440), not the floor (Step 3d) |
| Meta >155 / focus keyword used once | Draft meta ≤155 and place the exact keyword twice, first in para 1 (Step 3d) — avoids Rank Math re-lint |
| Same-batch pages linking to each other at write time | Can't — concurrent status unknown. Put them in `wantsDownlinkFrom`; Phase B wires them |
| Running the batch serially day-by-day | Dispatch Phase A sets concurrently; wall-clock ≈ slowest set, not the sum |
| One subagent per page | Wastes ~3× tokens — each reloads both skills. Group ~3–5 pages per subagent so skill-load amortizes |
| Many tiny batches, each with a Phase B | Phase B is fixed overhead; batch generously so it amortizes |
| Parallel Pexels image fetches | Rate-limited (heroes fail). Sets serialize their own fetches; retry any unset heroes one-at-a-time in Phase B |
| Publishing live | Default `status: "draft"`; only go live via WordPress schedule (`publishAt` → `status:"future"`) when the user says "schedule" |
| Scheduling a batch from today's date | Read the max `created` date in the ledger and start the batch the NEXT day, +1 day per set — continue the cadence, don't reset it (Step 4) |
| Plain-drafting a batch when the repo's convention is scheduled posts | Check the ledger's `created` pattern first; if prior pages are scheduled, schedule the new batch too, continuing after the latest date (Step 4) |
| Reading "scheduled" as a Claude cron/loop | "Scheduled" = WordPress native scheduler (`publishAt` → `status:"future"`); never a Claude-side timer |
| No author byline | Set `WP_AUTHOR` — visible author is an E-E-A-T Trust signal (§3) |
| Restating SEO rules in this skill | Rules live in `seo-core`; this skill only references them |
| AI-slop prose / generic advice | Apply seo-core §4 (BLUF, specifics, anti-slop, voice) |
| Full SERP research on a QA page | Skip it — trust the brief's `answer`, do one quick check only; deep research is for articles/pillars (Step 3a) |
| Skipping the two-gate title check | Every title + H2 passes both gates before writing (§4) |
| Publishing a draft that fails QC | Run seo-core §5 first; any fail = rewrite before Step 4 |
| Expecting FAQ rich-result panels | Deprecated May 2026; keep `FAQPage` schema for AI Overviews only (§3) |
