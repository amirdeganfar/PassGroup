#!/usr/bin/env node
// Ledger helper for cluster-*.data.js — used by the article-writer skill (see SKILL.md).
// Read-only commands print; `done` is the single serial Phase-B write (orchestrator only).
//
// Usage:
//   node ledger.mjs stats                          — totals + latest created date
//   node ledger.mjs open [N]                       — next N unwritten pages (pillar → article → qa)
//   node ledger.mjs brief <slug> [slug…]           — page briefs + same-facet published targets
//   node ledger.mjs done <slug> [options]          — mark one page done (Phase B, one pass)
//       --created YYYY-MM-DD        publish date (required for scheduled posts)
//       --components a,b,c          s5k- classes actually used (excl. s5k-article)
//       --links /a,/b               linksPlaced (write-time up-links + Phase-B cross-links)
//       --deferred /c,/d            linksDeferred (targets still unpublished after Phase B)
//   node ledger.mjs schedule <slug> <publishAt>    — set publishAt on an existing spec (schedule-only)
//
// The cluster file is located automatically (docs/seo/cluster-*.data.js) or passed as last arg.
'use strict';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const cmd = args.shift();
if (!cmd) { console.error('usage: ledger.mjs <stats|open|brief|done|schedule> [args]'); process.exit(1); }

// locate cluster file: last arg if it points at a .data.js file, else look in docs/seo/clusters/
let file = null;
if (args.length && /\.data\.js$/.test(args[args.length - 1])) file = args.pop();
if (!file) {
  const hit = fs.existsSync('docs/seo/clusters')
    ? fs.readdirSync('docs/seo/clusters').filter(f => /^cluster-[\w-]+\.data\.js$/.test(f)).map(f => 'docs/seo/clusters/' + f)
    : [];
  const legacy = fs.existsSync('docs/seo') ? fs.readdirSync('docs/seo').filter(f => /^cluster-[\w-]+\.data\.js$/.test(f)).map(f => 'docs/seo/' + f) : [];
  const all = [...hit, ...legacy];
  // slug-aware: for brief/done, auto-pick the cluster containing the first slug
  if (all.length > 1 && (cmd === 'brief' || cmd === 'done') && args.length) {
    const slug = args[0].replace(/^\//, '');
    for (const f of all) {
      const w = {}; eval(fs.readFileSync(f, 'utf8').replace(/window\.CLUSTER/g, 'w.CLUSTER'));
      if (w.CLUSTER.pages.some(p => p.slug.replace(/^\//, '') === slug)) { file = f; break; }
    }
    if (!file) { console.error('slug not found in any cluster: /' + slug); process.exit(1); }
  } else if (all.length !== 1) {
    console.error('expected exactly one cluster file, found: ' + (all.join(', ') || 'none') + ' — pass one explicitly'); process.exit(1);
  } else file = all[0];
}
const src = fs.readFileSync(file, 'utf8');
if (!/window\.CLUSTER/.test(src)) { console.error(file + ' does not look like a cluster data file (no window.CLUSTER)'); process.exit(1); }
function loadCluster() {
  const window = {};
  eval(src.replace(/window\.CLUSTER/, 'window.CLUSTER'));
  return window.CLUSTER;
}
const TYPE_RANK = { pillar: 0, article: 1, qa: 2 };

if (cmd === 'stats') {
  const c = loadCluster();
  const done = c.pages.filter(p => p.done);
  const open = c.pages.filter(p => !p.done);
  const byType = t => c.pages.filter(p => p.type === t).length;
  console.log(`cluster: ${file}`);
  console.log(`pages: ${c.pages.length} total — ${done.length} done, ${open.length} open (pillar ${byType('pillar')}, article ${byType('article')}, qa ${byType('qa')})`);
  const dates = done.map(p => p.created).filter(Boolean).sort();
  if (dates.length) console.log(`latest scheduled/published date: ${dates[dates.length - 1]}  → next batch starts ${nextDay(dates[dates.length - 1])}`);
}

function nextDay(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

if (cmd === 'open') {
  const n = Number(args[0]) || 10;
  const c = loadCluster();
  const open = c.pages.filter(p => !p.done).sort((a, b) => (TYPE_RANK[a.type] ?? 9) - (TYPE_RANK[b.type] ?? 9));
  console.log(`${open.length} open (showing ${Math.min(n, open.length)}):`);
  for (const p of open.slice(0, n)) console.log([p.title, '·', p.type, '·', p.slug, '·', p.keyword].join(' '));
}

if (cmd === 'brief') {
  const slugs = args.map(s => s.replace(/^\//, ''));
  const c = loadCluster();
  const doneSlugs = new Set(c.pages.filter(p => p.done).map(p => p.slug.replace(/^\//, '')));
  for (const s of slugs) {
    const p = c.pages.find(x => x.slug.replace(/^\//, '') === s);
    if (!p) { console.error(`slug not found: /${s}`); process.exit(1); }
    const related = c.pages.filter(x => x.done && x !== p && (x.facet === p.facet || p.slug === x.linksUp || (p.linksUp && x.slug === p.linksUp)))
      .map(x => x.slug.replace(/^\//, ''));
    const out = { ...p, slug: p.slug };
    out._publishedTargets = [...doneSlugs].filter(x => x !== s);
    out._sameFacetDone = [...new Set(related)];
    console.log(JSON.stringify(out, null, 1));
  }
}

if (cmd === 'done') {
  const slug = (args.shift() || '').replace(/^\//, '');
  if (!slug) { console.error('done: slug required'); process.exit(1); }
  const opt = {};
  for (let i = 0; i < args.length; i += 2) opt[args[i].replace(/^--/, '')] = args[i + 1];
  if (!opt.created) { console.error('done: --created YYYY-MM-DD required (publish date; use today for plain drafts)'); process.exit(1); }
  const anchor = `"slug": "/${slug}"`;
  const i = src.indexOf(anchor);
  if (i < 0) throw new Error(`anchor not found: ${anchor}`);
  const doneTok = '"done": false';
  const d = src.indexOf(doneTok, i);
  if (d < 0) throw new Error(`no "done": false found after /${slug} (already done?)`);
  const fields = [`"done": true`, `"created": "${opt.created}"`];
  if (opt.components) fields.push(`"components": [${opt.components.split(',').map(s => `"${s.trim()}"`).join(', ')}]`);
  if (opt.links) fields.push(`"linksPlaced": [${opt.links.split(',').map(s => `"${s.trim().replace(/^\/*/, '/')}"`).join(', ')}]`);
  if (opt.deferred) fields.push(`"linksDeferred": [${opt.deferred.split(',').map(s => `"${s.trim().replace(/^\/*/, '/')}"`).join(', ')}]`);
  const out = src.slice(0, d) + fields.join(',\n      ') + src.slice(d + doneTok.length);
  fs.writeFileSync(file, out);
  // verify parse + count
  const window = {}; eval(out);
  console.log(`✓ /${slug} → done (${window.CLUSTER.pages.filter(p => p.done).length}/${window.CLUSTER.pages.length})`);
}

if (cmd === 'schedule') {
  const slug = (args.shift() || '').replace(/^\//, '');
  const when = args.shift();
  if (!slug || !when) { console.error('usage: ledger.mjs schedule <slug> <YYYY-MM-DDTHH:MM:SS>'); process.exit(1); }
  // specs live in pages/<cluster>/<slug>.spec.json — search there (and legacy docs/seo/)
  let specPath = null;
  for (const base of [...(fs.existsSync('docs/seo/pages') ? fs.readdirSync('docs/seo/pages').map(d => 'docs/seo/pages/' + d) : []), 'docs/seo']) {
    const cand = base + '/' + slug + '.spec.json';
    if (fs.existsSync(cand)) { specPath = cand; break; }
  }
  if (!specPath) { console.error('spec not found for ' + slug); process.exit(1); }
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  if (!spec.postId) { console.error(`no postId in ${specPath} — was it published via publish-article.mjs?`); process.exit(1); }
  spec.publishAt = when;
  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2) + '\n');
  console.log(`✓ publishAt=${when} in ${specPath} — re-run: node docs/seo/publish-article.mjs ${specPath}`);
}
