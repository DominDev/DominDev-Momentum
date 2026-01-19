# DominDev Momentum

> High-Performance Portfolio & Landing Page — Engineered for Speed, Security, and Conversions.

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://domin737.github.io/DominDev-Momentum/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://www.w3.org/html/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE.md)

[Live Demo](https://domin737.github.io/DominDev-Momentum/) | [Contact](mailto:contact@domindev.com)

---

## About

**DominDev Momentum** is a high-performance portfolio and landing page showcasing modern web engineering practices. Built from scratch without frameworks or templates, it demonstrates what's achievable when design meets obsessive performance optimization.

This isn't a "pretty business card" — it's a **business machine** engineered for speed, SEO, accessibility, and conversion optimization.

### Key Features

- **Sub-second Load Time** — Optimized critical path, modulepreload hints, lazy loading
- **Matrix Background Animation** — Custom Canvas API with Intersection Observer (auto-pause when off-screen)
- **AI-Powered Chatbot** — Ultra lazy-loaded on-demand (~200KB saved on initial load)
- **Network-Aware Image Loading** — Adaptive quality based on connection speed (2G/3G/4G)
- **Multi-Format Images** — AVIF → WebP → JPEG fallback chain (70-80% size reduction)
- **Self-Hosted Fonts** — Zero CDN dependencies, font-display: swap, metric overrides for CLS prevention
- **WCAG 2.1 AA Compliant** — Semantic HTML, ARIA labels, keyboard navigation, focus management
- **SEO Optimized** — Schema.org JSON-LD, OpenGraph, Twitter Cards, FAQ schema
- **Responsive Design** — Mobile-first approach, 320px to 4K support
- **Reduced Motion Support** — Respects `prefers-reduced-motion` preference

---

## Performance & Quality

### Lighthouse Scores (Mobile)

| Category | Score |
|----------|-------|
| Performance | 97/100 |
| Accessibility | 100/100 |
| Best Practices | 100/100 |
| SEO | 100/100 |

### Core Web Vitals

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **FCP** (First Contentful Paint) | ~0.6s | <1.0s | Excellent |
| **LCP** (Largest Contentful Paint) | ~1.2s | <2.5s | Excellent |
| **CLS** (Cumulative Layout Shift) | ~0.03 | <0.1 | Perfect |
| **TTI** (Time to Interactive) | ~1.9s | <3.0s | Excellent |

### Optimizations Applied

- Minified CSS/JS (35% CSS size reduction: 86KB → 56KB)
- ES Modules with `<link rel="modulepreload">` hints (-192ms critical path)
- Lazy-loaded images with `loading="lazy"` + `decoding="async"`
- Async font loading with media query trick (-600ms render blocking)
- Browser caching headers ready
- Critical font preloading for above-the-fold content

---

## Tech Stack

| Category | Technologies | Rationale |
|----------|-------------|-----------|
| **Markup** | HTML5 (Semantic) | SEO, accessibility, no framework overhead |
| **Styling** | CSS3 (Custom Properties, Grid, Flexbox) | Modern layouts, DRY principles, no frameworks |
| **Scripting** | Vanilla JavaScript (ES2022 Modules) | Minimal bundle size, native performance |
| **Graphics** | Canvas API | Custom Matrix animation, 60 FPS |
| **Fonts** | Outfit, Space Grotesk (self-hosted) | Zero CDN dependencies, CLS prevention |
| **Icons** | FontAwesome 6 (self-hosted, subset) | Only used icons included |
| **Images** | Sharp | AVIF/WebP/JPEG generation, responsive srcset |
| **Build** | npm scripts | CSS minification, image optimization |
| **Deployment** | GitHub Pages | Free, fast, auto-deploy on push |

### Architecture

```
HTML5 (Semantic)
  ├── CSS3 (Custom Properties, Grid, Flexbox)
  ├── Vanilla JavaScript (ES2022 Modules)
  │     ├── core/matrix.js     → Canvas animation
  │     ├── core/ui.js         → UI interactions, scroll reveal
  │     └── modules/           → Feature modules (lazy-loadable)
  │           ├── portfolio.js
  │           ├── contact.js
  │           ├── chatbot.js   → Lazy loaded on-demand
  │           ├── adaptive-images.js
  │           └── hud.js
  └── Canvas API (Matrix animation)
```

### Why This Stack?

- **Vanilla JS** for minimal bundle size (~15KB total) and maximum performance
- **CSS Grid/Flexbox** for modern, maintainable layouts without framework bloat
- **Static HTML** for instant SEO indexing and sub-second Time to Interactive
- **ES Modules** for native code splitting and tree-shaking potential
- **Self-hosted everything** for zero third-party dependencies and GDPR compliance

---

## Accessibility

- **WCAG 2.1 Level AA** compliant
- Semantic HTML5 structure (`<section>`, `<article>`, `<nav>`, `<main>`)
- ARIA labels and roles for interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Focus management for modals and menus
- Color contrast ratios > 4.5:1
- `prefers-reduced-motion` support for animations
- Skip-to-content link ready
- Screen reader friendly (tested with NVDA)

---

## Getting Started

### Prerequisites

- Node.js 18+ (for build tools only)
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Installation

```bash
# Clone repository
git clone https://github.com/DominDev/DominDev-Momentum.git
cd DominDev-Momentum

# Install dependencies (optional - only for build tools)
npm install

# Start development
# Option A: Open index.html directly in browser
# Option B: Use any local server
python -m http.server 5500
# or
npx serve .
```

### Available Scripts

```bash
# Optimize images (generate AVIF/WebP/JPEG variants)
npm run optimize:images

# Minify CSS
npm run minify

# Build for production (images + CSS)
npm run build

# Watch mode for CSS changes
npm run watch
```

### Project Structure

```
DominDev-Momentum/
├── index.html              # Main entry point
├── 404.html                # Custom 404 page
├── style.css               # Source CSS (editable)
├── style.min.css           # Production CSS (auto-generated)
│
├── assets/
│   ├── fonts/              # Self-hosted fonts
│   │   ├── outfit-*.woff2      # Google Fonts Outfit
│   │   ├── space-grotesk.woff2 # Google Fonts Space Grotesk
│   │   ├── fa-solid-900.woff2  # FontAwesome Solid
│   │   └── fa-brands-400.woff2 # FontAwesome Brands
│   └── images/
│       ├── portfolio/      # Portfolio images (AVIF/WebP/JPEG)
│       ├── about/          # About section images
│       ├── social/         # OG/Twitter social images
│       └── icons/          # Favicons
│
├── js/
│   ├── main.js             # ES module entry point
│   ├── config.js           # Configuration flags
│   ├── core/
│   │   ├── matrix.js       # Matrix background animation
│   │   └── ui.js           # UI interactions, scroll reveal
│   └── modules/
│       ├── portfolio.js    # Portfolio section logic
│       ├── contact.js      # Contact form handling
│       ├── chatbot.js      # AI chatbot (lazy loaded)
│       ├── adaptive-images.js  # Network-aware image loading
│       ├── hud.js          # Performance monitor
│       └── maintenance.js  # Maintenance mode
│
├── data/
│   └── chatbot-db.json     # Chatbot knowledge base
│
├── _scripts/               # Build & utility scripts
│   ├── auto-minify-css.js  # CSS minifier with watch mode
│   ├── minify-js.js        # JS minifier
│   ├── optimize-images.js  # Image optimization (Sharp)
│   ├── optimize-video.js   # Video optimization
│   └── setup-git-hooks.js  # Git hooks installer
│
└── _docs/                  # Technical documentation
    ├── README.md           # Documentation index
    └── *.md                # Various guides and reports
```

---

## Development

### CSS Workflow

The project uses automated CSS minification:

```bash
# One-time setup (installs Git pre-commit hook)
node _scripts/setup-git-hooks.js

# Development with watch mode
node _scripts/auto-minify-css.js --watch

# Edit source CSS
code style.css

# Commit (auto-minifies via Git hook!)
git add style.css
git commit -m "style: update hero section"
```

**Important:**
- Always edit `style.css` (source file)
- Never edit `style.min.css` manually (auto-generated)
- Git hook automatically minifies on commit

### Image Optimization

```bash
# Add original images to assets/images/*/originals/
# Run optimization script
npm run optimize:images

# Output: Multiple sizes (400w, 800w, 1200w, 1600w) in AVIF, WebP, JPEG
```

---

## Deployment

### GitHub Pages (Current)

The project is configured for GitHub Pages deployment:

- **URL:** https://domin737.github.io/DominDev-Momentum/
- **Branch:** `main`
- **Auto-deploy:** Push to `main` triggers deployment
- **Build time:** ~1-2 minutes

### URL Handling

The site handles both localhost and production URLs automatically:

```html
<!-- Conditional base tag in index.html -->
<script>
  if (window.location.hostname === "domindev.github.io") {
    document.write('<base href="/DominDev-Momentum/">');
  }
</script>
```

- **Localhost:** `http://127.0.0.1:5500/`
- **Production:** `https://domin737.github.io/DominDev-Momentum/`

### Alternative Deployment

The static site works on any hosting platform:

```bash
# Netlify
netlify deploy --prod

# Vercel
vercel --prod

# Any static host
# Just upload the entire folder
```

---

## Roadmap

- [ ] Progressive Web App (PWA) with Service Worker
- [ ] Critical CSS inlining (above-the-fold)
- [ ] Font subsetting (only used glyphs)
- [ ] Blur-up effect for progressive image loading
- [ ] Real User Monitoring (RUM) integration
- [ ] Multi-language support (EN/PL)
- [ ] Dark/Light mode toggle

**Note:** The current state is already production-ready and highly optimized. These are optional enhancements.

---

## License

This project is licensed under the **MIT License** with additional restrictions for assets.

- **Code:** MIT License — free to use, modify, and distribute
- **Assets:** All Rights Reserved — images, logos, and content may not be used without permission

See [LICENSE.md](LICENSE.md) for full details.

---

## Author

<div align="center">

### Crafted with precision by **DominDev**

**Building digital experiences that convert.**

[![Website](https://img.shields.io/badge/Website-domindev.com-FF1F1F?style=for-the-badge&logo=google-chrome&logoColor=white)](https://domindev.com)
[![Email](https://img.shields.io/badge/Email-contact@domindev.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:contact@domindev.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Paweł_Dominiak-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/p-dominiak-pd/)
[![GitHub](https://img.shields.io/badge/GitHub-DominDev-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DominDev)
[![Instagram](https://img.shields.io/badge/Instagram-domindev__com-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/domindev_com/)

**Location:** Wrocław, Poland

**Specialization:** High-Performance Web Development, Custom WordPress, WooCommerce, React

---

If you find this project useful, give it a star on GitHub!

</div>
