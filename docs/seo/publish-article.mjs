#!/usr/bin/env node
/* Pass Group canonical article publisher — used by the article-writer skill (Step 4).
   Enforces the SEO + visual invariants deterministically, then publishes a DRAFT and
   sets Rank Math meta. Refuses to publish if any lint check fails, so the seo-core rules
   stay consistent across every run regardless of model drift.

   Usage:  node docs/seo/publish-article.mjs <spec.json> [--lint-only]
   Spec:   { slug, title, seoTitle, metaDescription, focusKeyword,
             contentFile, category:{name,slug}, tags:[{name,slug}],
             schema:"Article"|"FAQPage", postId?:number }
   The contentFile is the article body HTML (already wrapped in <div class="pass-article">).
*/
import fs from 'node:fs';

// ---------- SITE CONFIG (business values live here — see site-config.json) ----------
const cfgPath = new URL('./site-config.json', import.meta.url);
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const P = cfg.components.prefix;                       // component prefix, e.g. "pass"
const WRAP = cfg.components.articleWrapper;            // body wrapper class, e.g. "pass-article"
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const DOMAIN = esc(cfg.domain);
const BLOG = cfg.blogBase.replace(/\/$/, '');          // e.g. https://pass-group.com.au (posts live at site root)
const HOME = cfg.homeCtaUrl.replace(/\/$/, '');        // the conversion page, e.g. https://pass-group.com.au/contact-us
const LINT_ONLY = process.argv.includes('--lint-only');

const specPath = process.argv[2];
if (!specPath) { console.error('usage: node publish-article.mjs <spec.json> [--lint-only]'); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const body = fs.readFileSync(spec.contentFile, 'utf8');
// UTM-tagged CTA URL (attribution: article → contact page). {cluster}/{slug} are filled
// per spec; every conversion-page link in the body gets tagged at publish time (canonicalLink).
const pagesSeg = esc((cfg.paths.pagesDir.split('/').pop() || 'pages'));
const cluster = (spec.contentFile.match(new RegExp(`${pagesSeg}[\\\\/](.+?)[\\\\/]`)) || [])[1] || 'blog';
const HOME_SLASH = cfg.homeCtaUrl.endsWith('/') ? '/' : '';   // keep WP's canonical trailing slash before the query
const CTA_URL = cfg.ctaUtm
  ? HOME + HOME_SLASH + cfg.ctaUtm.replace('{cluster}', cluster).replace('{slug}', spec.slug)
  : cfg.homeCtaUrl;
const text = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const words = text.split(' ').length;

// ---------- LINT GATE (seo-core §2–§5) ----------
const fails = [];
const add = (ok, msg) => { if (!ok) fails.push(msg); };
const kw = spec.focusKeyword.toLowerCase();

add(spec.title && spec.title.length <= 60, `title >60 chars (${spec.title?.length}) [§3]`);
add(spec.seoTitle && spec.seoTitle.length <= 60, `seoTitle >60 chars (${spec.seoTitle?.length}) [§3]`);
add(spec.seoTitle?.toLowerCase().includes(kw.split(' ').slice(0,3).join(' ')), 'focus keyword not near front of seoTitle [Rank Math §3]');
add(spec.metaDescription && spec.metaDescription.length >= 120 && spec.metaDescription.length <= 160,
    `meta description ${spec.metaDescription?.length} chars, want 120–160 [§3]`);
add(spec.metaDescription?.toLowerCase().includes(kw), 'focus keyword missing from meta description [Rank Math §3]');
add(new RegExp(`^\\s*<div class="${WRAP}"`).test(body), `body not wrapped in <div class="${WRAP}"> [§4 visual system]`);
const components = new Set((body.match(new RegExp(`\\b${P}-[a-z0-9]+(?:__[a-z0-9]+)?`, 'gi')) || [])
  .map(c => c.split('__')[0].toLowerCase())
  .filter(c => c !== WRAP));
add(components.size >= 3, `only ${components.size} distinct visual component(s) — need ≥3 (excl. ${WRAP} wrapper) [§4 cadence]`);
add(new RegExp(`<a [^>]*href="https?://(?!${DOMAIN})`, 'i').test(body), 'no external authoritative link [§2 external-link rule]');
add(text.slice(0, 600).toLowerCase().includes(kw), 'focus keyword not in the first paragraph [Rank Math §4 BLUF]');
add((body.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi'))||[]).length >= 2, 'focus keyword used <2× in body [Rank Math §3]');
add(/<h2/.test(body), 'no H2 headings [§3]');
add(new RegExp(`class="${P}-cta__btn"[^>]*href="${esc(HOME)}/?(\\?[^"]*)?"`).test(body), `closing CTA must link to ${HOME} (the conversion page) [§4 funnel]`);
add(!/href="#"/.test(body), 'placeholder href="#" found — every link must resolve [§4 funnel]');
add(!/<svg/i.test(body), 'inline <svg> gets stripped by WordPress (Editor lacks unfiltered_html) — use CSS components (pass-intervals, pass-iconlist) instead [§4 visual system]');
const wc = spec.schema === 'FAQPage' ? [200, 700] : [900, 2600];
add(words >= wc[0] && words <= wc[1], `word count ${words} outside ${wc[0]}–${wc[1]} for ${spec.schema} [§2]`);

// NON-BLOCKING (§4 funnel): a CTA box whose copy doesn't use the configured brand.ctaTitle
// framing. Warning only — the copy may legitimately vary; the config framing is the default.
const ctaTitle = cfg.brand?.ctaTitle;
if (ctaTitle && new RegExp(`class="${P}-cta"`).test(body) && !body.includes(ctaTitle))
  console.warn(`⚠️  CTA box found but brand.ctaTitle "${ctaTitle}" is not in the body — use the config's CTA framing [§4 funnel].`);

if (fails.length) {
  console.error('❌ LINT FAILED — not publishing. Fix these (seo-core), then re-run:');
  fails.forEach(f => console.error('   • ' + f));
  process.exit(2);
}
console.log(`✅ lint passed (${words} words)`);

// ---------- WP ENV (lazy: only touched when actually publishing, so --lint-only works
// without any WordPress credentials or a .env.local file) ----------
let env = null;
const getEnv = () => {
  if (env) return env;
  env = {};
  for (const l of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
};

// ---------- PUBLISH ----------
const ld = { '@context': 'https://schema.org', '@type': spec.schema || 'Article', headline: spec.seoTitle, description: spec.metaDescription, author: { '@type': 'Person', name: cfg.author.name, jobTitle: cfg.author.jobTitle }, mainEntityOfPage: `${BLOG}/${spec.slug}/` };
// normalize EVERY internal link to the canonical post form: <blogBase>/<slug>/ (from site-config).
// Handles root-relative /slug, full <blogBase>/<slug> w/o trailing slash, etc.
// The conversion-page CTA (homeCtaUrl, e.g. /contact-us/) is left untouched apart from UTM tagging.
const ORIGIN = BLOG.match(/^https?:\/\/[^/]+/)[0];                      // e.g. https://pass-group.com.au
const BLOG_PATH = BLOG.slice(ORIGIN.length);                            // "" when posts live at the site root
const HOME_PATH = HOME.startsWith(ORIGIN) ? HOME.slice(ORIGIN.length) : ''; // e.g. "/contact-us"
const homeBare  = new RegExp(`^https?:\\/\\/${DOMAIN}${esc(HOME_PATH)}\\/?$`, 'i');   // CTA page, untagged
const homeTagged= new RegExp(`^https?:\\/\\/${DOMAIN}${esc(HOME_PATH)}\\/?\\?`, 'i'); // CTA page, already UTM-tagged
const blogUrl  = new RegExp(`^https?:\\/\\/${DOMAIN}${esc(BLOG_PATH)}\\/([a-z0-9-]+)\\/?$`, 'i');
const siteUrl  = new RegExp(`^https?:\\/\\/${DOMAIN}\\/(?!${esc(BLOG_PATH.slice(1))}\\/)([a-z0-9-]+)\\/?$`, 'i');
const relUrl   = new RegExp(`^\\/(?!${esc(BLOG_PATH.slice(1))}\\/)([a-z0-9-]+)\\/?$`, 'i');
const canonicalLink = (href) => {
  const h = href.trim();
  if (homeTagged.test(h)) return h;                                     // already-tagged CTA — leave as-is
  if (homeBare.test(h)) return CTA_URL;                                 // bare CTA page — tag it for attribution
  let m = h.match(blogUrl);                                             // full <blogBase>/<slug> → fix slash
  if (m) return `${BLOG}/${m[1]}/`;
  m = h.match(siteUrl);                                                 // full domain/<slug> → add blog path
  if (m) return `${BLOG}/${m[1]}/`;
  m = h.match(relUrl);                                                  // root-relative /slug → full URL
  if (m) return `${BLOG}/${m[1]}/`;
  return href;                                                          // external / already-canonical / anchors
};
const normBody = body.replace(/href="([^"]*)"/gi, (full, href) => `href="${canonicalLink(href)}"`);

// LINT (post-normalize guarantee): every internal link must be canonical <blogBase>/<slug>/
// (the conversion-page CTA and external links are exempt). Fails publish otherwise.
const linkFails = [];
const canonicalRe = new RegExp(`^${esc(BLOG)}\\/[a-z0-9-]+\\/$`, 'i');
for (const [, href] of normBody.matchAll(/href="([^"]*)"/gi)) {
  const h = href.trim();
  const isInternal = new RegExp(`^https?:\\/\\/${DOMAIN}`, 'i').test(h) || /^\/(?!\/)/.test(h);
  if (!isInternal) continue;                                            // external link
  if (homeBare.test(h) || homeTagged.test(h)) continue;                 // conversion-page CTA (tagged or not)
  if (!canonicalRe.test(h)) linkFails.push(h);
}
if (linkFails.length) {
  console.error(`❌ LINT FAILED — non-canonical internal link(s) (want ${BLOG}/<slug>/) [§2]:`);
  [...new Set(linkFails)].forEach(l => console.error('   • ' + l));
  process.exit(2);
}

// NON-BLOCKING heads-up (§4 cadence): a closing block tag immediately followed by an opening
// component block, with no prose between — cheap regex, just a warning, never fails.
// require a block-level component class (no BEM `__` child) on both sides, so we don't flag
// sub-elements like pass-progress__row that legitimately sit inside one component.
const adjacent = normBody.match(new RegExp(`class="${P}-(?!${WRAP.replace(P + '-', '')})[a-z0-9]+"[^>]*>[\\s\\S]*?<\\/(?:div|section|figure|aside|ol|ul|table)>\\s*<(?:div|section|figure|aside|ol|ul|table)\\s+class="${P}-(?!${WRAP.replace(P + '-', '')})[a-z0-9]+"`, 'gi'));
if (adjacent) console.warn(`⚠️  cadence: ${adjacent.length} spot(s) where ${P}- components may sit adjacent with no prose between — add a sentence between them [§4].`);

// --lint-only: exit here — everything above is deterministic (no WP calls, no writes)
if (LINT_ONLY) { console.log('✅ lint-only run — nothing published'); process.exit(0); }

const b = getEnv().WP_BASE_URL.replace(/\/$/, '');
const E = getEnv();
const H = { Authorization: 'Basic ' + Buffer.from(`${E.WP_USER}:${E.WP_APP_PASSWORD}`).toString('base64'), 'Content-Type': 'application/json' };
const j = async (url, opts = {}) => { const r = await fetch(url, { ...opts, headers: { ...H, ...(opts.headers||{}) } }); const t = await r.text(); if (!r.ok) throw new Error(`${r.status} ${url}\n${t}`); return t ? JSON.parse(t) : null; };
const termId = async (kind, name, slug) => { const f = await j(`${b}/wp-json/wp/v2/${kind}?slug=${encodeURIComponent(slug)}`); return f.length ? f[0].id : (await j(`${b}/wp-json/wp/v2/${kind}`, { method: 'POST', body: JSON.stringify({ name, slug }) })).id; };

const content = normBody + `\n<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
const catId = await termId('categories', spec.category.name, spec.category.slug);

// ---------- TAG POLICY (seo-core §2): facet = topical relator; quick-answers = QA marker ----------
// raw cluster facet -> clean WP tag (vocabulary lives in site-config.json). Related-QAs query =
// posts sharing facet tag AND quick-answers tag.
const FACET_TAGS = cfg.facetTags;
const tags = [...(spec.tags || [])];
const ensureTag = (t) => { if (t && !tags.some(x => x.slug === t.slug)) tags.push(t); };
if (spec.facet && spec.facet !== '(pillar)' && FACET_TAGS[spec.facet]) ensureTag(FACET_TAGS[spec.facet]);
if (spec.schema === 'FAQPage') ensureTag({ name: 'Quick Answers', slug: 'quick-answers' });
if (tags.length > 4) console.warn(`⚠️  ${tags.length} tags (>4) — seo-core §2 caps at 4: ${tags.map(t => t.slug).join(', ')}`);
const tagIds = []; for (const t of tags) tagIds.push(await termId('tags', t.name, t.slug));

// spec.publishAt (local ISO, e.g. "2026-06-30T09:00:00") → WordPress "Scheduled" (status:future);
// WP flips it live at that time. Omit publishAt → draft (the default, user-reviews-then-publishes).
// preserve status on update: only send status for scheduled posts or brand-new drafts.
// updating an existing post with no publishAt omits status so WP keeps its current one.
const sched = spec.publishAt
  ? { status: 'future', date: spec.publishAt }
  : spec.postId
    ? {}
    : { status: 'draft' };
const payload = { title: spec.title, slug: spec.slug, ...sched, content, excerpt: spec.metaDescription, categories: [catId], tags: tagIds };
const post = spec.postId
  ? await j(`${b}/wp-json/wp/v2/posts/${spec.postId}`, { method: 'POST', body: JSON.stringify(payload) })
  : await j(`${b}/wp-json/wp/v2/posts`, { method: 'POST', body: JSON.stringify(payload) });

// IDEMPOTENCY: on a fresh CREATE (no incoming postId), persist the new post.id back into the
// spec file so re-runs UPDATE the same post instead of creating a duplicate. (see root-cause fix)
if (!spec.postId && post?.id) {
  spec.postId = post.id;
  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2) + '\n');
  console.log(`↩︎  wrote postId ${post.id} back into ${specPath}`);
}

// ---------- FEATURED IMAGE ----------
// spec.featuredImage = { source:"pexels", query, alt }  OR  { source:"file", path, alt }
async function uploadMedia(buf, filename, mime, alt, caption) {
  // MUST use multipart/form-data, NOT a raw binary body: the host WAF blocks raw
  // image/jpeg bodies (403) but lets multipart form uploads through.
  const fd = new FormData();
  fd.append('file', new Blob([buf], { type: mime }), filename);
  const r = await fetch(`${b}/wp-json/wp/v2/media`, { method: 'POST',
    headers: { Authorization: H.Authorization, 'Accept': 'application/json' },
    body: fd });
  if (!r.ok) throw new Error(`media upload ${r.status}: ${await r.text()}`);
  const m = await r.json();
  const fields = { alt_text: alt }; if (caption) fields.caption = caption;
  await j(`${b}/wp-json/wp/v2/media/${m.id}`, { method: 'POST', body: JSON.stringify(fields) });
  return m.id;
}
const fi = spec.featuredImage;
if (fi) try {
  let buf, fname, mime, caption;
  if (fi.source === 'pexels') {
    if (!E.PEXELS_API_KEY) { console.error('⚠️  featuredImage skipped — add PEXELS_API_KEY to .env.local'); }
    else {
      // deterministic by photoId (preferred — matches the inline hero), else search by query.
      // DEDUP: for query searches, fetch a page of results and pick the first photo not already
      // used by another article (tracked via manifest.json pexelsUrl) — avoids duplicate heroes
      // across the cluster. photoId picks are an explicit choice and are NOT deduped.
      const usedUrls = new Set(
        (() => { try { return JSON.parse(fs.readFileSync(cfg.paths.manifest, 'utf8')); } catch { return []; } })()
          .filter(e => e.slug !== spec.slug)   // ignore this slug's own prior entry (re-runs)
          .map(e => e.pexelsUrl)
      );
      let ph;
      if (fi.photoId) {
        ph = await (await fetch(`https://api.pexels.com/v1/photos/${fi.photoId}`, { headers: { Authorization: E.PEXELS_API_KEY } })).json();
      } else {
        const photos = (await (await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(fi.query)}&per_page=15&orientation=landscape`, { headers: { Authorization: E.PEXELS_API_KEY } })).json()).photos || [];
        ph = photos.find(p => !usedUrls.has(p.url)) || photos[0];   // first unused; fall back to top if all taken
        const skipped = photos.findIndex(p => ph && p.url === ph.url);
        if (skipped > 0) console.log(`hero dedup: skipped ${skipped} already-used photo(s) for "${fi.query}"`);
      }
      if (ph) {
        buf = Buffer.from(await (await fetch(ph.src.large2x || ph.src.large)).arrayBuffer()); fname = `${spec.slug}.jpg`; mime = 'image/jpeg';
        // Pexels guideline: credit photographer + link to Pexels
        caption = `Photo by <a href="${ph.photographer_url}" target="_blank" rel="nofollow noopener">${ph.photographer}</a> on <a href="${ph.url}" target="_blank" rel="nofollow noopener">Pexels</a>`;
        // Save locally + record in manifest: audit trail, dedup source, and the input for a bulk
        // manual upload if the host WAF ever blocks the REST media endpoint.
        const dir = cfg.paths.heroesDir; fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(`${dir}/${fname}`, buf);
        const mfPath = `${dir}/manifest.json`;
        const mf = fs.existsSync(mfPath) ? JSON.parse(fs.readFileSync(mfPath, 'utf8')) : [];
        const entry = { slug: spec.slug, postId: post.id, file: fname, alt: fi.alt || spec.title, photographer: ph.photographer, pexelsUrl: ph.url, caption };
        const i = mf.findIndex(e => e.slug === spec.slug); if (i >= 0) mf[i] = entry; else mf.push(entry);
        fs.writeFileSync(mfPath, JSON.stringify(mf, null, 2));
        console.log(`hero saved → ${dir}/${fname} (logged in manifest.json for bulk upload)`);
      } else console.error('⚠️  Pexels returned no photo for query:', fi.query);
    }
  } else if (fi.source === 'file') {
    buf = fs.readFileSync(fi.path); fname = fi.path.split(/[\\/]/).pop(); mime = fname.endsWith('.png') ? 'image/png' : fname.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg';
  }
  if (buf) { const mediaId = await uploadMedia(buf, fname, mime, fi.alt || spec.title, caption); await j(`${b}/wp-json/wp/v2/posts/${post.id}`, { method: 'POST', body: JSON.stringify({ featured_media: mediaId }) }); console.log('featured image set, media', mediaId, caption ? '(with attribution)' : ''); }
} catch (e) {
  const waf = /403|web security|firewall/i.test(e.message);
  console.error(`⚠️  featured image NOT set — ${waf ? 'host WAF blocked the media upload' : e.message.split('\n')[0]}. Post published OK; add the featured image manually in WP admin.`);
}

// Rank Math meta via its own endpoint (standard /wp/v2 meta drops these keys)
await j(`${b}/wp-json/rankmath/v1/updateMeta`, { method: 'POST', body: JSON.stringify({ objectID: post.id, objectType: 'post',
  meta: { rank_math_focus_keyword: spec.focusKeyword, rank_math_title: spec.seoTitle, rank_math_description: spec.metaDescription } }) });

console.log(JSON.stringify({ id: post.id, status: post.status, slug: post.slug,
  edit: `${b}/wp-admin/post.php?post=${post.id}&action=edit` }, null, 2));
