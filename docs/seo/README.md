# SEO Content Pipeline — Pass Group Control Panel

Everything for the pass-group.com.au blog's SEO content operation lives here. Start from `cluster-viewer.html`.

## Open the panel
- **`cluster-viewer.html`** — the unified dashboard: browse/search clusters, track progress, tick pages. Opens offline in a browser.
  - Currently shows the **Pillar Roadmap** (`clusters/roadmap-pillars.data.js` — the 7-pillar shortlist from `notes/pillars.md`, in build-priority order). Tick a roadmap entry when that pillar is planned into a real cluster.
  - When `pillar-cluster-planner` generates a real cluster, append its file name to `CLUSTER_FILES` in the viewer (no `.data.js` suffix).

## Layout
| Path | What it is |
|------|------------|
| `clusters/` | Cluster data files (`cluster-*.data.js`) — the source of truth: every page's brief, link graph, and `done` status |
| `pages/<cluster>/` | Written pages: `<slug>.html` (body) + `<slug>.spec.json` (publish spec) |
| `assets/heroes/` | Featured images (JPG backups), `manifest.json` |
| `notes/` | Strategy + history: `pillars.md` (ranked pillar shortlist), design notes, archives |
| `site-config.json` | **Site identity**: domain, author persona, brand/CTA rules, component prefix, facet tags. Read by every skill in the pipeline |
| `ledger.mjs` | Cluster CLI: `stats` · `open N` · `brief <slug>` · `done <slug>` · `schedule <slug> <date>` |
| `publish-article.mjs` | *(not yet ported)* The StepTo5K publisher — needs adapting (WP creds, `pass-` component classes, stylesheet) before the first publish |

## The workflow (skills in `.claude/skills/`)
1. **Plan** — `pillar-cluster-planner` skill, fed one pillar from `notes/pillars.md` → writes `clusters/cluster-<slug>.data.js` + registers it in the viewer
2. **Write** — `article-writer` skill → batches pages, runs the QC gate, publishes WP drafts, flips `done:true`
3. **Track** — `cluster-viewer.html` + `node docs/seo/ledger.mjs stats`

## Quick commands
```bash
node docs/seo/ledger.mjs stats                                          # cluster state
node docs/seo/ledger.mjs open 10 docs/seo/clusters/cluster-X.data.js    # next pages to write
node docs/seo/ledger.mjs brief <slug>                                   # full brief for one page
node docs/seo/verify-keywords.mjs "kw 1" "kw 2" --expand                # estimate-only verification (autocompletes branches + SERP top-10 → EASY/MED/HARD); report → notes/verification-<date>.md
```

## Verifying pillars/clusters are good candidates
1. **Before planning** — run `verify-keywords.mjs` on the pillar keyword (needs ≥8 base autocomplete branches; verdict must be MED/EASY, never HARD — seo-core pillar rule).
2. **Spot-check facets** — verify the 3–5 highest-value facet keywords the same way before committing 50+ pages.
3. **Re-run monthly** once Search Console data accrues — replace estimates with real impressions/positions (seo-core §1 hardening table).
4. Latest run: `notes/verification-2026-10-25.md` (12 keywords, Bing RSS 12/12; caveat: Bing served off-topic noise on ~7 queries — flagged inside).

## Site facts (verified Oct 2026)
- Domain: **pass-group.com.au** — WP posts live at site **root** (`/<slug>/`), **blog listing at `/blog/`** (posts page; `/category/blog/` 301s there — fixed 2026-10-25). Nav is theme-option driven (`psc_options`), and the **homepage is a static index.html** (not WP-rendered — edits go via FTP, it carries no WP head/CSS).
- Audience: Australian businesses/startups with an app or website idea; geo = AU English
- **House voice: simple, human, easy to follow** — plain everyday words, simple structures, zero unexplained jargon (full rule: `.claude/skills/seo-core` §4 "Simple-human rule"; enforced in the §5 pre-publish checklist)
- CTA funnel: free consultation → `/contact-us/`
- Existing blog: thin (~10 posts, mostly 2022) — candidate for refreshing/upgrading into clusters (see `notes/pillars.md`)

## Status / next steps
- [x] Pillar shortlist (`notes/pillars.md`)
- [x] Control panel (viewer + ledger + config)
- [x] Site design intel gathered via FTP (`notes/site-design-notes.md` — Pacific theme tokens, Rank Math confirmed active, XML-RPC off → REST + app passwords)
- [x] WP pipeline connected (2026-10-25): `.env.local` set (WP_USER=Nathan, editor), REST Basic-auth mu-plugin installed, `pass-article.css` installed into WP Customizer Additional CSS, `publish-article.mjs` ported + lint-tested
- [ ] **First batch** (pillar + 4 cost articles) — confirm → write → publish drafts
- [ ] Create `styles/pass-article.css` ✓ done · optional: PEXELS_API_KEY in `.env.local` for auto hero images
- [ ] **Pick pillar #2** → run `pillar-cluster-planner` (recommend AI cost pillar #8)
