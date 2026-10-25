# Pacific theme — design tokens & blog rendering notes (pass-group.com.au)

Gathered read-only over FTP from the live server (WP root `/public_html/`), theme
`wp-content/themes/Pacific/`, plus verification of rendered HTML on the live site.
No credentials, no server changes.

Files inspected: `functions.php`, `single.php`, `page.php`, `archive.php`, `index.php`,
`header.php`, `footer.php`, `sidebar.php`, `style.css` (stub), `css/main.css` (the real
stylesheet, 4,145 lines), `css/bs.css` (custom Bootstrap 5 build), live single post +
category page HTML, `.htaccess`, `litespeed.conf`, plugin list.

---

## 1. Design tokens

### Colour palette
| Token | Hex | Where it's used |
|---|---|---|
| Petrol (primary dark) | `#00384c` | Header/footer surfaces, dark panels — most-used brand colour (31 rules) |
| Cyan (accent) | `#00bdf1` | Category links, breadcrumb links, form focus borders, highlights; hover `#029eca` |
| Navy (meta/icons) | `#214669` / `#1f4567` | Inline SVG icon fills, meta text, `.header-fix` top border, button borders |
| Violet (nav CTA) | `#5533ff` | `.btn-solid` / `.btn-outline` in nav & startup sections; hover `#2b00ff` |
| Body text | `#212529` | Bootstrap default on `body` |
| Default link | `#0d6efd` | Bootstrap default, `text-decoration: none !important` (hover `#0a58ca`) |
| Surfaces | `#fff`, `#f4f4f4` (breadcrumb strip), `#f7f7f7` (blockquote bg), `#cdcccc` (footer) | |

No CSS custom properties (`:root` vars) exist in the theme — tokens live as literals.
Primary/accent verdict: **petrol `#00384c` = primary, cyan `#00bdf1` = accent**.
Note: cyan on white is low-contrast for text — use its hover shade `#029eca` for
any link-coloured text in article components.

### Typography
- Body stack: `Inter, HeaveneticaCond7BoldSH, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
  — but **neither font is actually loaded**: the Heavenetica `@font-face` is commented
  out and no Inter files/Google Fonts exist on blog pages. In practice body text renders
  in the **system UI font** (Segoe UI on Windows, SF on Mac).
- No Google Fonts on posts/pages except Elementor pages, which load **Roboto + Roboto
  Slab** from `fonts.googleapis.com` (Elementor global fonts).
- Base: **18px (1.125rem)**, `line-height: 1.8`, weight 400.
- Headings inherit the body family; default weight **500**, `line-height: 1.2`.
- Scale at ≥1200px: h1 **2.5rem**, h2 **2rem**, h3 **1.75rem**, h4 **1.5rem**, h5 1.25rem,
  h6 1rem (fluid `calc()` sizes below 1200px).
- Single-post h1: centred, **weight 900**, `margin-bottom: 50px`.

### Shape, buttons, width, spacing
- Border-radius is **small/squarish**: 3px (share buttons), 5px (featured image,
  inputs), 6–8px (misc), Bootstrap default 0.2rem. Nothing rounded beyond 10px.
- Buttons: `.btn-archive` = dashed 1px `#204669` border, `padding: 10px 30px`,
  fills navy on hover; nav CTAs are solid/outline violet.
- Containers (bs.css): 540 / 720 / 960 / **1320px** at 576/768/992/1200px breakpoints.
- Single post: `.article-box { max-width: 1000px }` — content is a wide single column.
- Section spacing: Bootstrap utilities (`my-5` = 48px etc.); fixed header pushes content
  via `.breadcrumb-cc` `padding-top: 160px` (100px ≤992px, 60px ≤768px); footer has
  `margin-top: 200px`, fixed 400px height, `#cdcccc` background.

---

## 2. Blog rendering

- **single.php structure:** breadcrumb strip (Rank Math) → `container` → `.article-box`
  (max-width 1000px) → `.row` → `header` (h1, full-width featured image, date/category/
  comment meta with inline SVGs) → **`.article-content.my-4` → `the_content()`** →
  share row, `hr`, tags → comments. **No sidebar on single posts**; the archive
  (`/category/blog/`) is a 9/3 split with a widget sidebar (tags widget active).
- **Classic Editor output:** classic-editor + tinymce-advanced are installed;
  `functions.php` **dequeues `wp-block-library` styles** (Gutenberg CSS stripped), so
  any block markup would render unstyled. Content is effectively raw semantic HTML.
- **Theme styles for post content are minimal:** `.article-content` sets
  `text-align: justify`; blockquote = `#f7f7f7` bg, 4px solid `#029eca` left border,
  26px 30px padding; `img { max-width: 100% }`. That's it — no styles for lists
  (Bootstrap base only: `padding-left: 2rem`), **no table styles at all**, no heading
  rhythm inside content. A custom article stylesheet fills a genuine gap.
- **easy-table-of-contents 2.0.86** is active on posts: `screen.min.css` plus inline
  settings styles (`.ez-toc-container`, `.ez-toc-box-title`, 95%/90% list sizing).
  It auto-inserts into content and adds heading anchor IDs.
- **YARPP** (yet-another-related-posts-plugin) injects related-post thumbnails below
  content with its own CSS.
- **Elementor dependence:** none for blog rendering — Elementor(+Pro) powers some
  pages (its Swiper lib loads globally, its GF Roboto fonts load on Elementor pages
  only). Blog templates are pure PHP.

### Clash risks for a custom article stylesheet + wrapper div
1. `.article-content { text-align: justify }` — wrapper must explicitly reset to
   `text-align: left` or text stays justified.
2. Theme link rule is `a { text-decoration: none !important }` — restoring underlines
   inside the wrapper needs `!important` (or higher specificity + `!important`).
   Link colour itself is easily overridden by `.pass-article a`.
3. Wrapper injection is safe: no output filters in the theme; tinyMCE is configured
   with `valid_elements = *[*]` (nothing stripped in the editor), and admin-role
   publishing is unaffected by KSES. Inline SVGs are used by the theme itself.
4. ez-toc + YARPP both inject markup around/inside content — keep heading structure
   (h2/h3) clean for TOC anchors; leave a note not to fight the TOC box's own styling.
5. Gutenberg styles are dequeued — publish plain tags (h2/p/ul/table/div), not blocks.
6. `.article-box` is 1000px wide with justified text — the wrapper's ~68ch readable
   measure is the single biggest improvement; `body { overflow-x: hidden }` means
   wide tables need their own `overflow-x: auto` wrapper (no page-level scroll).

---

## 3. SEO plumbing

- **Rank Math 1.0.276** (free): breadcrumbs hard-coded into `single.php`, `page.php`,
  `archive.php` via `rank_math_the_breadcrumbs()`; schema confirmed on live posts
  (BlogPosting, BreadcrumbList, WebPage, WebSite, Person, ImageObject); sitemap index
  live at `/sitemap_index.xml`. Content pipeline should not emit conflicting schema.
- **Caching:** W3 Total Cache active (`WP_CACHE` true), LiteSpeed server with a
  W3TC-generated `litespeed.conf`; `.htaccess` has HTTPS redirect, WordPress rewrites,
  gzip types and 1-year expires for static assets. **Any Additional-CSS edit or
  content publish may need a W3TC cache purge to show on the front end.**
- **GA** gtag (`G-B2VW6QV5DC`) is hard-coded in `header.php`.
- Feeds disabled, emoji script removed, REST oembed links removed, XML-RPC disabled
  (functions.php) — **XML-RPC is off**, so publishing must go through WP REST API
  (application passwords) or WP-CLI/Customizer.
- `really-simple-ssl` handles HTTPS; `twentytwenty*`/`twentytwentyfive` default themes
  present but unused; no child theme.

---

## 4. Implications for `pass-article.css` (Customizer Additional CSS)

Mirrors the s5k-article.css component pattern (wrapper, TL;DR, callouts, tip/warning,
quote, tables, CTA, stats, steps, timeline, comparison, do/don't, FAQ, mobile block).
Token mapping for Pacific:

| s5k token | Pacific equivalent |
|---|---|
| `--s5k-ink` (headings) | `#00384c` (petrol) |
| `--s5k-body` (copy) | `#212529` (keep) |
| `--s5k-accent` (brand) | `#00bdf1` cyan; text/border shade `#029eca` |
| `--s5k-line` (hairlines) | `#e5e5e5` / `#f4f4f4` |
| `--s5k-heading` font | system sans stack (see §Typography) — or self-host Inter to make the theme's intended stack real |
| `--s5k-bodyfont` | same sans stack (no serif in this theme; don't import one) |
| Radius | **6–8px** (match theme's squarish look rather than s5k's 12–16px) |
| Table header | `#00384c` bg, white text (matches footer/nav surfaces) |
| CTA / buttons | navy `#214669` border style or cyan accent — avoid violet `#5533ff` (nav-only) |
| Tints | derive from cyan `#00bdf1` (e.g. `#e5f0ff`/`#d9e2ef` already appear in theme), petrol, plus a warm gold for cautions |

Must-haves carried over from the findings: reset `text-align: justify` → left;
`!important` on link underlines; ~68ch max-width inside the 1000px article box;
`overflow-x: auto` table wrapper; plain HTML tags only (no blocks); expect ez-toc
and YARPP markup adjacent to the wrapper; purge W3TC after every re-paste.
