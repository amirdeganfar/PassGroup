---
name: seo-optimization
type: skill
description: SEO best practices for website development including meta tags, Open Graph, structured data, sitemaps, Core Web Vitals, and semantic HTML. Use when working on files inside the Website/ folder, building web pages, or when the user mentions SEO, search engine optimization, meta tags, or web performance.
trigger: Website/ folder OR user mentions SEO|meta tags|search optimization|web performance
tools: [claude-code, cursor]
---

# SEO Optimization

Apply these practices when creating or editing files in the `Website/` folder.

## Meta Tags

Every page must include essential meta tags in the `<head>`:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Page Title - Brand Name</title>
<meta name="description" content="Concise 150-160 char description with target keywords.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://example.com/current-page">
```

- **Title**: 50-60 characters, primary keyword near the front
- **Description**: 150-160 characters, include a call-to-action
- **Canonical URL**: Always set to avoid duplicate content issues

## Open Graph & Social Sharing

```html
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Description for social sharing.">
<meta property="og:image" content="https://example.com/image.jpg">
<meta property="og:url" content="https://example.com/page">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Brand Name">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Page Title">
<meta name="twitter:description" content="Description for Twitter.">
<meta name="twitter:image" content="https://example.com/image.jpg">
```

- OG images: minimum 1200x630px
- Always test with Facebook Sharing Debugger and Twitter Card Validator

## Structured Data (JSON-LD)

Add JSON-LD structured data for rich search results:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Brand Name",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

Common schema types to use:
- `WebSite` for the homepage
- `WebPage` for individual pages
- `FAQPage` for FAQ sections
- `BreadcrumbList` for breadcrumb navigation
- `Organization` for about/contact pages

Validate with Google's Rich Results Test.

## Semantic HTML for SEO

```html
<header>  <!-- Site header with logo and nav -->
<nav>     <!-- Primary navigation with aria-label -->
<main>    <!-- Primary page content (one per page) -->
<article> <!-- Self-contained content -->
<section> <!-- Thematic grouping with heading -->
<aside>   <!-- Sidebar / related content -->
<footer>  <!-- Site footer -->
```

- Use one `<h1>` per page containing the primary keyword
- Follow logical heading hierarchy: h1 > h2 > h3 (never skip levels)
- Use `<a>` with descriptive anchor text (avoid "click here")
- Use `<img>` with meaningful `alt` text (include keywords naturally)
- Use `<ul>`/`<ol>` for lists (search engines parse these for featured snippets)

## URL Structure

- Use lowercase, hyphen-separated, descriptive URLs: `/about-us`, `/blog/seo-guide`
- Keep URLs short and keyword-rich
- Avoid query parameters for indexable content
- Implement proper 301 redirects for changed URLs

## Sitemap & Robots

**robots.txt** (place at site root):
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://example.com/sitemap.xml
```

**sitemap.xml**: Include all indexable pages with `<lastmod>`, `<changefreq>`, and `<priority>`.

## Core Web Vitals

Target thresholds:
- **LCP** (Largest Contentful Paint): < 2.5s
- **INP** (Interaction to Next Paint): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1

Optimization checklist:
- Preload critical assets (`<link rel="preload">`)
- Use `font-display: swap` for web fonts
- Set explicit `width` and `height` on images and videos to prevent CLS
- Lazy load below-the-fold images: `<img loading="lazy">`
- Minimize render-blocking CSS/JS
- Use `<link rel="preconnect">` for third-party origins

## Images

- Use modern formats: WebP with JPEG/PNG fallback
- Provide responsive images with `srcset` and `sizes`
- Always include descriptive `alt` text
- Compress images (target < 100KB for most)
- Use descriptive file names: `seo-guide-hero.webp` not `img001.webp`

## Performance

- Minify HTML, CSS, and JavaScript
- Enable gzip/brotli compression
- Implement caching headers for static assets
- Use a CDN for global distribution
- Defer non-critical JavaScript: `<script defer>`
- Inline critical CSS for above-the-fold content

## Internal Linking

- Link related pages with descriptive anchor text
- Implement breadcrumb navigation
- Ensure every page is reachable within 3 clicks from the homepage
- Use a flat site architecture when possible

## Mobile SEO

- Ensure responsive design (Google uses mobile-first indexing)
- Touch targets minimum 48x48px with 8px spacing
- Avoid intrusive interstitials
- Test with Google's Mobile-Friendly Test

## Validation Tools

- Google Search Console for indexing and performance
- Google PageSpeed Insights / Lighthouse for Core Web Vitals
- Schema.org validator for structured data
- W3C Markup Validation Service for HTML
