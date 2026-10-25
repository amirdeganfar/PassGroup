---
name: web-design-best-practices
description: Provides web design best practices covering semantic HTML, CSS architecture, accessibility (WCAG 2.1 AA), responsive design, and performance optimization. Use when working on files inside the Website/ folder, building web pages, or when the user mentions web design, HTML, CSS, accessibility, or responsive layout.
---

# Web Design Best Practices

Apply these practices when creating or editing files in the `Website/` folder.

## Semantic HTML

- Use semantic elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`
- One `<main>` per page
- Use `<button>` for actions, `<a>` for navigation (never `<div>` or `<span>`)
- Use `<figure>` and `<figcaption>` for images with captions
- Use `<time datetime="...">` for dates
- Avoid deprecated elements (`<center>`, `<font>`, `<marquee>`)
- Use `<details>` / `<summary>` for expandable content

## Heading Hierarchy

```html
<h1>Page Title</h1>           <!-- One per page -->
  <h2>Section</h2>
    <h3>Subsection</h3>
      <h4>Detail</h4>
```

Never skip levels. Every section should begin with a heading.

## Accessibility (WCAG 2.1 AA)

### Minimum Requirements

- **Color contrast**: 4.5:1 for normal text, 3:1 for large text (18px+ bold or 24px+)
- **Focus indicators**: Visible focus styles on all interactive elements (never `outline: none` without replacement)
- **Keyboard navigation**: All functionality accessible via keyboard (Tab, Enter, Escape, Arrow keys)
- **Skip links**: Provide "Skip to main content" link as the first focusable element
- **Language**: Set `lang` attribute on `<html>`

### ARIA

- Use ARIA only when native HTML semantics are insufficient
- Always pair `role` with required ARIA properties
- Use `aria-label` or `aria-labelledby` for elements without visible text
- Use `aria-live="polite"` for dynamic content updates
- Use `aria-expanded` for collapsible sections
- Use `aria-current="page"` for active navigation items

### Images & Media

- All `<img>` must have `alt` attribute (empty `alt=""` for decorative images)
- Provide captions or transcripts for video/audio
- Avoid auto-playing media with sound
- Ensure animations respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Forms

- Every input must have a visible `<label>` linked via `for`/`id`
- Group related fields with `<fieldset>` and `<legend>`
- Use appropriate `type` attributes (`email`, `tel`, `url`, `number`)
- Provide inline error messages linked with `aria-describedby`
- Never rely on color alone to indicate errors

## CSS Architecture

### Methodology

Use BEM (Block Element Modifier) naming:

```css
.card {}
.card__title {}
.card__image {}
.card--featured {}
```

### Custom Properties for Theming

```css
:root {
  --color-primary: #1a73e8;
  --color-text: #202124;
  --color-bg: #ffffff;
  --font-sans: system-ui, -apple-system, sans-serif;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --radius: 0.5rem;
}
```

### Best Practices

- Use external stylesheets (no inline styles)
- Use class selectors over IDs for styling
- Avoid `!important` -- use specificity instead
- Use relative units (`rem`, `em`) for font sizes and spacing
- Use logical properties (`margin-inline`, `padding-block`) for RTL support
- Organize CSS: reset > base > layout > components > utilities

## Responsive Design

### Mobile-First Approach

```css
/* Base: mobile */
.container { padding: 1rem; }

/* Tablet */
@media (min-width: 768px) {
  .container { padding: 2rem; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { max-width: 1200px; margin-inline: auto; }
}
```

### Layout

- Use CSS Grid for 2D layouts, Flexbox for 1D alignment
- Use `clamp()` for fluid typography: `font-size: clamp(1rem, 2.5vw, 1.5rem)`
- Use container queries where supported for component-level responsiveness
- Set `max-width` on content containers (typically 1200-1400px)

### Touch Targets

- Minimum 48x48px for interactive elements
- Minimum 8px spacing between targets
- Place primary actions in thumb-reach zones on mobile

### Images

```html
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Description" width="1200" height="630" loading="lazy">
</picture>
```

- Always set `width` and `height` to prevent layout shift
- Use `loading="lazy"` for below-the-fold images
- Use `<picture>` for art direction and format fallbacks

## Performance

- Inline critical CSS in `<head>`, defer the rest
- Preload key resources: `<link rel="preload" href="font.woff2" as="font" crossorigin>`
- Preconnect to third-party origins: `<link rel="preconnect" href="https://fonts.googleapis.com">`
- Use `font-display: swap` for web fonts
- Defer non-essential JS: `<script defer src="app.js">`
- Minify CSS and HTML in production
- Target Lighthouse score > 90 on all categories

## Color Scheme Support

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #e8eaed;
    --color-bg: #202124;
  }
}
```

- Support both light and dark modes
- Test contrast ratios in both themes
- Use `color-scheme: light dark` on `:root`

## Testing Checklist

- Validate HTML with W3C Validator
- Test with keyboard-only navigation
- Test with a screen reader (VoiceOver, NVDA)
- Run Lighthouse audit (Performance, Accessibility, Best Practices, SEO)
- Test at 320px, 768px, 1024px, 1440px viewports
- Test with `prefers-reduced-motion` enabled
- Test with 200% browser zoom
