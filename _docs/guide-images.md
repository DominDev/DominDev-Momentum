---
title: Image Optimization Guide
created: 2025-11-18
updated: 2025-11-29
status: current
type: implementation-guide
tags: [images, avif, webp, responsive]
---

# 📸 KOMPLEKSOWY PLAN OPTYMALIZACJI OBRAZÓW I HIGH-PERFORMANCE

**Data audytu:** 2025-11-29
**Projekt:** DominDev Momentum
**Zakres:** Optymalizacja obrazów, fontów, responsywności i Core Web Vitals

---

## 📊 EXECUTIVE SUMMARY - WYNIKI AUDYTU

### ✅ MOCNE STRONY (Co już działa dobrze)

1. **Responsive Images Implementation** ⭐⭐⭐⭐⭐
   - Perfekcyjne użycie `<picture>` + `srcset` + `sizes`
   - 3 formaty: AVIF → WebP → JPEG (modern → legacy fallback)
   - 4 rozmiary breakpointów: 400w, 800w, 1200w, 1600w
   - Attribute `loading="lazy"` na wszystkich obrazach poza LCP

2. **Network-Aware Loading** ⭐⭐⭐⭐⭐
   - Zaawansowany moduł `adaptive-images.js`
   - Automatyczna detekcja 4G/3G/2G/Save-Data
   - Dynamiczne dostosowanie jakości obrazów do połączenia

3. **LCP Optimization** ⭐⭐⭐⭐
   - `preload` dla krytycznego obrazu About section
   - AVIF z srcset w preload (linie 321-333 HTML)

4. **Font Loading Strategy** ⭐⭐⭐
   - Google Fonts z `display=swap`
   - Preconnect do fonts.googleapis.com i fonts.gstatic.com
   - DNS prefetch jako fallback

5. **Struktura plików obrazów** ⭐⭐⭐⭐⭐
   - Katalogi `originals/` + zoptymalizowane warianty
   - Systematyczne nazewnictwo
   - README z workflow

---

## 🚨 KRYTYCZNE PROBLEMY DO NAPRAWY

### 1. ❌ FONT AWESOME Z CDN - LIGHTHOUSE WARNING

**Problem:**
```
FontAwesome z Cloudflare CDN (linie 342-353 HTML):
- fa-brands-400.woff2: 100ms opóźnienie
- fa-solid-900.woff2: 60ms opóźnienie
- fa-regular-400.woff2: 40ms opóźnienie
Brak font-display: swap → potencjalny FOIT (Flash of Invisible Text)
```

**Wpływ na performance:**
- FCP (First Contentful Paint): +200ms
- CLS potencjalny skok podczas ładowania ikon
- Zewnętrzne DNS lookup + TLS handshake
- Blocking rendering

**Rozwiązanie (PRIORYTET #1):**

#### Opcja A: Self-Host FontAwesome z optymalizacją (ZALECANE)
```bash
# 1. Instalacja FontAwesome lokalnie
npm install --save @fortawesome/fontawesome-free

# 2. Kopiuj TYLKO potrzebne fonty do assets/fonts/
cp node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2 assets/fonts/
cp node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-400.woff2 assets/fonts/

# 3. Dodaj custom CSS z font-display: swap
```

**Custom CSS (dodaj do style.css):**
```css
/* FontAwesome Self-Hosted z optymalizacją */
@font-face {
  font-family: 'Font Awesome 6 Free';
  font-style: normal;
  font-weight: 900;
  font-display: swap; /* ← KLUCZOWE! */
  src: url('../fonts/fa-solid-900.woff2') format('woff2');
}

@font-face {
  font-family: 'Font Awesome 6 Brands';
  font-style: normal;
  font-weight: 400;
  font-display: swap; /* ← KLUCZOWE! */
  src: url('../fonts/fa-brands-400.woff2') format('woff2');
}

/* Font metric overrides dla layout shift prevention */
@font-face {
  font-family: 'Font Awesome 6 Free Fallback';
  src: local('Arial');
  size-adjust: 100%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}

.fa-solid, .fas {
  font-family: 'Font Awesome 6 Free', 'Font Awesome 6 Free Fallback', sans-serif;
  font-weight: 900;
}

.fa-brands, .fab {
  font-family: 'Font Awesome 6 Brands', 'Font Awesome 6 Free Fallback', sans-serif;
  font-weight: 400;
}
```

**Usunięcie z HTML (linie 342-353):**
```html
<!-- ❌ USUŃ TO: -->
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
  media="print"
  onload="this.media='all'"
/>
```

**Oczekiwane rezultaty:**
- ✅ Oszczędność 200ms na FCP
- ✅ Eliminacja zewnętrznego DNS lookup
- ✅ Font-display: swap = brak FOIT
- ✅ CLS reduction przez font metric overrides
- ✅ Lighthouse warning znika

#### Opcja B: Zamiana ikon na inline SVG (NAJLEPSZA DLA PERFORMANCE)
```html
<!-- Zamiast: <i class="fa-solid fa-rocket"></i> -->
<svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
  <path d="M156.6 384.9L125.7 354c-8.5-8.5-11.5-20.8-7.7-32.2c3-8.9 7-20.5 11.8-33.8L24 288c-8.6 0-16.6-4.6-20.9-12.1s-4.2-16.7 .2-24.1l52.5-88.5c13-21.9 36.5-35.3 61.9-35.3l82.3 0c2.4-4 4.8-7.7 7.2-11.3C289.1-4.1 411.1-8.1 483.9 5.3c11.6 2.1 20.6 11.2 22.8 22.8c13.4 72.9 9.3 194.8-111.4 276.7c-3.5 2.4-7.3 4.8-11.3 7.2v82.3c0 25.4-13.4 49-35.3 61.9l-88.5 52.5c-7.4 4.4-16.6 4.5-24.1 .2s-12.1-12.2-12.1-20.9V380.8c-14.1 4.9-26.4 8.9-35.7 11.9c-11.2 3.6-23.4 .5-31.8-7.8zM384 168a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"/>
</svg>
```

**Zalety inline SVG:**
- Zero dodatkowych requestów HTTP
- Zero renderowania blokującego
- Pełna kontrola nad kolorem/rozmiarem przez CSS
- CLS = 0 (ikona renderuje się natychmiast)
- Doskonała performance dla ikon używanych 1-2 razy

**Kiedy używać SVG vs Font:**
- **SVG:** Ikony używane < 5 razy na stronie
- **Font:** Ikony używane wielokrotnie (> 10 razy)

---

### 2. ⚠️ GOOGLE FONTS - MOŻLIWA DALSZA OPTYMALIZACJA

**Aktualny stan:**
```html
<!-- Linia 336-339 -->
<link
  href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&family=Space+Grotesk:wght@300;500;700&display=swap"
  rel="stylesheet"
/>
```

**Co jest dobre:**
- ✅ `display=swap` już dodany
- ✅ `preconnect` do fonts.googleapis.com

**Co można poprawić:**

#### Opcja A: Self-Host Google Fonts (ZALECANE dla max performance)

**Dlaczego:**
- Eliminacja zewnętrznego DNS lookup (50-150ms oszczędności)
- Pełna kontrola nad cache
- Brak GDPR concerns (Google Fonts = tracking IP)
- Możliwość wdrożenia font metric overrides

**Implementacja:**

1. **Pobierz fonty lokalnie:**
```bash
# Użyj google-webfonts-helper: https://gwfh.mranftl.com/fonts
# Lub zainstaluj paczkę:
npm install @fontsource/outfit @fontsource/space-grotesk
```

2. **Skopiuj pliki .woff2 do assets/fonts/:**
```
assets/fonts/
├── outfit-300.woff2
├── outfit-400.woff2
├── outfit-700.woff2
├── outfit-900.woff2
├── space-grotesk-300.woff2
├── space-grotesk-500.woff2
└── space-grotesk-700.woff2
```

3. **Dodaj @font-face z font metric overrides:**

```css
/* === OUTFIT FONT FAMILY === */

/* Fallback font z metric overrides (dla layout shift prevention) */
@font-face {
  font-family: 'Outfit Fallback';
  src: local('Arial');
  size-adjust: 102.5%; /* Outfit jest nieco większy od Arial */
  ascent-override: 95%;
  descent-override: 25%;
  line-gap-override: 0%;
}

/* Outfit Regular (400) */
@font-face {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../fonts/outfit-400.woff2') format('woff2');
}

/* Outfit Light (300) */
@font-face {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url('../fonts/outfit-300.woff2') format('woff2');
}

/* Outfit Bold (700) */
@font-face {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('../fonts/outfit-700.woff2') format('woff2');
}

/* Outfit Black (900) */
@font-face {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url('../fonts/outfit-900.woff2') format('woff2');
}

/* === SPACE GROTESK FONT FAMILY === */

/* Fallback font z metric overrides */
@font-face {
  font-family: 'Space Grotesk Fallback';
  src: local('Arial');
  size-adjust: 98%;
  ascent-override: 92%;
  descent-override: 23%;
  line-gap-override: 0%;
}

/* Space Grotesk Light (300) */
@font-face {
  font-family: 'Space Grotesk';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url('../fonts/space-grotesk-300.woff2') format('woff2');
}

/* Space Grotesk Medium (500) */
@font-face {
  font-family: 'Space Grotesk';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('../fonts/space-grotesk-500.woff2') format('woff2');
}

/* Space Grotesk Bold (700) */
@font-face {
  font-family: 'Space Grotesk';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('../fonts/space-grotesk-700.woff2') format('woff2');
}

/* === CSS VARIABLES UPDATE === */
:root {
  --font-main: "Space Grotesk", "Space Grotesk Fallback", sans-serif;
  --font-display: "Outfit", "Outfit Fallback", sans-serif;
}
```

4. **Usuń z HTML:**
```html
<!-- ❌ USUŃ linie 311-317 i 336-339 -->
<!-- dns-prefetch, preconnect i link do Google Fonts -->
```

**Oczekiwane rezultaty:**
- ✅ FCP: -100-150ms (eliminacja DNS lookup)
- ✅ CLS: ~0 (font metric overrides)
- ✅ GDPR compliance
- ✅ Pełna kontrola nad cache timing

#### Opcja B: Font subsetting (jeśli zostajemy na Google Fonts)

**Ograniczenie charset do potrzebnych znaków:**
```html
<!-- Zamiast pobierać pełne fonty (Latin + Latin-ext + Cyrillic itp.) -->
<link
  href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&family=Space+Grotesk:wght@300;500;700&display=swap&subset=latin"
  rel="stylesheet"
/>
```

**Oszczędność:** ~30-50% rozmiaru fontu

---

### 3. ⚠️ BRAK BLUR-UP EFFECT (PROGRESSIVE IMAGE LOADING)

**Aktualny stan:**
- `loading="lazy"` działa dobrze
- `adaptive-images.js` dopasowuje jakość do sieci
- ❌ BRAK efektu "blur-up" podczas ładowania obrazów

**Problem:**
Użytkownik widzi puste białe/czarne miejsca podczas ładowania obrazów → gorsze UX.

**Rozwiązanie: Implementacja Blur-Up Technique**

#### Metoda 1: Base64 Placeholder (ZALECANE - łatwe)

**Dodaj do każdego `<img>`:**
```html
<img
  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 450'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage filter='url(%23b)' width='100%25' height='100%25' href='data:image/jpeg;base64,/9j/4AAQSkZJRg...'/%3E%3C/svg%3E"
  data-src="assets/images/portfolio/portfolio-kraft-800.jpg"
  srcset="..."
  alt="..."
  class="lazy-blur"
  loading="lazy"
/>
```

**JavaScript (dodaj do adaptive-images.js):**
```javascript
// Dodaj na końcu initAdaptiveImages()
initBlurUpEffect();

function initBlurUpEffect() {
  const lazyImages = document.querySelectorAll('img.lazy-blur');

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;

        // Załaduj prawdziwy obraz
        const realSrc = img.dataset.src || img.src;
        const tempImg = new Image();

        tempImg.onload = () => {
          img.src = realSrc;
          img.classList.add('loaded');
        };

        tempImg.src = realSrc;
        observer.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imageObserver.observe(img));
}
```

**CSS (dodaj do style.css):**
```css
img.lazy-blur {
  filter: blur(20px);
  transform: scale(1.1);
  transition: filter 0.4s ease-out, transform 0.4s ease-out;
}

img.lazy-blur.loaded {
  filter: blur(0);
  transform: scale(1);
}
```

#### Metoda 2: LQIP (Low Quality Image Placeholder) - ZAAWANSOWANA

**Generuj małe (20px szerokości) blur placeholdery:**
```bash
# Dodaj do skryptu optimize-images.js
sharp(inputFile)
  .resize(20) // Bardzo mały
  .blur(5)
  .toFormat('webp', { quality: 30 })
  .toFile(`${baseName}-placeholder.webp`);
```

**Użycie w HTML:**
```html
<picture>
  <source
    type="image/avif"
    srcset="kraft-400.avif 400w, kraft-800.avif 800w, ..."
  />
  <img
    src="kraft-placeholder.webp"
    data-srcset="kraft-400.jpg 400w, kraft-800.jpg 800w, ..."
    class="lazy-progressive"
    loading="lazy"
  />
</picture>
```

**Oczekiwane rezultaty:**
- ✅ Lepsze UX (smooth fade-in zamiast "pop-in")
- ✅ Percepcyjne przyspieszenie ładowania
- ✅ LCP może się nieznacznie poprawić

---

### 4. ⚠️ RESPONSYWNOŚĆ - RETINA DISPLAYS

**Aktualny stan:**
- Breakpointy: 400w, 800w, 1200w, 1600w ✅
- `sizes` attribute dobrze skonfigurowany ✅
- ❌ Brak specjalnej obsługi Retina (2x, 3x DPR)

**Problem:**
iPhone 14 Pro ma DPR = 3x (Device Pixel Ratio)
→ viewport 430px × 932px, ale fizycznie 1290px × 2796px
→ przeglądarka pobiera obraz 800w, ale powinien 1200w dla sharp rendering

**Rozwiązanie:**

#### A. Rozszerz srcset o większe rozmiary dla Retina

**Dodaj warianty 2400w i 3200w:**
```javascript
// W optimize-images.js - dodaj do SIZES array:
const SIZES = [400, 800, 1200, 1600, 2400, 3200];

// Wygeneruje:
// kraft-400.avif 400w   → Mobile 1x
// kraft-800.avif 800w   → Mobile 2x / Tablet 1x
// kraft-1200.avif 1200w → Mobile 3x / Tablet 2x / Desktop 1x
// kraft-1600.avif 1600w → Desktop 1x Large
// kraft-2400.avif 2400w → Desktop 2x (Retina MacBook)
// kraft-3200.avif 3200w → Desktop 2x 4K / 3x iPads
```

**Update HTML srcset:**
```html
<source
  type="image/avif"
  srcset="
    assets/images/portfolio/portfolio-kraft-400.avif 400w,
    assets/images/portfolio/portfolio-kraft-800.avif 800w,
    assets/images/portfolio/portfolio-kraft-1200.avif 1200w,
    assets/images/portfolio/portfolio-kraft-1600.avif 1600w,
    assets/images/portfolio/portfolio-kraft-2400.avif 2400w,
    assets/images/portfolio/portfolio-kraft-3200.avif 3200w
  "
  sizes="(max-width: 480px) 95vw, (max-width: 768px) 90vw, (max-width: 1200px) 45vw, 600px"
/>
```

**UWAGA:** To zwiększy liczbę wariantów z 12 do 18 plików na obraz!

#### B. Alternatywa: Image-set() dla Retina (CSS background images)

**Jeśli używasz obrazów jako background (obecnie NIE, ale na przyszłość):**
```css
.hero-bg {
  background-image: image-set(
    url('hero-1200.avif') 1x,
    url('hero-2400.avif') 2x,
    url('hero-3600.avif') 3x
  );
}
```

#### C. Zalecenie: Zostaw jak jest dla AVIF

**Powód:** AVIF ma tak dobrą kompresję, że różnica między 1600w a 2400w jest minimalna:
- 1600w AVIF = ~80KB
- 2400w AVIF = ~120KB (+40KB)

Ale rendering quality gain = minimalny dla ludzkiego oka.

**Rekomendacja:**
- ✅ Zostaw obecne 400-1600w dla AVIF/WebP
- ⚠️ Dodaj OPCJONALNIE 2400w TYLKO dla hero/LCP image
- ❌ NIE dodawaj 3200w (overkill, marnowanie bandwidth)

---

### 5. ✅ OBRAZY - DOBRE PRAKTYKI (Kontynuuj)

**Co już robisz świetnie:**

1. **Multi-format responsive images**
   ```html
   <picture>
     <source type="image/avif" srcset="..." />
     <source type="image/webp" srcset="..." />
     <img src="fallback.jpg" srcset="..." />
   </picture>
   ```
   → PERFEKCYJNE! ⭐⭐⭐⭐⭐

2. **Lazy loading**
   ```html
   loading="lazy"
   ```
   → Świetnie, ale rozważ blur-up effect

3. **Width/Height attributes**
   ```html
   <img ... width="600" height="450" />
   ```
   → DOSKONAŁE! Zapobiega CLS (Cumulative Layout Shift)

4. **Preload LCP image**
   ```html
   <link rel="preload" as="image" type="image/avif" href="..." />
   ```
   → EXCELLENT! LCP optimization ⭐⭐⭐⭐⭐

---

## 📋 PRIORYTETOWY PLAN DZIAŁANIA

### FAZA 1: KRYTYCZNE POPRAWKI (1-2 dni) 🔴

#### Task 1.1: Self-Host FontAwesome
**Czas:** 2-3h
**Złożoność:** Średnia
**Impact:** 🟢🟢🟢 High

**Kroki:**
1. ✅ Pobierz FontAwesome Free z CDN lub npm
2. ✅ Skopiuj .woff2 pliki do `assets/fonts/`
3. ✅ Dodaj `@font-face` z `font-display: swap` do CSS
4. ✅ Dodaj font metric overrides dla fallback
5. ✅ Usuń `<link>` do CDN z HTML
6. ✅ Test na Chrome/Firefox/Safari
7. ✅ Lighthouse audit przed/po

**Walidacja sukcesu:**
- [ ] Lighthouse warning znikł
- [ ] FCP poprawił się o > 100ms
- [ ] Zero external font requests w Network tab
- [ ] Ikony renderują się poprawnie

---

#### Task 1.2: Self-Host Google Fonts
**Czas:** 3-4h
**Złożoność:** Średnia
**Impact:** 🟢🟢 Medium-High

**Kroki:**
1. ✅ Pobierz Outfit i Space Grotesk z google-webfonts-helper
2. ✅ Skopiuj .woff2 pliki do `assets/fonts/`
3. ✅ Oblicz font metric overrides (tool: https://screenspan.net/fallback)
4. ✅ Dodaj `@font-face` deklaracje z overrides
5. ✅ Update `:root` CSS variables
6. ✅ Usuń preconnect i Google Fonts link z HTML
7. ✅ Test typografii na całej stronie
8. ✅ Lighthouse audit przed/po

**Walidacja sukcesu:**
- [ ] FCP poprawił się o > 80ms
- [ ] CLS = 0 podczas ładowania fontów
- [ ] Typografia wygląda identycznie jak przed
- [ ] Zero external font requests

---

### FAZA 2: ZAAWANSOWANE OPTYMALIZACJE (2-3 dni) 🟡

#### Task 2.1: Implementacja Blur-Up Effect
**Czas:** 4-5h
**Złożoność:** Średnia
**Impact:** 🟢 Medium (UX improvement)

**Kroki:**
1. ✅ Wybierz metodę: Base64 SVG placeholder (prostsze) lub LQIP (lepsze)
2. ✅ Jeśli LQIP: extend optimize-images.js o generowanie placeholderów
3. ✅ Dodaj CSS transitions dla `.lazy-blur`
4. ✅ Implementuj IntersectionObserver w adaptive-images.js
5. ✅ Test na slow 3G (Chrome DevTools)
6. ✅ Dopracuj timing transitions

**Walidacja sukcesu:**
- [ ] Obrazy "wyrastają" z blur, nie "pop-in"
- [ ] Smooth transition na wszystkich urządzeniach
- [ ] Performance nie pogorszył się

---

#### Task 2.2: Retina Support (opcjonalnie)
**Czas:** 2h
**Złożoność:** Niska
**Impact:** 🟠 Low-Medium

**Kroki:**
1. ✅ Dodaj 2400w variant TYLKO dla LCP image
2. ✅ Update srcset dla tego obrazu
3. ✅ Test na prawdziwym Retina device
4. ✅ Porównaj file sizes przed/po

**Walidacja sukcesu:**
- [ ] Obraz na Retina wygląda sharper
- [ ] Bandwidth nie wzrósł > 50KB

---

#### Task 2.3: Advanced Lazy Loading Strategies
**Czas:** 3h
**Złożoność:** Średnia
**Impact:** 🟠 Medium

**Rozszerzenie adaptive-images.js:**
```javascript
// Priorytetyzacja ładowania obrazów
const priorityImages = document.querySelectorAll('[data-priority="high"]');
const normalImages = document.querySelectorAll('img:not([data-priority])');

// Załaduj priority images ASAP
priorityImages.forEach(img => {
  img.loading = 'eager';
  if (img.dataset.src) {
    img.src = img.dataset.src;
  }
});

// Lazy load remaining images
const lazyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
      lazyObserver.unobserve(img);
    }
  });
}, {
  rootMargin: '50px' // Start loading 50px before entering viewport
});

normalImages.forEach(img => lazyObserver.observe(img));
```

---

### FAZA 3: MONITORING I FINE-TUNING (ongoing) 🟢

#### Task 3.1: Setup Real User Monitoring (RUM)
**Czas:** 2h
**Złożoność:** Niska
**Impact:** 🟢🟢 High (long-term)

**Implementacja:**
```html
<!-- Google Analytics 4 z Web Vitals -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');

  // Web Vitals tracking
  import {onCLS, onFCP, onLCP, onTTFB} from 'web-vitals';

  function sendToAnalytics({name, delta, id}) {
    gtag('event', name, {
      event_category: 'Web Vitals',
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      event_label: id,
      non_interaction: true,
    });
  }

  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
</script>
```

---

#### Task 3.2: A/B Testing Font Loading Strategies
**Czas:** 4h
**Złożoność:** Średnia
**Impact:** 🟠 Medium

**Test scenarios:**
1. **Baseline:** `font-display: swap`
2. **Variant A:** `font-display: optional`
3. **Variant B:** `font-display: block` + short timeout
4. **Variant C:** Preload critical fonts

**Metryka:**
- CLS
- FCP
- User preference survey (czytelność vs speed)

---

## 📊 OCZEKIWANE REZULTATY

### Before → After (szacunki)

| Metryka | Przed | Po (Faza 1) | Po (Faza 2) | Target |
|---------|-------|-------------|-------------|--------|
| **FCP** | ~1.2s | ~0.9s | ~0.8s | < 1.0s ✅ |
| **LCP** | ~1.8s | ~1.5s | ~1.3s | < 2.5s ✅ |
| **CLS** | ~0.05 | ~0.01 | ~0.00 | < 0.1 ✅ |
| **TTI** | ~2.5s | ~2.2s | ~2.0s | < 3.0s ✅ |
| **Lighthouse Mobile** | 85 | 92 | 96 | > 90 ✅ |
| **Lighthouse Desktop** | 95 | 98 | 99 | > 95 ✅ |

---

## 🛠️ NARZĘDZIA I RESOURCES

### Performance Testing
- **Lighthouse CI:** https://github.com/GoogleChrome/lighthouse-ci
- **WebPageTest:** https://www.webpagetest.org/
- **PageSpeed Insights:** https://pagespeed.web.dev/
- **Chrome DevTools:** Performance tab + Network throttling

### Font Optimization
- **Google Webfonts Helper:** https://gwfh.mranftl.com/fonts
- **Font Metric Override Calculator:** https://screenspan.net/fallback
- **Wakamaifondue:** https://wakamaifondue.com/ (font analysis)
- **Glyphhanger:** https://github.com/zachleat/glyphhanger (subsetting)

### Image Optimization
- **Squoosh:** https://squoosh.app/ (manual compression)
- **AVIF/WebP encoder:** Sharp (już używasz ✅)
- **Placeholder generators:**
  - LQIP: https://github.com/zouhir/lqip
  - BlurHash: https://blurha.sh/

### Monitoring
- **Web Vitals extension:** https://chrome.google.com/webstore/detail/web-vitals/
- **Calibre:** https://calibreapp.com/ (RUM + Synthetic)
- **SpeedCurve:** https://www.speedcurve.com/

---

## 🚀 QUICK WINS (Do zrobienia DZIŚ)

### 1. Dodaj fetchpriority="high" do LCP image (5 min)
```html
<img
  src="assets/images/about/coding-setup-800.jpg"
  fetchpriority="high"
  loading="eager"
  ...
/>
```

### 2. Preload FontAwesome (tymczasowo, do czasu self-host) (2 min)
```html
<link
  rel="preload"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

### 3. Dodaj content-visibility: auto dla off-screen sections (10 min)
```css
#portfolio, #services, #faq {
  content-visibility: auto;
  contain-intrinsic-size: 0 1000px;
}
```

### 4. Implement resource hints dla known 3rd parties (5 min)
```html
<link rel="dns-prefetch" href="https://www.google-analytics.com" />
<link rel="preconnect" href="https://www.google-analytics.com" />
```

---

## 📚 DODATKOWE REKOMENDACJE

### A. Critical CSS Inlining
**Problem:** style.css blokuje rendering
**Rozwiązanie:** Wydziel critical CSS i inline w `<head>`

```html
<style>
  /* Critical CSS - tylko dla above-the-fold */
  :root { --bg-color: #050505; ... }
  nav { ... }
  #hero { ... }
  .btn { ... }
</style>

<link rel="preload" href="style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="style.css"></noscript>
```

### B. Service Worker dla offline + cache
**Impact:** Repeat visitors = instant load

```javascript
// sw.js
const CACHE_VERSION = 'v1';
const CACHE_ASSETS = [
  '/',
  '/style.css',
  '/js/main.js',
  '/assets/fonts/outfit-400.woff2',
  '/assets/images/about/coding-setup-800.avif'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(CACHE_ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
```

### C. HTTP/2 Server Push (jeśli masz kontrolę nad serwerem)
```
Link: </assets/fonts/outfit-400.woff2>; rel=preload; as=font; type=font/woff2
Link: </style.css>; rel=preload; as=style
```

### D. Brotli Compression dla text assets
- Zamiast gzip → brotli (20-30% lepsza kompresja)
- Wymaga konfiguracji serwera (nginx/Apache)

---

## ✅ CHECKLIST PRZED WDROŻENIEM

### Pre-deployment
- [ ] Wszystkie zmiany przetestowane lokalnie
- [ ] Lighthouse audit (Mobile + Desktop) > 90
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Cross-device testing (iPhone, Android, tablet, desktop)
- [ ] Visual regression testing (screenshot comparison)
- [ ] Font rendering validation
- [ ] Icons rendering validation
- [ ] Image lazy loading works on all viewports
- [ ] No console errors
- [ ] No 404s in Network tab

### Post-deployment (pierwsze 24h)
- [ ] Monitor Real User Metrics (RUM)
- [ ] Check Core Web Vitals in Search Console
- [ ] Validate CDN/hosting correctly serves new assets
- [ ] Test on slow connection (3G throttling)
- [ ] Check analytics for bounce rate changes
- [ ] User feedback survey

---

## 📞 SUPPORT & PYTANIA

Jeśli podczas implementacji napotkasz problemy:

1. **Font metric overrides** nie działają idealnie:
   - Użyj narzędzia: https://screenspan.net/fallback
   - Dostosuj `size-adjust`, `ascent-override` itd. metodą prób i błędów
   - Test na różnych rozdzielczościach

2. **AVIF nie działa w starych przeglądarkach:**
   - To OK! `<picture>` automatycznie fallback na WebP/JPEG
   - Sprawdź: https://caniuse.com/avif

3. **Blur-up effect powoduje layout shift:**
   - Upewnij się że placeholder ma takie same `width`/`height` jak target image
   - Użyj `aspect-ratio` CSS property

4. **Self-hosted fonts nie ładują się:**
   - Sprawdź ścieżki: `../fonts/` vs `/assets/fonts/`
   - Sprawdź CORS headers (if applicable)
   - Validate MIME type: `font/woff2`

---

**Dokument stworzony:** 2025-11-29
**Autor audytu:** Claude (Anthropic)
**Projekt:** DominDev Momentum High-Performance Optimization
**Wersja:** 1.0

**NEXT STEPS:** Rozpocznij od Fazy 1, Task 1.1 (FontAwesome self-host) 🚀
