---
name: pillar-cluster-planner
description: Use when you have ONE chosen content pillar and need the complete build-ready content cluster — the pillar page plus every spoke article and Q&A micro-page, with slugs and a 3-direction internal-link graph. Outputs a cluster data file (.data.js) + HTML viewer that the article-writer skill executes. Run once per pillar.
---

# Pillar Cluster Planner

## Overview

Take ONE content pillar and produce its **complete** build-ready cluster: the pillar hub page + every spoke article + Q&A micro-pages, fully interlinked. Output is a structured **data file (`.data.js`) + an HTML viewer** (search/filter/progress), NOT a markdown wall. Goal: the downstream article-writing skill builds every page and wires every link with zero further decisions.

This skill **plans only — it never writes articles.** The hand-off is the `.data.js` data file (read by the viewer and by the article-writing skill).

It's the step AFTER `find-content-pillars` (which produces the ranked pillar shortlist). Input = one pillar from that list.

**REQUIRED BACKGROUND:** Read the `seo-core` skill (`.claude/skills/seo-core/SKILL.md`) — the canonical SEO brain. §1 covers estimate-only data sources, difficulty heuristic, and gap-reporting; §2 (Content structure & linking) is the source of the page-type, slug, cannibalization, and link-graph rules this skill applies.

## When to Use

- "Build the complete plan for the <X> pillar"
- After `find-content-pillars`, once the user picks a pillar
- Run once per pillar (many times across a site)

## Step 0 — Confirm the pillar (ask first)

If the user already named the pillar, confirm it; if not, ask. Never pick unilaterally. Batched questions:

1. **Which pillar?** (from `find-content-pillars`' shortlist, or stated)
2. **Commercial vs informational lean** — funnel hard to product, or pure traffic + soft funnel?
3. **Must-include angle** (wedge, a specific tool/page to funnel to)
4. **Scope** — complete (every spoke + question) or lean starter set?

**Pillar rule:** the pillar keyword MUST be winnable (MED, not HARD). If the user names a HARD pillar, say so and offer the winnable alternative. You can't be the hub of a topic you can't rank for.

## Step 1 — Research the cluster EXHAUSTIVELY

A real cluster is large — typically **50–100+ pages**, not 20. One search pass always under-covers. Cover the topic systematically, in passes, until you stop finding anything new.

### 1a. Enumerate facets (sub-topics)
List every angle of the pillar. For a "how to start running" pillar that's: getting started, run/walk method, plans/schedules, pace, breathing, frequency, gear/shoes/clothing, nutrition (before/during/after/fasted), hydration, injuries (each one), warm-up/cool-down, motivation/habit, age groups, body types, weather/treadmill/outdoor, weight loss, tracking/apps, recovery, etc. Aim for 12–20 facets.

### 1b. Sweep each facet on multiple surfaces
Per facet, run seo-core §1's SERP sources:
- **Autocomplete a–z** on the facet seed (and seed + each letter)
- **Question-prefix matrix:** how / what / why / when / where / can / is / are / does / should / do / will — plus modifiers: *for beginners, without, vs, at home, over 40, overweight, on a treadmill*
- **People Also Ask** — click to expand; each expansion spawns more PAA. Harvest the whole tree.
- **Related searches** footer
- **Forums** (Reddit/Quora/HealthUnlocked) — real user questions competitors miss

Tip: facets are independent — research them in parallel (dispatch one agent per facet) to go wide fast, then merge.

### 1c. Loop until dry
Keep sweeping. Stop a facet only when **2 consecutive passes surface nothing new**. Track everything found in a running list; dedup by keyword.

### 1d. Completeness critic (required final pass)
Before writing, explicitly ask: *"What's missing? Which facet is thin? What would a domain expert / a struggling beginner search that isn't here yet?"* Add what it surfaces. Then log coverage: facets covered, approx pages per facet, and anything deliberately deferred.

**One keyword per page** — never two pages on the same query (cannibalization). **Don't cap** unless the user explicitly chose a lean starter set — and if you do cap, `log` exactly what was dropped.

## Step 2 — Apply seo-core §2 to the cluster

All the structure rules come from **seo-core §2** — don't restate them, apply them:
- **Page types** (`pillar` / `article` / `qa`) and their word-count targets.
- **3-direction link graph** — plan the full intended graph (spoke/`qa` `linksUp`, pillar
  `linksDown`, articles `siblings` to 1–3 genuinely related spokes). The writer enforces
  published-only at write time; here you plan the complete graph.
- **WordPress taxonomy** — `category` = the pillar (from `find-content-pillars`); `tags`
  from each page's facet (≥3 posts per tag, 2–4 tags per post).

This skill's job is to populate every page's fields per those rules into the data file.

## Step 3 — Output: data file + viewer (NOT markdown)

A cluster is large (50–100+ pages), so the output is **structured data + an HTML viewer**, not a markdown wall. Write the data file to **`docs/seo/clusters/`** (the viewer and `ledger.mjs` look there):

1. **`cluster-<pillar-slug>.data.js`** — the source of truth. One JS file assigning `window.CLUSTER = { ... }`. The article-writing skill reads it and flips each page's `"done": true` as it writes. (Data is a `.js` var, not `.json`, so the viewer loads it offline via `<script>` without a server — `file://` blocks `fetch`.)

2. **`cluster-viewer.html`** — the standard viewer (already at `docs/seo/cluster-viewer.html`; if missing, regenerate it). It renders ANY `.data.js` in `clusters/` — unified multi-cluster panel with search, facet/type/tag/status filters, a progress bar, and expandable briefs. One viewer works for every cluster — new clusters just get added to its `CLUSTER_FILES` list.

**Data schema** — `window.CLUSTER`:
```js
window.CLUSTER = {
  pillarTitle: "How to Start Running for Beginners",
  pillarKeyword: "how to start running for beginners",
  pillarSlug: "/start-running",
  category: "How to Start Running",          // = the pillar (WP category)
  pages: [
    {
      type: "pillar" | "article" | "qa",
      facet: "Breathing",                     // groups the page; also the tag vocabulary
      title: "...",
      slug: "/breathing-while-running",        // unique kebab-case, no placeholder
      keyword: "breathing while running",      // exactly 1 primary
      secondary: ["...", "..."],               // 3–5 for articles; [] for Q&A/pillar
      h1: "...",                               // 1 H1 = primary keyword, natural
      intent: "informational",
      difficulty: "easy" | "med" | "hard",
      words: "~1,200",                          // pillar ~2,000 · article ~1,000–1,500 · qa ~300–500
      h2s: ["...", "..."],                      // articles/pillar; [] for Q&A
      answer: "",                               // Q&A only: ≤50-word snippet-target answer
      linksUp: "/start-running",                // every spoke/qa → pillar
      linksDown: "",                            // pillar only: "all pages"
      siblings: ["/run-without-stopping"],      // articles: 1–3 related spokes
      tags: ["beginner", "breathing"],          // 2–4, facet-derived (seo-core §2 taxonomy)
      cta: "",                                  // soft-funnel note (app / /pace-calculator)
      done: false                               // writer flips to true
      // append-on-publish (writer adds these; omit at handoff):
      // created: "YYYY-MM-DD",                  // publish date
      // components: ["s5k-steps", ...],         // s5k- classes actually used (excl. s5k-article)
      // linksPlaced: ["/run-without-stopping"], // internal slugs actually wired in
      // linksDeferred: ["/pace-guide"]          // planned slugs skipped (target not yet published)
    }
  ]
};
```

Every field is populated per seo-core §2 (page types, link graph, taxonomy). Be exhaustive (Step 1) — `done:false` for every page at handoff. The `created`/`components`/`linksPlaced`/`linksDeferred` fields are **append-on-publish** — the article-writer adds them; leave them out at handoff.

The data file is the build spec + tracker; the viewer is how the human reads/searches/follows it. The article skill finds a page by `slug`, writes it, sets `done:true` → progress updates in the viewer.

## Step 4 — Report gaps + hand-off

Per seo-core §1, note estimates aren't measured. Tell the user: open `cluster-viewer.html` to browse/search/track, and feed `cluster-<slug>.data.js` to the article-writer skill, which builds the pillar + all spokes + Q&A pages, wires links from each page's `linksUp`/`linksDown`/`siblings`, and flips `done:true`.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| One research pass → ~20 pages | Under-coverage. Enumerate 12–20 facets, sweep each, loop until dry. Expect 50–100+ |
| Skipping the completeness critic | Always run the final "what's missing?" pass before writing |
| No question-prefix matrix | Sweep how/what/why/when/can/is/does/should + modifiers per facet |
| Capping/pruning spokes | Be complete (unless lean chosen); if capped, log what was dropped |
| Pillar is a HARD head term | Pillar must be winnable (MED) |
| PAA questions folded into H2s only | Distinct questions become their own `qa` page |
| Links upward only / no slugs | Need linksUp + linksDown + siblings + a real slug per page |
| Outputting markdown | Output is `cluster-<slug>.data.js` + the viewer, not a markdown plan |
| Writing the articles | This skill plans only; outputs the data file for the next skill |
