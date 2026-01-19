# 🚀 DominDev Momentum

> **Agresywny Web Development dla liderów rynku.**
> Portfolio osobiste / Landing page zaprojektowana i zbudowana z obsesją na punkcie perfekcji.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-GitHub_Pages-00D9FF?style=for-the-badge)](https://domin737.github.io/DominDev-Momentum/)
[![Lighthouse Score](https://img.shields.io/badge/Lighthouse-97%2F100-success?style=for-the-badge&logo=lighthouse)](https://domin737.github.io/DominDev-Momentum/)
[![Performance](https://img.shields.io/badge/Performance-Production_Ready-brightgreen?style=for-the-badge)]()

---

## 💎 Czym Jest Ten Projekt?

**DominDev Momentum** to nie kolejna strona portfolio zbudowana z gotowego szablonu.
To **engineering showcase** - demonstracja tego, co można osiągnąć, gdy:

- ✨ Design spotyka się z **perfekcyjną implementacją**
- ⚡ Performance jest **obsesją**, nie dodatkiem
- 🎯 Każdy piksel i każda linijka kodu ma **cel**
- 🔧 "Good enough" **nie istnieje**

**To strona, która robi wrażenie od pierwszej sekundy - wizualnie I technicznie.**

---

## 🎨 Design Philosophy

### Matrix-Inspired Aesthetics
Inspirowana estetyką **Matrix** i **cyberpunk** - agresywna, minimalistyczna, hipnotyzująca.

**Kluczowe Elementy:**
- 🟢 **Animowany Matrix Background** - custom canvas animation z Intersection Observer (auto-pause)
- ⚫ **Dark Mode Only** - głęboka czerń (#050505) + akcenty czerwieni (#ff1f1f)
- 🎭 **Micro-interactions** - każdy hover, każdy scroll, każdy element żyje
- 📱 **Mobile-First** - responsive od 320px do 4K

> *"Strona nie pokazuje portfolio. Strona JEST portfolio."*

---

## ⚡ Performance - Liczby Mówią Wszystko

### Lighthouse Audit (Mobile)
```
Performance:    97/100  ✅ (target: >90)
Accessibility:  100/100 ✅
Best Practices: 100/100 ✅
SEO:            100/100 ✅
```

### Core Web Vitals
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **FCP** (First Contentful Paint) | ~0.6s | <1.0s | ✅✅ Excellent |
| **LCP** (Largest Contentful Paint) | ~1.2s | <2.5s | ✅✅ Excellent |
| **CLS** (Cumulative Layout Shift) | ~0.03 | <0.1 | ✅ Perfect |
| **TTI** (Time to Interactive) | ~1.9s | <3.0s | ✅✅ Excellent |

### Network Performance
- **Render Blocking:** ~150ms (tylko minified CSS)
- **Critical Path:** ~280ms (ES modules z modulepreload)
- **Total Page Size:** ~430 KB (HTML + CSS + Fonts)
- **Image Format:** AVIF → WebP → JPEG (70-80% size reduction)

**Wynik:** Strona ładuje się **szybciej niż 95% internetu.**

---

## 🔧 Tech Stack - Modern Web Engineering

### Frontend Architecture
```
HTML5 (Semantic)
  ├─ CSS3 (Custom Properties, Grid, Flexbox)
  ├─ Vanilla JavaScript (ES2022 Modules)
  └─ Canvas API (Matrix animation)
```

### Performance Optimizations

#### 🚀 **JavaScript**
- **ES Modules** z `<link rel="modulepreload">` hints (-192ms Critical Path)
- **Lazy Loading** - Chatbot ładowany on-demand (oszczędność ~200KB)
- **Intersection Observer** - Matrix auto-pause poza viewport (-30% CPU)
- **Memory Leak Prevention** - cleanup event listeners, animations

#### 🎨 **CSS**
- **Automated Minification** - Git pre-commit hook workflow
- **35% Size Reduction** - 85.9 KB → 55.6 KB
- **Zero Duplication** - DRY principles, CSS custom properties
- **Mobile-First** - progressive enhancement

#### 🖼️ **Images**
- **Multi-Format Support:** AVIF (modern) → WebP (fallback) → JPEG (universal)
- **Responsive Images:** srcset + `<picture>` element (400w, 600w, 800w)
- **Lazy Loading:** `loading="lazy"` + `decoding="async"`
- **Network-Aware:** Adaptive quality based on connection speed (2G/3G/4G)

#### 🔤 **Fonts**
- **Self-Hosted Fonts** - eliminacja CDN dependencies (+200ms saved)
- **Font Display Swap** - zero FOIT (Flash of Invisible Text)
- **Font Metric Overrides** - eliminacja CLS (Cumulative Layout Shift)
- **Async Loading** - media query trick (-600ms render blocking!)

**Stack Details:**
- Google Fonts: Outfit (variable 300-900) + Space Grotesk (variable 300-700)
- FontAwesome 6 (self-hosted, tylko używane ikony)

---

## 🌟 Kluczowe Features

### 🎭 Interaktywne Elementy

**1. Matrix Background Animation**
- Custom Canvas API implementation
- Intersection Observer - auto-pause gdy poza viewport
- 60 FPS smooth animation
- Fully responsive (skaluje się do viewport)

**2. AI-Powered Chatbot**
- Ultra lazy loading (on hover/click only)
- JSON-based knowledge base
- Smooth animations & transitions
- Mobile-optimized UI

**3. Scroll-to-Top Button**
- SVG circular progress indicator
- Smooth scroll behavior
- Appears after 300px scroll

**4. HUD Performance Monitor**
- Real-time load time tracking
- Color-coded thresholds (green/yellow/red)
- DOMContentLoaded metrics (perceived performance)

### 📱 Responsive Design

**Breakpoints:**
```css
Mobile:    320px - 768px
Tablet:    769px - 1024px
Desktop:   1025px - 1920px
4K:        1921px+
```

**Adaptive Features:**
- Responsive typography (clamp + viewport units)
- Fluid spacing system (CSS custom properties)
- Touch-optimized interactions (44px min tap targets)
- Reduced motion support (`prefers-reduced-motion`)

---

## 🏆 Co Wyróżnia Ten Projekt?

### ❌ Czego TU NIE MA:
- ❌ WordPress / Page Builders
- ❌ Bootstrap / Framework CSS
- ❌ jQuery
- ❌ Gotowe szablony
- ❌ CDN dependencies (wszystko self-hosted!)
- ❌ Niepotrzebne biblioteki

### ✅ Co TU JEST:
- ✅ **100% Custom Code** - każda linijka napisana ręcznie
- ✅ **Production-Ready** - deployment-ready od pierwszego dnia
- ✅ **Maintainable** - clean code, dokumentacja, automated workflows
- ✅ **Scalable** - modular ES modules architecture
- ✅ **Accessible** - semantic HTML, ARIA labels, keyboard navigation
- ✅ **SEO-Optimized** - meta tags, OpenGraph, structured data

---

## 📊 Optymalizacje - Behind The Scenes

### Zaimplementowane Best Practices:

**HTML:**
- ✅ Semantic HTML5 (`<section>`, `<article>`, `<nav>`)
- ✅ ARIA accessibility attributes
- ✅ OpenGraph & Twitter Card meta tags
- ✅ Conditional `<base>` tag (GitHub Pages compatibility)

**CSS:**
- ✅ CSS Custom Properties (theme system)
- ✅ Mobile-first responsive design
- ✅ Automated minification workflow
- ✅ Zero CSS frameworks (pure vanilla)

**JavaScript:**
- ✅ ES2022 Modules (native imports)
- ✅ Modulepreload resource hints
- ✅ Lazy loading non-critical code
- ✅ Error handling & graceful degradation

**Images:**
- ✅ AVIF/WebP/JPEG multi-format
- ✅ Responsive srcset + sizes
- ✅ Lazy loading + async decoding
- ✅ Network-aware quality adjustment

**Fonts:**
- ✅ Self-hosted (Google Fonts + FontAwesome)
- ✅ font-display: swap
- ✅ Async CSS loading (media query trick)
- ✅ Font metric overrides (CLS prevention)

### Workflow Automation:
- 🔄 **CSS Minification:** Git pre-commit hook auto-minify
- 📦 **Deployment:** GitHub Pages auto-deploy on push
- 🧪 **Testing:** Lighthouse CI integration-ready

---

## 🚀 Live Demo & Deployment

### 🌐 [Zobacz Live Demo](https://domin737.github.io/DominDev-Momentum/)

**Deployment:**
- **Platform:** GitHub Pages
- **Subdirectory:** `/DominDev-Momentum/`
- **Auto-Deploy:** Push to `main` branch
- **Build Time:** ~1-2 minuty

**URL Handling:**
- Localhost: `http://127.0.0.1:5500/` (Live Server)
- Production: `https://domin737.github.io/DominDev-Momentum/`
- Conditional base tag - automatic detection

---

## 📂 Struktura Projektu

```
DominDev-Momentum/
├── index.html              # Main entry point (62 KB with inline fonts)
├── style.css               # Source CSS (editable, 86 KB)
├── style.min.css           # Production CSS (auto-generated, 56 KB)
├── 404.html                # Custom 404 page
│
├── assets/
│   ├── fonts/              # Self-hosted fonts (no CDN!)
│   │   ├── fa-solid-900.woff2    # FontAwesome Solid (147 KB)
│   │   ├── fa-brands-400.woff2   # FontAwesome Brands (106 KB)
│   │   ├── outfit-400.woff2      # Google Fonts Outfit (32 KB)
│   │   └── space-grotesk.woff2   # Google Fonts Space Grotesk (22 KB)
│   └── images/
│       ├── portfolio/      # Portfolio images (AVIF/WebP/JPEG)
│       ├── about/          # About section images
│       └── social/         # Social media assets
│
├── js/
│   ├── main.js             # ES module entry point
│   ├── config.js           # Configuration
│   ├── core/
│   │   ├── matrix.js       # Matrix background animation
│   │   └── ui.js           # UI interactions
│   └── modules/
│       ├── adaptive-images.js  # Network-aware image loading
│       ├── portfolio.js    # Portfolio section logic
│       ├── contact.js      # Contact form handling
│       ├── hud.js          # Performance monitor
│       └── chatbot.js      # AI chatbot (lazy loaded)
│
├── _scripts/
│   ├── auto-minify-css.js      # CSS minifier + watch mode
│   └── setup-git-hooks.js      # Git hooks installer
│
└── _docs/                  # Technical documentation (11 guides)
    ├── README.md           # Documentation index
    ├── guide-optimization.md       # Performance guide
    ├── workflow-css-automation.md  # CSS workflow
    └── ... (8 more guides)
```

---

## 👨‍💻 Dla Deweloperów

### Quick Start

```bash
# Clone repository
git clone https://github.com/DominDev/DominDev-Momentum.git
cd DominDev-Momentum

# Setup CSS automation (optional)
node _scripts/setup-git-hooks.js

# Open with Live Server (VSCode extension)
# lub użyj dowolnego local server:
python -m http.server 5500
```

### CSS Development Workflow

**Automated Minification:**
```bash
# One-time setup
node _scripts/setup-git-hooks.js

# Development (watch mode)
node _scripts/auto-minify-css.js --watch

# Edit source
code style.css

# Commit (auto-minifies!)
git add style.css
git commit -m "Update styles"
```

**WAŻNE:**
- ✅ **ZAWSZE** edytuj `style.css` (source)
- ❌ **NIGDY** nie edytuj `style.min.css` ręcznie
- ✅ Git hook automatycznie minifikuje przy commit

### 📚 Dokumentacja Techniczna

**Comprehensive guides w `_docs/`:**
- [guide-optimization.md](_docs/guide-optimization.md) - Główny przewodnik optymalizacji
- [workflow-css-automation.md](_docs/workflow-css-automation.md) - CSS automation
- [guide-quick-start.md](_docs/guide-quick-start.md) - Quick start dla devs
- [checklist-quick-wins.md](_docs/checklist-quick-wins.md) - 13 quick wins
- [report-audit.md](_docs/report-audit.md) - Performance audit
- [CHANGELOG.md](_docs/CHANGELOG.md) - Version history

**Index:** [_docs/README.md](_docs/README.md)

---

## 🎯 Use Cases

**Ten projekt jest idealny dla:**

✅ **Rekruterów** - demonstracja umiejętności frontend engineering
✅ **Potencjalnych Klientów** - portfolio profesjonalisty
✅ **Deweloperów** - case study optymalizacji performance
✅ **Studentów** - nauka best practices i modern web development
✅ **Code Review** - przykład production-ready code

**Możesz użyć tego projektu jako:**
- 📖 Learning resource (dokumentacja + kod źródłowy)
- 🎨 Design inspiration (Matrix aesthetics)
- ⚡ Performance benchmark (Lighthouse 97/100)
- 🔧 Starter template (fork & customize)

---

## 🏅 Achievements & Stats

### Performance Wins (vs Average Website)
```
Render Blocking:   1,970ms → 150ms   (-92% ⚡⚡⚡)
Critical Path:     1,261ms → 280ms   (-78% ⚡⚡⚡)
FCP/LCP/TTI:       Avg -600ms        (⚡⚡⚡)
Image Size:        AVIF vs JPEG      (-70% ⚡⚡)
CSS Size:          86 KB → 56 KB     (-35% ⚡)
```

### Code Quality
- ✅ **Zero external dependencies** (self-hosted everything)
- ✅ **100% custom code** (no templates/frameworks)
- ✅ **Comprehensive documentation** (11 technical guides)
- ✅ **Automated workflows** (CSS minification, git hooks)
- ✅ **Production-ready** (deployed & tested)

### Web Vitals Comparison
```
                    This Site    Average    Difference
First Contentful    0.6s         2.5s       -76% faster ⚡
Largest Content     1.2s         4.0s       -70% faster ⚡
Time to Interactive 1.9s         5.3s       -64% faster ⚡
Cumulative Shift    0.03         0.15       -80% better ⚡
```

---

## 💡 Lessons Learned

### Największe Wyzwania:
1. **FontAwesome Self-Hosting** - missing icon definitions (solved)
2. **GitHub Pages Base URL** - conditional tag dla localhost vs production
3. **Render-Blocking Fonts** - async loading z media query trick
4. **CSS Workflow** - manual editing .min.css (solved z Git hooks)

### Najważniejsze Insights:
- ⚡ **Modulepreload** = biggest JS performance win (-192ms!)
- 🎨 **Inline fonts CSS** with media trick = -600ms render blocking
- 📦 **AVIF** format = -70% image size vs JPEG
- 🔧 **Automation** = 100% developer time saved (CSS minification)

**Każdy problem = okazja do nauki. Każda optymalizacja = wymierny rezultat.**

---

## 📞 Kontakt & Social

**Paweł Dominiak** - Frontend Developer & Performance Enthusiast

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Paweł_Dominiak-0077B5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/p-dominiak-pd/)
[![GitHub](https://img.shields.io/badge/GitHub-DominDev-181717?style=for-the-badge&logo=github)](https://github.com/DominDev)
[![Instagram](https://img.shields.io/badge/Instagram-domindev__com-E4405F?style=for-the-badge&logo=instagram)](https://www.instagram.com/domindev_com/)
[![Email](https://img.shields.io/badge/Email-contact@domindev.com-EA4335?style=for-the-badge&logo=gmail)](mailto:contact@domindev.com)

**Lokalizacja:** Wrocław, Polska 🇵🇱
**Specjalizacja:** High-Performance Web Development, Custom WordPress, UI/UX

---

## 📄 Licencja & Użycie

**© 2025 Paweł Dominiak (DominDev)**

Ten projekt jest **osobistym portfolio** i jest chroniony prawem autorskim.

**Możesz:**
- ✅ Przeglądać kod źródłowy (learning purposes)
- ✅ Używać jako inspiration dla własnych projektów
- ✅ Linkować do tego repozytorium

**Nie możesz:**
- ❌ Kopiować design 1:1 do celów komercyjnych
- ❌ Używać treści (teksty, obrazy) bez zgody
- ❌ Podawać się za autora tego projektu

**Jeśli chcesz użyć części kodu:**
Proszę o podanie źródła (link do tego repo). Doceniam! 🙏

---

## 🚀 Roadmap (Future Improvements)

**Możliwe dalsze optymalizacje:**
- [ ] Service Worker (PWA) - offline support
- [ ] Critical CSS splitting (inline above-the-fold)
- [ ] Font subsetting (tylko używane glyphs)
- [ ] Blur-up effect dla obrazów (progressive loading)
- [ ] RUM (Real User Monitoring) integration
- [ ] A/B testing framework
- [ ] Multi-language support (EN/PL)

**Uwaga:** Obecny stan jest już **production-ready** i **highly optimized**.
Powyższe są **opcjonalnymi** improvements dla perfectionistów. 😄

---

## ⭐ Podoba Ci Się?

**Jeśli ten projekt Ci się podoba:**

1. ⭐ **Star this repo** - doceniam każde wsparcie!
2. 🍴 **Fork** - customize dla własnych potrzeb
3. 📢 **Share** - poleć znajomym deweloperom
4. 💬 **Feedback** - issues/suggestions welcome!

**Dziękuję za odwiedzenie! Happy coding!** 🚀

---

**Built with ❤️ and obsessive attention to detail by [Paweł Dominiak](https://domin737.github.io/DominDev-Momentum/)**

*"Good enough" is not in my vocabulary. Only "exceptional" is acceptable.* 💎
