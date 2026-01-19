# DominDev Momentum

> **High-Performance Portfolio Landing Page** — A Matrix-inspired showcase of modern web engineering excellence.

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://domin737.github.io/DominDev-Momentum/)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-97%2F100-brightgreen?style=for-the-badge&logo=lighthouse&logoColor=white)](https://pagespeed.web.dev/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://www.w3.org/html/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![JavaScript](https://img.shields.io/badge/ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

[**Live Demo**](https://domin737.github.io/DominDev-Momentum/) • [**Contact**](mailto:contact@domindev.com)

---

## About

**DominDev Momentum** is not just another portfolio website built from templates. It's an **engineering showcase** demonstrating what can be achieved when design meets perfect implementation, and performance becomes an obsession rather than an afterthought.

This project showcases expertise in:
- Modern frontend architecture with vanilla JavaScript ES modules
- Advanced CSS techniques (Grid, Flexbox, custom properties)
- Performance optimization achieving top-tier Lighthouse scores
- Accessible, SEO-optimized semantic HTML5 structure

### Key Features

| Feature | Description |
|---------|-------------|
| **Matrix Canvas Animation** | Custom canvas-based falling character effect with Intersection Observer for auto-pause when off-viewport |
| **Adaptive Image Loading** | Network-aware system that adjusts image quality based on connection speed (2G/3G/4G) |
| **Performance-First Architecture** | ES modules with `modulepreload` hints reducing critical path by 192ms |
| **On-Demand Chatbot** | Lazy-loaded AI chatbot module (~200KB saved from initial payload) |
| **Self-Hosted Typography** | Outfit and Space Grotesk fonts with font-display swap and fallback metrics |
| **Responsive Design** | Mobile-first approach supporting 320px to 4K displays |
| **Automated Build Pipeline** | CSS/JS minification via npm scripts and Git pre-commit hooks |
| **WCAG 2.1 AA Compliance** | Keyboard navigation, focus management, color contrast ratios >4.5:1 |
| **Modern Image Formats** | Multi-format support (AVIF → WebP → JPEG) with responsive srcset |
| **Schema.org Structured Data** | Rich JSON-LD markup for enhanced search engine visibility |

---

## Performance & Quality

### Lighthouse Scores

| Category | Score | Status |
|----------|-------|--------|
| **Performance** | 97/100 | Excellent |
| **Accessibility** | 100/100 | Perfect |
| **Best Practices** | 100/100 | Perfect |
| **SEO** | 100/100 | Perfect |

### Core Web Vitals

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **FCP** (First Contentful Paint) | ~0.6s | <1.0s | Excellent |
| **LCP** (Largest Contentful Paint) | ~1.2s | <2.5s | Excellent |
| **CLS** (Cumulative Layout Shift) | ~0.03 | <0.1 | Perfect |
| **TTI** (Time to Interactive) | ~1.9s | <3.0s | Excellent |

### Optimizations Applied

- **JavaScript**: ES modules with `modulepreload`, lazy-loaded non-critical modules, memory leak prevention
- **CSS**: Automated minification (86KB → 56KB, 35% reduction), DRY principles with custom properties
- **Images**: AVIF/WebP/JPEG pipeline, responsive `srcset`, `loading="lazy"`, network-aware quality
- **Fonts**: Self-hosted WOFF2, async loading via media query trick (600ms render-blocking eliminated)
- **Critical Path**: Module preloading reduces JS chain from 472ms to ~280ms (-192ms)

---

## Tech Stack

| Category | Technologies | Rationale |
|----------|-------------|-----------|
| **Markup** | HTML5 (Semantic) | SEO-friendly, accessible, single H1 per view |
| **Styling** | CSS3 (Grid, Flexbox, Custom Properties) | No framework overhead, full control |
| **Scripting** | Vanilla JavaScript (ES2022 Modules) | Minimal bundle size, native performance |
| **Animation** | Canvas API | Matrix rain effect with optimized frame rate |
| **Build Tools** | Node.js, Sharp | Image optimization, CSS/JS minification |
| **Typography** | Outfit, Space Grotesk (self-hosted) | Zero CDN dependencies |
| **Icons** | Font Awesome 6 Free (self-hosted) | Consistent, scalable icons |
| **Deployment** | GitHub Pages | Free hosting, automatic HTTPS |

### Architecture

```
domindev-momentum/
├── index.html              # Main entry point (semantic HTML5)
├── 404.html                # Custom error page with Matrix theme
├── style.css               # Source styles (CSS custom properties)
├── style.min.css           # Production minified CSS
├── style-404.css           # Error page styles
│
├── js/
│   ├── main.js             # Entry point (ES module)
│   ├── config.js           # Runtime configuration
│   ├── core/
│   │   ├── matrix.js       # Canvas animation engine
│   │   └── ui.js           # UI interactions, cursor
│   └── modules/
│       ├── adaptive-images.js  # Network-aware image loading
│       ├── chatbot.js          # Lazy-loaded AI chat
│       ├── contact.js          # Form handling
│       ├── hud.js              # HUD overlay effects
│       ├── maintenance.js      # Maintenance mode
│       └── portfolio.js        # Gallery interactions
│
├── assets/
│   ├── fonts/              # Self-hosted Outfit, Space Grotesk, Font Awesome
│   └── images/
│       ├── about/          # Profile images (AVIF/WebP/JPEG)
│       ├── portfolio/      # Project screenshots
│       ├── social/         # OG images
│       └── icons/          # Favicons
│
├── data/
│   └── chatbot-db.json     # Chatbot knowledge base
│
├── _scripts/
│   ├── minify-css.js       # CSS minification
│   ├── minify-js.js        # JS minification
│   ├── optimize-images.js  # Sharp-based image pipeline
│   ├── watch.js            # Development file watcher
│   └── setup-git-hooks.js  # Pre-commit hook installer
│
└── _docs/                  # Project documentation & reports
```

### Why This Stack?

1. **Zero Framework Overhead**: Vanilla JS provides maximum performance without React/Vue bundle costs
2. **Native Browser APIs**: ES modules, Intersection Observer, Canvas API for future-proof code
3. **Full Control**: Custom CSS without Tailwind/Bootstrap constraints enables pixel-perfect design
4. **Progressive Enhancement**: Core content accessible even with JavaScript disabled

---

## Accessibility

This project prioritizes inclusive design following **WCAG 2.1 Level AA** guidelines:

- **Semantic HTML5** structure with proper heading hierarchy
- **Keyboard navigation** support throughout all interactive elements
- **Focus management** for modals, menus, and dynamic content
- **Color contrast** ratios exceeding 4.5:1 for text
- **`prefers-reduced-motion`** support for animation-sensitive users
- **Screen reader friendly** with ARIA labels where needed
- **Skip links** for navigation efficiency

---

## Getting Started

### Prerequisites

- **Node.js 18+** (for build tools)
- **Modern browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Installation

```bash
# Clone the repository
git clone https://github.com/DominDev/DominDev-Momentum.git
cd DominDev-Momentum

# Install dependencies
npm install

# Start development (simply open index.html in browser)
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Full production build (images + CSS minification) |
| `npm run minify` | Minify CSS files only |
| `npm run optimize:images` | Generate AVIF/WebP/JPEG variants |
| `npm run watch` | Watch for file changes during development |
| `npm run help` | Display available commands |

### Development Workflow

1. **CSS Development**: Edit `style.css`, run `npm run minify` to generate `style.min.css`
2. **Image Optimization**: Place originals in `assets/images/*/originals/`, run `npm run optimize:images`
3. **Git Hooks**: Pre-commit hooks auto-minify CSS on commit (setup via `_scripts/setup-git-hooks.js`)

---

## Deployment

### GitHub Pages

The project is configured for GitHub Pages deployment:

1. Push changes to `main` branch
2. GitHub Actions automatically deploys to `https://[username].github.io/DominDev-Momentum/`
3. Conditional base tag handles localhost vs production URLs automatically

### Custom Domain

To use a custom domain:

1. Add `CNAME` file with your domain (e.g., `domindev.com`)
2. Configure DNS records at your registrar
3. Enable HTTPS in GitHub Pages settings

### Manual Deployment

For other hosting platforms:

```bash
# Build for production
npm run build

# Upload contents to your hosting provider
# Ensure .htaccess or equivalent handles caching headers
```

---

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | Fully supported |
| Firefox | 88+ | Fully supported |
| Safari | 14+ | Fully supported |
| Edge | 90+ | Fully supported |
| Opera | 76+ | Fully supported |
| Mobile Safari | iOS 14+ | Fully supported |
| Chrome Android | 90+ | Fully supported |

---

## Roadmap

- [ ] Dark/Light mode toggle with system preference detection
- [ ] Internationalization (i18n) with EN/PL language support
- [ ] Blog section with markdown-based content
- [ ] Service Worker for offline functionality
- [ ] Analytics dashboard integration
- [ ] A/B testing framework for conversion optimization

---

## License

This project uses a **dual-license structure**:

| Component | License | Usage |
|-----------|---------|-------|
| **Code** (HTML, CSS, JS) | MIT License | Free to use, modify, distribute |
| **Assets** (images, logos, content) | All Rights Reserved | Requires explicit permission |

See [LICENSE](LICENSE) for full details.

### What You Can Do

- Learn from the code architecture and techniques
- Fork for personal projects and experimentation
- Reference in educational content
- Use as inspiration for your own designs

### What Requires Permission

- Using brand assets, logos, or trademarks
- Copying design 1:1 for commercial purposes
- Redistributing assets in templates or UI kits

---

## Author

<div align="center">

**Crafted with precision by DominDev**

*Building digital experiences that convert.*

[![Website](https://img.shields.io/badge/Website-domindev.com-FF1F1F?style=for-the-badge&logo=google-chrome&logoColor=white)](https://domindev.com)
[![Email](https://img.shields.io/badge/Email-contact@domindev.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:contact@domindev.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/p-dominiak-pd/)
[![GitHub](https://img.shields.io/badge/GitHub-DominDev-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DominDev)

---

**If you find this project useful, consider giving it a star!**

</div>
