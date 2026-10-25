#!/usr/bin/env node
// verify-keywords.mjs — estimate-only keyword/pillar verification (seo-core §1).
// For each keyword: Google autocomplete branch count + SERP top-10 composition
// (Bing RSS, DuckDuckGo HTML fallback) → EASY/MED/HARD verdict + weak-competition flags.
//
// Usage:
//   node docs/seo/verify-keywords.mjs "app development cost australia" "ai app development cost" [...]
//   --expand        also a–z expand autocomplete (slower, ~26 extra calls/kw)
//   --no-serp       autocomplete counts only
//   --out <path>    write markdown report (default: docs/seo/notes/verification-<date>.md)
//
// Everything is estimate-only: no paid tools, no measured volumes. Paced ~4s between calls.
'use strict';
import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const flags = { expand: false, serp: true, out: null };
const keywords = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--expand') flags.expand = true;
  else if (args[i] === '--no-serp') flags.serp = false;
  else if (args[i] === '--out') flags.out = args[++i];
  else keywords.push(args[i]);
}
if (!keywords.length) { console.error('usage: verify-keywords.mjs "kw" [...] [--expand] [--no-serp] [--out <path>]'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const DOMAIN_CLASS = [
  [/reddit|quora\.com|whirlpool\.net\.au|news\.ycombinator|forum/, 'forum'],
  [/clutch\.co|goodfirms|designrush|sortlist|upwork|fiverr|buildfire|appbuilders/, 'directory/marketplace'],
  [/wikipedia|\.gov\.|\.edu|nhs\.uk|forbes|entrepreneur\.com|business\.news\.daily|canva|wix|squarespace|shopify|zapier|kissflow|zoho/, 'giant/reference'],
];

function curl(url) {
  return new Promise((resolve) => {
    execFile('curl', ['-s', '--max-time', '25', '-A', UA, url], { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => resolve(err ? '' : stdout));
  });
}

async function autocomplete(seed) {
  const url = `https://suggestqueries.google.com/complete/search?output=chrome&q=${encodeURIComponent(seed)}`;
  const raw = await curl(url);
  try { return JSON.parse(raw)[1] || []; } catch { return []; }
}

async function branches(seed) {
  const base = await autocomplete(seed);
  let all = new Set(base.map(s => s.toLowerCase()));
  if (flags.expand) {
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
      await sleep(350);
      for (const s of await autocomplete(`${seed} ${letter}`)) all.add(s.toLowerCase());
    }
  }
  return { count: all.size, sample: base.slice(0, 8) };
}

async function serpBing(q) {
  const xml = await curl(`https://www.bing.com/search?q=${encodeURIComponent(q)}&format=rss&count=10&mkt=en-au`);
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);
  if (!items.length) return null;
  return items.map(it => {
    const link = (it.match(/<link>(.*?)<\/link>/) || [])[1] || '';
    return { url: link.trim(), title: ((it.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').replace(/<!\[CDATA\[|\]\]>/g, '') };
  });
}

async function serpDDG(q) {
  const html = await curl(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`);
  const links = [...html.matchAll(/result__a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  if (!links.length) return null;
  return links.slice(0, 10).map(m => {
    const u = m[1].match(/uddg=([^&]+)/);
    return { url: u ? decodeURIComponent(u[1]) : m[1], title: m[2].replace(/<[^>]+>/g, '') };
  });
}

function classifyDomain(host) {
  for (const [re, label] of DOMAIN_CLASS) if (re.test(host)) return label;
  return 'agency/blog';
}

function verdict(results) {
  if (!results) return { diff: '?', reason: 'SERP unavailable (rate-limited/blocked) — reasoned call needed' };
  const classes = results.map(r => {
    try { return classifyDomain(new URL(r.url).hostname); } catch { return 'unknown'; }
  });
  const n = { forum: classes.filter(c => c === 'forum').length, dir: classes.filter(c => c === 'directory/marketplace').length, giant: classes.filter(c => c === 'giant/reference').length };
  let diff = 'MED';
  if (n.dir + n.giant >= 4) diff = 'HARD';
  else if (n.forum >= 2 && n.dir === 0 && n.giant <= 1) diff = 'EASY';
  const reason = `top-10: ${classes.filter(c => c === 'agency/blog').length} agency/blog, ${n.dir} directory/marketplace, ${n.giant} giant/reference, ${n.forum} forum` +
    (n.forum ? ' — forum presence = weak-competition signal (easy-win candidates)' : '');
  return { diff, reason };
}

const report = [`# Keyword Verification — ${new Date().toISOString().slice(0, 10)}`, '', '**Estimate-only** (free SERP surfaces, no paid tools). Branch counts = Google autocomplete; SERP = Bing RSS (AU market) w/ DuckDuckGo fallback. Re-run monthly; replace with GSC data once it accrues (seo-core §1).', ''];

for (const kw of keywords) {
  console.error(`→ ${kw}`);
  const b = await branches(kw);
  let s = null, src = '';
  if (flags.serp) {
    s = await serpBing(kw); src = 'bing-rss';
    if (!s) { await sleep(4000); s = await serpDDG(kw); src = 'ddg-html'; }
  }
  const v = flags.serp ? verdict(s) : { diff: '?', reason: 'SERP skipped (--no-serp)' };
  console.log(`${kw}\n  autocomplete branches: ${b.count}${flags.expand ? ' (a–z expanded)' : ' (base only — use --expand for full count)'}\n  difficulty: ${v.diff} — ${v.reason}\n`);
  report.push(`## ${kw}`, '', `- **Autocomplete branches:** ${b.count}${flags.expand ? '' : ' (base only; --expand for a–z full count)'}`, `- **Difficulty (est.):** ${v.diff} — ${v.reason}`, s ? `- **SERP source:** ${src}; sample: ${s.slice(0, 5).map(r => new URL(r.url).hostname).join(', ')}` : '- **SERP source:** none (blocked/skipped)', `- **Top suggestions:** ${b.sample.join(' · ')}`, '');
  await sleep(4000 + Math.random() * 1500);
}

const out = flags.out || `docs/seo/notes/verification-${new Date().toISOString().slice(0, 10)}.md`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, report.join('\n'));
console.error(`report → ${out}`);
