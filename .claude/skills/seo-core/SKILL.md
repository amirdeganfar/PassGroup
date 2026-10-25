---
name: seo-core
description: The canonical SEO brain — the single source of SEO truth (keyword/SERP research, content structure & linking, on-page & E-E-A-T, writing quality & intent). Every other SEO skill (find-content-pillars, pillar-cluster-planner, article-writer) MUST read this as required background so all SEO work stays consistent. Invoke directly to learn the rules, or as background before any SEO task.
---

# SEO Core (the SEO brain)

**This is the single source of SEO truth.** Every SEO skill cites it as required
background; update it here and all skills inherit. It is **declarative** — it states
*what is true*. The consuming skills hold *what to do* (their workflow).

It is principle-dense on purpose: rules and heuristics, not a tutorial. Read the section
you need.

Consumers today: `find-content-pillars` (uses §1), `pillar-cluster-planner` (§1–§2),
`article-writer` (§2–§5).

**Page-type names** (used across all skills and the cluster data schema): `pillar`,
`article`, `qa` (the short, single-question micro-page).

---

## §1 — Keyword & SERP research

Estimate-only — **no paid keyword tools** (Ahrefs/Semrush/Keyword Planner). All
volume/difficulty/competitiveness labels are *reasoned from free SERP surfaces, not
measured*. Always say so.

### Core principle
A new/low-authority site wins on **long-tail and pain-point intent first, head terms
last.** Lead with what you can actually rank for.

### Estimate-only data sources (free SERP surfaces)

| Source | What it gives |
|--------|---------------|
| Google/Bing autocomplete (seed + a–z) | real phrasings, long-tail, branch size |
| "People Also Ask" boxes | question intent → Q&A pages / H2s |
| "Related searches" (SERP footer) | adjacent topics, cluster edges |
| Reddit/forums/Quora ranking page-1 | **weak-competition gap = easy win** |
| Top-10 SERP inspection | difficulty / competitiveness signal |
| Competitor sitemaps / blog indexes | proven topics to counter |

### Difficulty / competitiveness heuristic (no KD tool)
- **EASY:** forums/Reddit/Quora/thin blogs rank top-10, no big brands
- **MEDIUM:** niche blogs + one authority site
- **HARD:** NHS/Healthline/Wikipedia/category leaders own the top 10 → defer

### Volume / traffic-potential heuristic
Estimate Low/Med/High from autocomplete prominence + breadth of related searches +
number of distinct sub-questions. More branches = more traffic potential. Always label
as estimate.

### Intent classification
`informational` / `commercial` / `transactional` / `navigational`. Match content type
to intent.

### Hardening with Search Console (when data exists)
Once the site has real GSC data (`docs/seo/gsc-queries.csv`: Top queries, Clicks,
Impressions, CTR, Position), replace estimates:

| GSC signal | Replaces | Rule |
|------------|----------|------|
| Position | difficulty | pos ≤10 = easy, 11–20 = med (page-2 quick-win), >20 = hard |
| Impressions | volume | high impr = high demand regardless of clicks |
| Position + Impressions | priority | high impr + bad position = biggest opportunity |

Re-sort by `impressions × intent_weight ÷ difficulty`; tag each item
`source: gsc|estimate`. Re-run monthly once data accrues.

### Always report gaps
End every run stating what estimate-only could NOT provide (real volume, KD, CPC, the
site's own rankings/backlinks) and that numbers are SERP-reasoned estimates.

### AI surfaces (AI Overviews / AI Mode) — 2026
Google's generative AI features are grounded in core Search ranking (RAG) and expand
queries via **fan-out** (concurrent related queries) — so question-cluster content built
from real long-tail research (this file §1) is exactly what AI surfaces retrieve. Rules:
- **Non-commodity content wins retrieval** — unique POV, first-hand experience (§3/§4);
  summaries of what everyone already said don't stand out to AI systems.
- **No AI-specific tactics needed:** llms.txt files, "chunking" content into small pieces,
  and rewriting copy "for AI" do nothing for Google Search — ignore them (Google 2026).
- **Anti-spam caution:** mass-creating pages for every fan-out query variant *without added
  value* = scaled content abuse (§4 spam). Every `qa` page must answer a genuinely distinct
  question with substantive value — never thin variations to cover query space.

---

## §2 — Content structure & linking

### Pillar / cluster model
A **pillar** is a broad hub page; **spokes** are narrower pages that all link to it. The
pillar must be **winnable (MED, not HARD)** — you can't be the hub of a topic you can't
rank for. A real cluster is large (typically 50–100+ pages), not 20.

### Three page types

| Type | Length | Targets | Purpose |
|------|--------|---------|---------|
| `pillar` | ~2,000w | the broad MED keyword | comprehensive hub; links to every page |
| `article` | ~1,000–1,500w | one pain-point/how-to long-tail | substantial spoke |
| `qa` | ~300–500w | **one** user question (PAA) | direct answer in first ~50 words, snippet-optimized |

### Link graph — 3-direction model [S-link]
- every spoke/`qa` links **up** to the pillar (early in the page)
- pillar links **down** to every spoke/`qa`
- articles link **sideways** to 1–3 *genuinely related* siblings (not all-to-all — that
  dilutes the cluster). Only link where a reader would naturally want both.

### Internal-link hard rules [S-link]
- **Don't link to unpublished pages** (dead links = crawl waste). Link a new page in
  *immediately* when it publishes; then update the pillar/siblings to link back to it.
- **No orphans** — every page needs ≥1 inbound internal link.
- **Link format:** internal links use the full canonical `<blogBase>/<slug>/` form defined in
  `docs/seo/site-config.json` (StepTo5K: `https://stepto5k.com/blog/<slug>/`, site lives under
  `/blog`), always a trailing slash — never root-relative `/slug` or bare-domain.
- ~**2–5 internal links per 1,500 words**; no magic number — relevance over count.
- Put important links **high on the page** (top ~30%).
- **Descriptive, varied anchor text** — never "click here"; avoid repeated exact-match
  (over-optimization). Anchor must fit both the source and target page. [S-google-links]

### External-link rule [S-eeat]
- Link out to **≥1 authoritative source** per article — it's an E-E-A-T Authoritativeness
  signal and a Rank Math check. Cite where a claim deserves backing (a stat, a method, a
  health caveat).
- **Prefer non-competitor sources:** government/health bodies (.gov, NHS, CDC, WHO),
  academic/research (PubMed, journals), standards bodies, Wikipedia. **Avoid linking to
  direct competitors** — rival running blogs, coaching sites, or running-app makers — we
  don't send our readers (or link equity) to businesses we compete with.
- Open external links in a new tab where it helps retention; descriptive anchor, never
  bare URLs. 1–2 per article is plenty — relevance over count.

### Page hard rules
- **One keyword per page** — never two pages on the same query (**cannibalization**).
- Every page gets a real **kebab-case slug** (short, hyphenated, keyword near front).
- Distinct PAA questions become their own `qa` page, not just H2s.
- Snippet target: a `qa` page answers the question in the **first ~50 words**.

### WordPress taxonomy (category + tags)
- **Category = the pillar.** One category for the whole cluster (set once); one primary
  category per post.
- **Tags** = per page, from the post's **facet** + 1–2 shared entities (e.g. `beginner`,
  `injury-prevention`, `treadmill`). Reuse facets as the tag vocabulary so every tag has a
  healthy archive.
- Rules: never use the same term as both a category and a tag (duplicate archives); a tag
  must cover **≥3 posts** (no orphan tag pages); **2–4 tags per post**.
- **Every page carries its `facet` as a tag — the topical relator.** This is what makes
  "related QAs/articles for this post" queryable: pages on the same topic share a facet tag.
  The raw cluster facet maps to a clean WP tag slug (e.g. `injuries/aches`→`injuries`,
  `gear/shoes/clothing`→`gear`, `pace/speed`→`pace`); the canonical map lives in
  `docs/seo/site-config.json` (`facetTags`), so the publisher adds the facet tag
  deterministically from `spec.facet` — the spec only needs `facet` + a `Beginner` entity tag.
  **Related-questions block for a post** = query posts sharing that post's **facet tag** AND
  the `quick-answers` tag (`?tags=<facetId>,<quickAnswersId>`). Facet archives clear the
  ≥3-posts rule; if a utility facet archive reads thin, `noindex,follow` it too.
- **`qa` pages also carry a shared `quick-answers` tag** (in addition to facet/entity tags,
  staying ≤4 total). It's the only WP-queryable marker that a page is a QA micro-page —
  `type`/`facet` live only in the cluster data and `FAQPage` schema is in-content JSON-LD,
  neither queryable. This tag powers surfacing QA pages anywhere (REST `?tags=`, the
  `/tag/quick-answers/` archive, a theme FAQ block). **Set its tag archive to
  `noindex,follow`** in Rank Math (admin, one-time) — it's a cross-topic utility tag, so the
  archive is thin and shouldn't be indexed; the QA pages themselves stay indexed.

---

## §3 — On-page & E-E-A-T

### On-page essentials [S-title, S-headings, S-links]

| Element | Rule |
|---------|------|
| Title tag | ≤60 chars, primary keyword near front, one per page, unique. Google may rewrite title links that have issues (industry studies put large-scale rewriting at ~60–70% — an estimate, not a Google figure) — write it well to avoid that. |
| Meta description | ~150–160 chars, compels the click, unique per page. **Not a ranking factor** — drives CTR. Google often rewrites it. |
| H1 | exactly one, matches search intent, ≈ the title |
| H2/H3 | mirror PAA + related questions; one idea per heading; scannable. Hierarchy aids readability/snippets — **not a direct ranking lever** (Google, 2024). |
| URL/slug | short, kebab-case, keyword near front, no dates/IDs |
| Keyword usage | **density is a myth** — write naturally, use semantic/secondary variation, match intent. Stuffing is a spam signal. |
| Images | descriptive alt text, compressed, lazy-loaded |
| Internal links | descriptive, varied anchor text; wire the cluster graph (§2) |

### Rank Math compliance (the site's on-page linter)

The WordPress site runs **Rank Math**, a rule-based on-page linter that scores 0–100.
It is mechanical (exact-match keyword checks), so it is *stricter and dumber* than Google
— but a green score is a useful floor and most of its rules already agree with the table
above. Satisfy it **without keyword-stuffing** (§4): weave the exact focus keyword in
naturally, once per location, not repeatedly.

**It reads its own post-meta, not WP's native title/excerpt** — `article-writer` must set
`rank_math_focus_keyword`, `rank_math_title`, `rank_math_description` (see that skill's
Step 4). Unset = ~13/100 no matter how good the writing.

What its checklist wants (focus keyword = the page's exact `keyword`):

| Rank Math check | How we satisfy it (within our rules) |
|-----------------|--------------------------------------|
| Keyword in SEO title, near front | already our title rule — exact phrase at front |
| Keyword in meta description | include the exact phrase once in the meta |
| Keyword in URL | slug contains the keyword words; keep slug short (§2) — partial match is fine, accept the lone warning rather than bloat the slug |
| Keyword at start of content | put the exact phrase in the **first paragraph** (pairs with BLUF, §4) |
| Keyword in content body | exact phrase **2–3× total**, naturally — not more (stuffing = spam, §3/§4) |
| Keyword in ≥1 H2/H3 | put it in **one** subheading where it reads naturally; leave the rest human (§4 two-gate) |
| Content length | our `type` word counts already clear this |
| Internal + external links | internal: the cluster graph (§2); external: 1 link to an authoritative source (also an E-E-A-T Authoritativeness win) |

**Nice-to-have, not gates** (skip unless cheap): featured image + keyword in its alt,
Table of Contents block, "power word"/number/sentiment in the title. These raise the
score but are not Google ranking factors — never distort the page to chase them.

### E-E-A-T (Experience, Expertise, Authoritativeness, Trust) [S-eeat, S-helpful]
Google rewards people-first content from real experience. **Trust is the most important
of the four** — a page that fails trust fails regardless of the rest.

- **Experience:** first-hand detail — actual use, specifics, honest limitations — not
  generic summary. The single biggest quality differentiator.
- **Expertise:** depth beyond the obvious; credentials matter most for YMYL (health,
  finance, safety).
- **Authoritativeness:** cite primary/authoritative sources; earn references over time.
- **Trust:** accurate, current, transparent. **Visible author byline is an explicit
  Google signal** — say who wrote it. HTTPS, clear about/contact, show `updated` dates.
- **Schema:** `Article`, `BreadcrumbList`, author `Person`; `HowTo`/`FAQPage` where they
  fit. **Note:** Google **deprecated FAQ rich results (May 2026** — results stopped May 7;
  report/test support ended June, Search Console API support ends Aug 2026**)** —
  `FAQPage` schema is still valid and can stay in place (harmless; may help **AI
  Overviews** parse content, though Google hasn't confirmed that), but no longer renders
  expandable SERP panels. Structured data is **not required** for generative AI search —
  keep it as general SEO hygiene, don't add special markup just for AI.
- **Freshness:** revisit and update pages; stale facts erode trust and rankings.

### Helpful-Content alignment — what to avoid [S-helpful, S-spam]
Write for people first; apply SEO *after* the content is genuinely useful. Self-test:
*"would this satisfy a reader who arrived directly, with no search engine?"* Avoid:
- keyword stuffing; thin or copied/rewritten content with no added value;
- **scaled content abuse** — mass-generated pages (incl. AI) without substantial human
  value-add; clickbait/sensationalism; content made only to rank.
Every page should fully satisfy the searcher so they don't bounce back to Google.

---

## §4 — Writing quality & intent

### Match intent first
Identify the intent (§1) and deliver its expected format: how-to → numbered steps;
"best X" → comparison; "what is X" → definition + context; question → direct answer up
top. Mismatched format loses the ranking even with the right keyword.

### Article archetypes — vary the shape [S-helpful, S-nng]
**Do not pour every article into one template.** A cluster of identical-shaped pages reads
as mass-produced (a scaled-content / helpful-content risk, §3) and bores readers. Pick the
**archetype that fits the page's intent**, and across a cluster deliberately spread the work
across archetypes so no two neighbours look alike.

| Archetype | Fits | Shape (H2 logic) | Signature components |
|-----------|------|------------------|----------------------|
| **Practical Guide** | "how to X", step/plan intent | TL;DR → ordered steps/plan → what-to-expect | `s5k-steps` or `s5k-timeline`, `s5k-table`, `s5k-intervals` |
| **Story-led** | mindset / motivation / "I can't…" | open on a real runner moment → lesson → science → plan | `s5k-story`, `s5k-pullquote`, `s5k-keytakeaway` |
| **Myth-buster** | "mistakes", "is X bad", misconceptions | each H2 = one myth → the truth | `s5k-dodont`, `s5k-callout`, `s5k-checklist` |
| **Comparison** | "X vs Y", method/plan choice | the dilemma → side-by-side → when each wins | `s5k-comparison`, `s5k-table`, `s5k-numberline` |
| **Q&A / micro** (`qa`) | one PAA question | answer in first ~50 words → brief detail | `s5k-keytakeaway`, `s5k-faq` |

Archetype guides structure and component choice; it does **not** relax any §3 rule (keyword
placement, schema, links, CTA discipline all still apply). When two fit, prefer the one less
used by recently-published siblings in the same cluster.

### Vary the opening — kill the formula [S-nng]
The single biggest "template" tell is every intro reading *"**[Keyword] is mostly about
X.**"* **Rotate the opening hook** across articles — question, surprising stat, a 2-line
scene, a blunt claim, or a myth to puncture. Hard constraint stays: the **exact focus
keyword appears in the first ~100 words** (Rank Math / BLUF, §3) — it just need not be the
first sentence, and the phrasing should differ page to page.

### Depth & originality [S-eeat]
- Cover the topic more completely than the current top-10 (that's how you displace them).
- Add something they don't have: original experience, data, a clearer explanation, a tool.
- Answer the actual question in the **first paragraph** (BLUF); don't bury the lede.

### Readability — how people actually read [S-nng, S-plain]
People **scan** in an F-pattern; they don't read word-for-word. Write for the scan:
- **Front-load** every paragraph — conclusion/takeaway first, then detail.
- Paragraphs **3–4 sentences (40–80 words)**; **one idea per paragraph**.
- Sentences **15–20 words** average; avoid >25–30.
- **Subheading every ~200–300 words**; bullet lists for related items (eye-tracking:
  bulleted content draws far more attention than the same text in prose).
- **Bold 2–3 key words** per paragraph (not whole sentences; keep <30% of text bold).
- **Active voice**; "you/we"; common words; target reading **grade 8–10**.

### Voice — between casual and formal [S-nng]
Sound like a knowledgeable coach who reads research: second person, contractions,
imperatives ("Try this"), encouraging but honest ("this is hard — here's how"). For a
sports/running audience: concrete and specific beats generic ("run at a pace where you
can talk but not sing" > "keep it conversational"). Vary sentence length for rhythm.

**Simple-human rule (site requirement — Pass Group):** every page must sound like a
human explaining things simply, and be easy to understand and follow:
- **Plain everyday words first** — if a shorter, commoner word works, use it ("build"
  not "construct", "start" not "commence", "use" not "utilise"). Never use a big word
  where a small one carries the meaning.
- **Simple structures** — one idea per sentence; subject-verb-object; no nested
  clauses, no legalese, no corporate filler ("leverage", "synergy", "in order to").
- **Explain, don't assume** — every technical term (MVP, native app, API) gets a
  plain-language explanation in the same sentence on first use. The reader is a
  founder with no technical team.
- **Easy to follow** — anything with steps must be numbered steps; anything with
  options must be a short comparison/list — never buried in a paragraph.
- **The ear test:** if it wouldn't sound natural said out loud to a client over
  coffee, rewrite it. Jargon quota: zero unexplained terms per page.

**Coach's-experience voice (E-E-A-T Experience, the #1 quality differentiator) [S-eeat]:**
the byline is the site's author persona from `docs/seo/site-config.json` (StepTo5K:
**Chloe Hayes, running coach**). Write in that persona's first-hand voice and
include **one genuine-feeling coaching observation per article** — a pattern they see, a tell,
a thing they tell beginners ("Most runners I coach quit in week 3 — the tell is they start
dreading the run, not the alarm"). **Realistic, invented-but-plausible anecdotes are
allowed** and encouraged (they make the page human and un-templated). The hard line is §3
**Trust**: never invent **falsifiable facts** — no fake studies, statistics, credentials,
testimonials, or medical claims. Colour and coaching experience = yes; fabricated evidence =
never. Put the anecdote in a story panel or woven inline, varied per article.

### Anti-AI-slop rules [S-nng]
- No filler intros ("In today's fast-paced world…"), no padding to hit word counts.
- No false hedging ("may potentially", "it could be argued"); write with confidence when
  the facts support it.
- Kill low-information density (500 words saying what 100 would).
- Break the formulaic intro→3 points→zoom-out shape; cut repetition and template rhythm.
- Concrete specifics over generic advice ("run 3×/week, 20 min" not "run regularly").

### Two-gate title/heading check (shared technique)
Before writing, every **title and H2** must pass BOTH gates; rewrite until it does.
- **Gate 1 — SEO:** primary keyword present & near front · titles ≤60 chars · matches
  search intent · one H1 · H2s map to PAA/sub-intents · secondary keywords placeable.
- **Gate 2 — Human:** speaks to the reader's real state (2nd person where natural) · not
  keyword-stuffed/robotic · concrete, honest promise · house voice.

Example: `Out Of Breath Running Beginners Tips Guide` (stuffed, robotic) →
`Why You Get Out of Breath Running (and How to Fix It)` (keyword intact, clear, human).

### Visual components & formatting [S-nng]
Plain `<p>`/`<h2>` walls read as bland and tank dwell time. Every article is published
inside a wrapper and draws from a **shared component library** — wide enough that articles
look *varied*, governed enough that they stay *on-brand*. **Never inline styles** — the
styling lives once in the shared stylesheet (`docs/seo/styles/s5k-article.css`, installed
in WP → Customize → Additional CSS); skills emit only these semantic classes.

**Component budget (fit-first):** an article uses **3–5 components total** — **never the whole
menu**. **Choose fit first:** pick the component that best fits the content and the page's
**archetype** (above); a genuinely-fitting component is fine to reuse — repetition that fits is
not a defect. Use the recorded `components` of recent **done** siblings only as a **tiebreaker**:
when two components fit equally well, prefer the one the last article didn't use, so the cluster
doesn't read as lazy copy-paste. This is a nudge for variety, **not** a hard "must differ from
the last article" gate — never force a worse-fitting component just to be different. A component
must summarize / highlight / structure real content — don't box text just to decorate.

**Core (any archetype):**

| Component | Class | Use |
|-----------|-------|-----|
| Body wrapper | `s5k-article` | wrap the **whole** article body in one `<div class="s5k-article">` |
| Key-takeaways | `s5k-tldr` (+ `s5k-tldr__label`) | a 3–4 bullet "short version" near the top — scannable + snippet bait |
| Key takeaway band | `s5k-keytakeaway` | one highlighted sentence (alt to `s5k-tldr`); tone-aware |
| Highlighted rule | `s5k-callout` | the single most important takeaway of a section; **tone-aware** |
| Tip | `s5k-tip` | a helpful aside (💡 added by CSS — no emoji in markup) |
| Warning | `s5k-warning` | safety / "don't do this" (⚠️ added by CSS) |
| Data/schedule table | `s5k-table` (on `<table>`) | schedules, ratios — prefer over bullets for tabular data |
| CTA box | `s5k-cta` (+ `s5k-cta__title`, `s5k-cta__btn`) | the closing call-to-action (funnel, below) |
| Drop cap | `s5k-lead` (on the intro `<p>`) | editorial opener — use **once**, on the first paragraph |
| Divider | `<hr>` or `s5k-divider` | subtle section break; use sparingly |
| Figure | `s5k-figure` (`<img>` or a CSS component + `<figcaption>`) | an image or diagram with caption |

**Data / visual:**

| Component | Class | Use |
|-----------|-------|-----|
| Stat cards | `s5k-stats` > `s5k-stat` (`<b>` + `<span>`) | a row of key-figure cards |
| Numberline | `s5k-numberline` > `div`(`<b>`+`<span>`) | bolder joined big-number band; tone-aware (alt to stats) |
| Gauge | `s5k-gauge` (`<b>` + `<span>`) | **one** hero number/score on a tinted panel; tone-aware |
| Progress ramp | `s5k-progress` > `s5k-progress__row` (`<span>` label + `s5k-progress__bar wN` > `<span>`) | week-by-week volume ramp as bars (`w1`–`w10`) |
| Interval strip | `s5k-intervals` > `s5k-seg` (`is-run`/`is-walk`/`is-pad`, width `w1`–`w4`) | run-walk timeline as coloured CSS segments |
| Comparison | `s5k-comparison` > `div.is-a` / `div.is-b` (each `<h4>` + `<ul>`) | two-column "this vs that" cards (Comparison archetype) |

**Narrative / structure:**

| Component | Class | Use |
|-----------|-------|-----|
| Coach's note | `s5k-story` (+ `s5k-story__label`) | a first-hand coaching anecdote (E-E-A-T Experience); tone-aware |
| Pull quote (big) | `s5k-pullquote` (on a `<p>`/`<blockquote>`) | one centered statement break |
| Pull quote (side) | `s5k-quote` (on `<blockquote>`) | a left-bar memorable line, sparingly |
| Steps | `s5k-steps` (on `<ol>`/`<ul>`; each `<li>` = `<h4>` + `<p>`) | numbered step cards (Practical Guide) |
| Timeline | `s5k-timeline` (on `<ul>`; each `<li>` = `<b>` + text) | vertical week/step dots (alt to a plan table) |
| Do / Don't | `s5k-dodont` > `div.is-do` / `div.is-dont` (`<h4>` + `<ul>`) | green-vs-coral two-column (Myth-buster) |
| Checklist | `s5k-checklist` (on `<ul>`; CSS adds ✓) | a light ticked list (no dividers) |
| Icon list | `s5k-iconlist` (each `<li>` = `<span>…</span>`; CSS adds ✓/✕; `is-skip` = muted ✕) | a heavier designed checklist with dividers |
| FAQ accordion | `s5k-faq` > `<details>` (`<summary>` + `div.s5k-faq__body`) | expandable Q&A; pair with `FAQPage` schema |

**Colour harmony (tone modifiers) [S-nng]:** tone-aware components (`s5k-callout`, `s5k-story`,
`s5k-keytakeaway`, `s5k-numberline`, `s5k-gauge`) accept **one** tone class —
`s5k-mint` (calm/recovery), `s5k-sky` (trust/science), `s5k-gold` (caution/effort), or
`s5k-coral` (primary/energy). Default (no tone) = coral. Rules: **map tone to meaning** (a
science stat → `s5k-sky`, a recovery note → `s5k-mint`), use **at most 2–3 distinct tones per
article**, and never put two different tones on adjacent components. Every tint is desaturated
to the same softness, so mixing stays in harmony. This is the freshness lever — same components,
different palette per page — *not* a license for rainbow pages.

**No inline `<svg>` — ever.** WordPress's KSES sanitizer **strips all `<svg>`/`<rect>`/
`<text>` from posts authored by non-admin users** (our publisher account is an Editor, which
lacks `unfiltered_html`), leaving broken stacks of bare label text. SVG file uploads are
blocked too. So diagrams must be **CSS components** (`s5k-intervals`, `s5k-iconlist` ✓ icons)
— styled once in `s5k-article.css`, KSES-safe forever. The publisher lint gate **fails on any
`<svg` in the body.** Need a new diagram? Add a CSS component to the stylesheet, don't inline SVG.

**Killing prose walls (per section):** a section that is **prose-only → add a supporting
`s5k-figure`** (an `s5k-intervals` strip, other CSS component, or a real image); a section
that is a **plain `<ul>` → upgrade to `s5k-iconlist`**. CSS components are the free, original,
on-brand default (no photo library needed); app screenshots/stock photos layer on top where
available — but **photos require a real `<img>`/upload, never an inlined SVG.**

**Visual cadence (the rhythm rule) [S-nng]:** aim for **one visual break every ~300
words** — where a break is an image, table, list, callout, stat row, OR a heading. Long
runs of plain `<p>` are the #1 "boring" signal. Don't place two components adjacent with no prose between them (the publisher warns). BUT moderation is a hard rule:
- **≤2 heavy callouts** (`s5k-callout`/`tip`/`warning`) per page — more = clutter, which
  research shows hurts readability as much as blandness.
- **Never decorate every paragraph.** Don't box text just because you can; a component
  must summarize/highlight/expand, not restate.
- Use the component that fits the **meaning** (a warning is not a tip).
- **Images** are the missing layer most articles need: a hero/featured image + a relevant
  image roughly every ~300 words (every 1–2 sections). Prefer original/app over stock (§3).

The stylesheet is the **single source of truth** — to restyle all articles, edit the CSS,
never the posts. New component needed? Add the class to the stylesheet first, then use it.
Keep raw HTML clean (classes only) so a global restyle never requires touching content.

### CTA / funnel discipline [S-helpful]
Educating the reader is the means; **the goal is to convert them to the site's product**
(StepTo5K: the app — the specifics below come from `docs/seo/site-config.json`).
Every article both teaches *and* funnels — but trust comes first (a salesy info page
bounces and fails §3 Trust). The discipline:

- **The product:** name, type, and offer framing are in site-config (`brand`). The
  conversion link is **`homeCtaUrl`** (StepTo5K: `https://stepto5k.com`) — every CTA links
  there (lint-enforced; never `href="#"`).
- **Honesty rule (non-negotiable):** never make claims in `brand.forbiddenClaims` (StepTo5K:
  "free app", "no subscription", "no ads" — false for a paid app, breaks trust). Use the
  config's `ctaTitle` framing (StepTo5K: **"Try StepTo5K free"**). Keep the product's real
  nature accurate — no false promises.
- **Two placements per article, no more:**
  1. **One soft inline mention near the top** — woven into the intro, value-first, not a
     pitch. Link the product name to `homeCtaUrl`.
  2. **One closing `s5k-cta` box** — title from `brand.ctaTitle`, one line on what the
     product does for the reader, button → `homeCtaUrl`.
- **Intensity by intent:** pure-info/beginner pages stay soft (the two placements above);
  commercial/comparison pages may push a little harder. Never decorate the body with
  repeated app plugs — once near the top, once at the end.

---

## §5 — Pre-publish checklist (the QC gate)

The canonical self-check every page must pass **after writing, before publishing**. A
consuming skill (e.g. `article-writer`) runs this against each finished draft and **only
publishes on a full pass** — any fail = rewrite, don't publish. This is the *what to
verify*; thresholds live in §2–§4 and are cited here, never restated, so there is one
source of truth.

Tag each item **pass / fail**; for `auto` items a script can lint deterministically, for
`judgment` items the writer self-assesses.

### On-page (§3) — mostly `auto`
- [ ] Title ≤60 chars, primary keyword near front, unique
- [ ] Meta description ~150–160 chars, unique, compels the click
- [ ] Exactly **one H1**, ≈ the title, matches intent
- [ ] H2/H3 map to PAA/sub-intents; one idea per heading
- [ ] Word count matches page `type` (pillar ~2,000 · article ~1,000–1,500 · qa ~300–500)
- [ ] `qa` page answers the question in the **first ~50 words**
- [ ] Slug short, kebab-case, keyword near front, no dates/IDs
- [ ] Visible **author byline** set (Trust signal)
- [ ] Schema present: `Article` (+ `BreadcrumbList`/author `Person`); `FAQPage` for `qa`
- [ ] Rank Math meta set (`focus_keyword`, `title`, `description`) + exact keyword in
      title/meta/first-para/one-H2/body 2–3× (§3 Rank Math compliance)
- [ ] **App funnel:** one soft inline mention near the top + closing `s5k-cta`, both
      linking `homeCtaUrl`; `brand.ctaTitle` framing; **no claims from
      `brand.forbiddenClaims`** (§4 CTA / funnel discipline) — `auto`

### Links (§2) — `auto`
- [ ] ≥1 link **up** to the pillar, high on the page (top ~30%)
- [ ] ~2–5 internal links per 1,500 words; relevance over count
- [ ] **All link targets `done:true`** (no dead links to unpublished pages)
- [ ] Descriptive, **varied** anchor text — no "click here", no repeated exact-match
- [ ] No orphan — page has ≥1 inbound internal link planned
- [ ] ≥1 **external** link to an authoritative, **non-competitor** source (§2 external-link rule)

### Writing quality (§4) — `judgment`
- [ ] First paragraph answers the searcher's question (BLUF — lede not buried)
- [ ] Paragraphs 3–4 sentences / 40–80 words; sentences avg 15–20
- [ ] Subheading every ~200–300 words; bullets for related items
- [ ] Active voice, 2nd person, grade 8–10; house voice intact
- [ ] **Simple-human rule** (§4 Voice): plain everyday words, simple sentence structures,
      every technical term explained on first use, steps/options formatted to follow easily —
      zero unexplained jargon
- [ ] **No AI-slop**: no filler intros, no false hedging, no low-density padding, no
      template rhythm; concrete specifics over generic advice
- [ ] Every title + H2 passed the **two-gate check** (§4)
- [ ] Body wrapped in `s5k-article`; uses **3–5** component classes (§4), no inline styles;
      right component for the meaning (**fit-first**; ≥3 distinct components now **auto-enforced**
      by the publisher lint gate); variety from the last article is a tiebreaker, not required
- [ ] **Archetype chosen** (§4) and structure/components fit it; **opening hook varied** (not
      the "[Keyword] is mostly about X" formula); exact keyword still in first ~100 words
- [ ] **Tone harmony** (§4): ≤2–3 tones, mapped to meaning, no clashing adjacent tones
- [ ] **Coach's-experience** present (one first-hand observation/anecdote, E-E-A-T) with **no
      fabricated facts** (no fake studies/stats/credentials/testimonials)

### Keyword & intent (§1/§4) — `judgment`
- [ ] Content format matches the page's intent (how-to → steps, etc.)
- [ ] Keyword used naturally + semantic variation — **no stuffing** (spam signal)
- [ ] Covers the topic more completely than the current top-10; adds original value

### Report
The consuming skill reports the result per page: items passed, any **fails with the §
reference**, and what was rewritten before publishing.

---

## Sources

The rules above are tagged `[S-...]`; authoritative sources behind them:

- **[S-google-links] / [S-title] / [S-headings] / [S-links]** — Google Search Central:
  [title links](https://developers.google.com/search/docs/appearance/title-link),
  [crawlable links / anchor text](https://developers.google.com/search/docs/crawling-indexing/links-crawlable),
  [H1–H6 clarification (SEJ)](https://www.searchenginejournal.com/google-clarifies-h1-h6-headings-for-seo/522454/).
- **[S-eeat]** — Google QRG & E-E-A-T:
  [E-E-A-T blog](https://developers.google.com/search/blog/2022/12/google-raters-guidelines-e-e-a-t),
  [Search Quality Rater Guidelines (PDF)](https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf).
- **[S-helpful] / [S-spam]** — Google:
  [creating helpful, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content),
  [spam policies (scaled content abuse)](https://developers.google.com/search/docs/essentials/spam-policies).
- **FAQ deprecation** — [Google drops FAQ rich results (SEJ)](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/).
- **[S-nng]** — Nielsen Norman Group:
  [inverted pyramid](https://www.nngroup.com/articles/inverted-pyramid/),
  [concise/scannable/objective](https://www.nngroup.com/articles/concise-scannable-objective/),
  [F-pattern](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/).
- **[S-ai-search]** — Google: [Optimizing for generative AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) (RAG grounding, query fan-out, non-commodity content, llms.txt/chunking mythbusts, Generative AI performance report in Search Console) and the [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) (now covering manipulation of generative AI responses; site-reputation policy updated for the EEA, Aug 2026).
- **[S-plain]** — [Digital.gov plain-language principles](https://digital.gov/guides/plain-language/principles/),
  [plainlanguage.gov](https://www.plainlanguage.gov/).
- **Internal linking / clusters** — [HubSpot topic clusters](https://blog.hubspot.com/marketing/topic-clusters-seo),
  [Ahrefs topical authority](https://ahrefs.com/blog/topical-authority/),
  [Yoast internal linking](https://yoast.com/internal-linking-for-seo-why-and-how/).

Verified current as of September 2026 (sources re-fetched and re-checked: title-link
best practices, helpful-content self-assessment, spam policies incl. AI-response
manipulation, FAQ deprecation dates, generative-AI optimization guide). When Google
guidance changes, update the rule here and every SEO skill inherits it.

## Deferred (not yet covered — add here when needed)
- **Off-page / backlinks** — link building, digital PR, outreach.
- **Technical SEO** — crawl budget, XML sitemaps, robots, Core Web Vitals, indexation.
- **Local SEO** — Google Business Profile, citations, local packs.

These are out of scope for the current content pipeline; add a section here rather than
in a consuming skill when the time comes.
