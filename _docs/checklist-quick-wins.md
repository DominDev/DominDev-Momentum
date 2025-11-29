---
title: Quick Wins Checklist
created: 2025-11-28
updated: 2025-11-29
status: current
type: checklist
tags: [quick-wins, actionable, performance]
---

# ⚡ QUICK WINS - OPTYMALIZACJA OBRAZÓW I PERFORMANCE

**Czas realizacji:** 45 minut - 2.5 godziny
**Impact:** FCP -300ms, LCP -200ms, TTI -200ms, Lighthouse +8-12 punktów

---

## 🎯 NAJWYŻSZY PRIORYTET (Zrób DZIŚ)

### 0. 🚨 CRITICAL: Dodaj `<link rel="modulepreload">` dla JS modules
**Czas:** 5 minut
**Impact:** Critical Path Latency -190ms, TTI -200ms ⚡⚡⚡
**Lokalizacja:** [index.html:334](index.html#L334) (po preload LCP image, PRZED stylesheets)

**PROBLEM:** Lighthouse wykrył łańcuch 472ms zależności:
```
index.html → main.js (283ms) → 8 modułów (472ms)
```

**ROZWIĄZANIE:** Preload wszystkich modułów równolegle z HTML:

```html
<!-- ========================================
     CRITICAL FIX: Preload JavaScript Modules
     Reduces JS chain from 472ms to ~280ms
     ======================================== -->

<!-- Core entry point -->
<link rel="modulepreload" href="js/main.js" />
<link rel="modulepreload" href="js/config.js" />

<!-- Core modules (needed immediately) -->
<link rel="modulepreload" href="js/core/matrix.js" />
<link rel="modulepreload" href="js/core/ui.js" />

<!-- Feature modules (needed for DOMContentLoaded) -->
<link rel="modulepreload" href="js/modules/adaptive-images.js" />
<link rel="modulepreload" href="js/modules/portfolio.js" />
<link rel="modulepreload" href="js/modules/contact.js" />
<link rel="modulepreload" href="js/modules/maintenance.js" />
<link rel="modulepreload" href="js/modules/hud.js" />
```

**Dlaczego to działa:**
- Przeglądarka zaczyna pobierać **wszystkie** moduły **od razu** (równolegle z `index.html`)
- Zamiast czekać na parse `main.js` (283ms), moduły są **już pobrane**
- Critical Path: 472ms → ~280ms = **-192ms!**

**Szczegóły:** [guide-javascript.md](guide-javascript.md)

**Impact:** ⚡⚡⚡ NAJWIĘKSZY POJEDYNCZY QUICK WIN W CAŁYM PROJEKCIE!

---

### 1. Dodaj `fetchpriority="high"` do LCP image
**Czas:** 2 minuty
**Lokalizacja:** [index.html:690-703](index.html#L690-L703)

```html
<!-- PRZED: -->
<img
  src="assets/images/about/coding-setup-800.jpg"
  srcset="..."
  alt="DominDev Coding Setup - WordPress Development Environment"
  loading="lazy"
  width="500"
  height="400"
/>

<!-- PO: -->
<img
  src="assets/images/about/coding-setup-800.jpg"
  srcset="..."
  alt="DominDev Coding Setup - WordPress Development Environment"
  loading="eager"
  fetchpriority="high"
  width="500"
  height="400"
/>
```

**Impact:** LCP -100-150ms ⚡

---

### 2. Preload FontAwesome tymczasowo (do czasu self-host)
**Czas:** 3 minuty
**Lokalizacja:** [index.html:310](index.html#L310) (dodaj PO meta tags)

```html
<!-- Dodaj PRZED linią 342 (FontAwesome CDN link): -->
<link
  rel="preload"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
<link
  rel="preload"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

**Impact:** FCP -50-80ms, zmniejsza FOIT ⚡

**UWAGA:** To tymczasowe rozwiązanie. Ostatecznie self-hostuj fonty (patrz: Task 3).

---

### 3. Dodaj `content-visibility: auto` dla off-screen sections
**Czas:** 5 minut
**Lokalizacja:** [style.css](style.css) (dodaj na końcu pliku)

```css
/* Performance optimization - lazy render off-screen sections */
#portfolio,
#process,
#services,
#faq,
#contact {
  content-visibility: auto;
  contain-intrinsic-size: 0 1000px; /* Estimated height */
}
```

**Impact:**
- Initial render time -30-50ms ⚡
- Scroll performance +20-30% FPS
- Działa TYLKO w Chrome/Edge (graceful degradation w innych)

**Jak to działa:**
Przeglądarka "odkłada" renderowanie sekcji, które są poza viewport, aż użytkownik do nich scrolluje.

---

### 4. Zmień `sizes` attribute dla lepszego DPR matching
**Czas:** 10 minut
**Lokalizacja:** Wszystkie `<picture>` elementy w HTML

```html
<!-- PRZED: -->
<source
  type="image/avif"
  srcset="..."
  sizes="(max-width: 480px) 95vw, (max-width: 768px) 90vw, (max-width: 1200px) 45vw, 600px"
/>

<!-- PO (z uwzględnieniem Retina): -->
<source
  type="image/avif"
  srcset="..."
  sizes="(max-width: 480px) 95vw,
         (max-width: 768px) 90vw,
         (max-width: 1200px) 45vw,
         (min-resolution: 2dppx) 1200px,
         600px"
/>
```

**Impact:** Retina displays pobierają sharper images ⚡

---

### 5. Dodaj `decoding="async"` do wszystkich obrazów
**Czas:** 5 minut (Find & Replace)
**Lokalizacja:** Wszystkie `<img>` tagi

```html
<!-- PRZED: -->
<img src="..." alt="..." loading="lazy" />

<!-- PO: -->
<img src="..." alt="..." loading="lazy" decoding="async" />
```

**Jak wykonać:**
1. Otwórz [index.html](index.html)
2. Find & Replace (Ctrl+H)
3. Find: `loading="lazy"`
4. Replace: `loading="lazy" decoding="async"`
5. Replace All

**Impact:** Prevents image decoding blocking main thread ⚡

---

## 🟡 ŚREDNI PRIORYTET (Zrób w tym tygodniu)

### 6. Dodaj resource hints dla known 3rd parties
**Czas:** 5 minut
**Lokalizacja:** [index.html:310](index.html#L310)

```html
<!-- Dodaj PO istniejących dns-prefetch: -->

<!-- Google Analytics (jeśli używasz) -->
<link rel="dns-prefetch" href="https://www.google-analytics.com" />
<link rel="preconnect" href="https://www.google-analytics.com" />

<!-- Cloudflare (dla FontAwesome - do czasu self-host) -->
<!-- Już istnieje na linii 313, ale dodaj preconnect: -->
<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin />
```

**Impact:** Faster 3rd party resource loading ⚡

---

### 7. Minifikuj CSS i JS (jeśli jeszcze nie)
**Czas:** 15 minut
**Narzędzia:** cssnano, terser

```bash
# Instalacja
npm install -g cssnano-cli terser

# Minifikacja CSS
cssnano style.css style.min.css

# Minifikacja JS (wszystkie moduły)
terser js/main.js -o js/main.min.js -c -m
terser js/core/matrix.js -o js/core/matrix.min.js -c -m
terser js/core/ui.js -o js/core/ui.min.js -c -m
terser js/modules/adaptive-images.js -o js/modules/adaptive-images.min.js -c -m
# ... repeat dla wszystkich plików JS

# Lub użyj build tool (Vite, Webpack)
```

**Update HTML:**
```html
<!-- PRZED: -->
<link rel="stylesheet" href="style.css" />
<script type="module" src="js/main.js"></script>

<!-- PO: -->
<link rel="stylesheet" href="style.min.css" />
<script type="module" src="js/main.min.js"></script>
```

**Impact:**
- CSS: -30-40% rozmiar
- JS: -40-60% rozmiar
- Download time -50-100ms ⚡

---

### 8. Compress images jeszcze bardziej (AVIF quality tuning)
**Czas:** 20 minut
**Lokalizacja:** Skrypt optimize-images.js (jeśli istnieje)

```javascript
// Obecna konfiguracja (prawdopodobnie quality: 80):
.avif({ quality: 80 })

// Zoptymalizowana (quality: 70 dla non-hero images):
.avif({
  quality: isHeroImage ? 80 : 70,
  effort: 6 // Wolniejsza kompresja, lepszy rezultat
})
```

**Impact:** -20-30% rozmiar AVIF files (marginal quality loss) ⚡

---

### 9. Lazy load Google Fonts CSS (inline critical)
**Czas:** 15 minut

**Zamiast:**
```html
<link href="https://fonts.googleapis.com/css2?family=Outfit..." rel="stylesheet" />
```

**Zrób:**
```html
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Outfit..." as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit..."></noscript>
```

**Impact:** Non-blocking CSS, FCP -50ms ⚡

**UWAGA:** Ostatecznie self-hostuj fonty (patrz: guide-fonts.md).

---

## 🟢 NISKI PRIORYTET (Zaawansowane)

### 10. Implement Service Worker dla offline caching
**Czas:** 1-2 godziny
**Złożoność:** Średnia-wysoka

```javascript
// sw.js
const CACHE_NAME = 'domindev-v1';
const CACHE_ASSETS = [
  '/',
  '/style.css',
  '/js/main.js',
  '/assets/fonts/outfit-400.woff2',
  '/assets/fonts/space-grotesk-500.woff2',
  '/assets/images/about/coding-setup-800.avif'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request))
  );
});
```

**Rejestracja w main.js:**
```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.error('SW error:', err));
  });
}
```

**Impact:** Repeat visitors = instant load (0ms from cache) 🚀

---

### 11. HTTP/2 Server Push (wymaga kontroli nad serwerem)
**Czas:** 30 minut (server config)
**Złożoność:** Średnia

**Nginx config:**
```nginx
location / {
  http2_push /style.css;
  http2_push /assets/fonts/outfit-400.woff2;
  http2_push /assets/fonts/space-grotesk-500.woff2;
}
```

**Apache (.htaccess):**
```apache
<IfModule mod_http2.c>
  H2PushResource add /style.css
  H2PushResource add /assets/fonts/outfit-400.woff2
</IfModule>
```

**Impact:** Critical resources start downloading BEFORE browser requests them ⚡⚡

---

### 12. Brotli compression (zamiast gzip)
**Czas:** 20 minut (server config)

**Nginx:**
```nginx
brotli on;
brotli_comp_level 6;
brotli_types text/css text/javascript application/javascript;
```

**Impact:**
- CSS: -20-25% vs gzip
- JS: -15-20% vs gzip

**UWAGA:** Wymaga serwera z Brotli support (nginx z modułem, Apache 2.4.26+, Cloudflare ✅)

---

## 📊 OCZEKIWANE REZULTATY

Po wykonaniu CRITICAL QUICK WINS (Tasks 0-5):

| Metryka | Przed | Po Tasks 0-5 | Target |
|---------|-------|--------------|--------|
| **Critical Path Latency** | 472ms | ~280ms | < 300ms ✅✅ |
| **TTI** | ~2.5s | ~2.1s | < 3.0s ✅ |
| **FCP** | ~1.2s | ~0.9s | < 1.0s ✅ |
| **LCP** | ~1.8s | ~1.4s | < 2.5s ✅ |
| **CLS** | ~0.05 | ~0.03 | < 0.1 ✅ |
| **Lighthouse Mobile** | 85 | 92-94 | > 90 ✅✅ |

**Największy impact:** Task 0 (modulepreload) = -192ms Critical Path! 🚀

Po wykonaniu ALL TASKS (0-12):

| Metryka | Przed | Po All | Target |
|---------|-------|--------|--------|
| **FCP** | ~1.2s | ~0.75s | < 1.0s ✅✅ |
| **LCP** | ~1.8s | ~1.2s | < 2.5s ✅✅ |
| **CLS** | ~0.05 | ~0.01 | < 0.1 ✅✅ |
| **TTI** | ~2.5s | ~1.8s | < 3.0s ✅✅ |
| **Lighthouse Mobile** | 85 | 95-98 | > 90 ✅✅ |
| **Lighthouse Desktop** | 95 | 99-100 | > 95 ✅✅ |

---

## ✅ VALIDATION CHECKLIST

Po każdej zmianie:

- [ ] Test lokalnie (npm run dev / live server)
- [ ] Sprawdź Network tab (zero 404s, poprawne rozmiary)
- [ ] Lighthouse audit (Mobile + Desktop)
- [ ] Visual regression (screenshot comparison)
- [ ] Cross-browser test (Chrome, Firefox, Safari)
- [ ] Slow 3G test (DevTools throttling)

---

## 🚀 NASTĘPNE KROKI

Po wykonaniu Quick Wins:

1. **Self-host FontAwesome i Google Fonts**
   → Pełny przewodnik: [guide-fonts.md](guide-fonts.md)

2. **Blur-up effect dla obrazów**
   → Pełny plan: [guide-images.md](guide-images.md) - Faza 2, Task 2.1

3. **Real User Monitoring (RUM)**
   → Setup Web Vitals tracking z Google Analytics

4. **A/B testing różnych strategii**
   → Font-display variants, lazy loading thresholds

---

**Powodzenia! 🚀**

**Pytania?** Zobacz [guide-images.md](guide-images.md) dla szczegółów.
