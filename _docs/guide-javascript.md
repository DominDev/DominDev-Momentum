---
title: JavaScript Optimization Guide
created: 2025-11-28
updated: 2025-11-29
status: current
type: implementation-guide
tags: [javascript, modules, performance]
---

# 🚨 KRYTYCZNY PROBLEM: JavaScript Module Chain

**Data:** 2025-11-29
**Priorytet:** 🔴 CRITICAL (wyższy niż fonty!)
**Impact:** -472ms Critical Path Latency

---

## 🔍 PROBLEM

Lighthouse wykrył **najdłuższy łańcuch krytycznych żądań** w projekcie:

```
index.html (37ms)
  └─> js/main.js (283ms) ← 246ms opóźnienie!
      ├─> js/modules/adaptive-images.js (472ms) ← 189ms opóźnienie!
      ├─> js/modules/maintenance.js (471ms)
      ├─> js/modules/hud.js (470ms)
      ├─> js/modules/portfolio.js (470ms)
      ├─> js/modules/contact.js (469ms)
      ├─> js/core/matrix.js (469ms)
      ├─> js/core/ui.js (468ms)
      └─> js/config.js (468ms)
```

**Całkowity czas:** 472ms (283ms + 189ms)

### Dlaczego to jest problem?

1. **Sekwencyjne ładowanie:** Przeglądarka musi pobrać `main.js` → sparsować → dopiero wtedy zaczyna pobierać 8 zależności
2. **Blokuje LCP:** Dopóki JavaScript się nie załaduje, niektóre elementy strony mogą nie działać
3. **472ms to DUŻO:** Prawie pół sekundy czekania na interaktywność

---

## ✅ ROZWIĄZANIE #1: `<link rel="modulepreload">` (QUICK WIN)

**Czas implementacji:** 5 minut
**Impact:** -150-200ms Critical Path Latency

### Jak to działa?

`modulepreload` informuje przeglądarkę, żeby **od razu** (równolegle z `index.html`) zaczęła pobierać moduły JavaScript, **bez czekania** na sparsowanie `main.js`.

### Implementacja

**Dodaj do `<head>` w [index.html](../index.html) (po linii 333, PRZED stylesheets):**

```html
<!-- ========================================
     CRITICAL: Preload JavaScript Modules
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

### Wynik

**PRZED:**
```
main.js start downloading at: 37ms
main.js parsed at: 283ms
modules start downloading at: 283ms ← PROBLEM!
modules parsed at: 472ms
```

**PO:**
```
ALL modules start downloading at: 37ms ← Równolegle!
main.js parsed at: 283ms
modules already downloaded ← Instant!
modules parsed at: ~280ms ← 192ms szybciej!
```

---

## ⚡ ROZWIĄZANIE #2: Lazy Load Non-Critical Modules (ADVANCED)

**Czas implementacji:** 30 minut
**Impact:** -100ms dodatkowe (Total: -300ms)

### Koncepcja

Nie wszystkie moduły są potrzebne **natychmiast**. Niektóre mogą się załadować **po** tym, jak strona jest już interaktywna.

### Moduły do Lazy Loading

| Moduł | Ładować | Uzasadnienie |
|-------|---------|--------------|
| `config.js` | ✅ Immediately | Potrzebny przez inne moduły |
| `matrix.js` | ✅ Immediately | Background animation (ważne UX) |
| `ui.js` | ✅ Immediately | Core interactivity |
| `adaptive-images.js` | ✅ Immediately | LCP optimization |
| `portfolio.js` | ⚠️ Defer 500ms | Modal (nie używany od razu) |
| `contact.js` | ⚠️ Defer 500ms | Form (scroll target) |
| `hud.js` | 🔄 Already deferred | `setTimeout(initHud, 200)` |
| `maintenance.js` | ✅ Immediately | Critical check |

### Implementacja (main.js)

**PRZED:**
```javascript
import { initPortfolio } from './modules/portfolio.js';
import { initContact } from './modules/contact.js';

document.addEventListener("DOMContentLoaded", () => {
  initPortfolio();
  initContact();
});
```

**PO:**
```javascript
// Usuń top-level imports dla portfolio i contact

document.addEventListener("DOMContentLoaded", () => {
  // Critical modules init immediately
  initCursor();
  initAdaptiveImages();

  // Defer non-critical modules
  setTimeout(async () => {
    const [{ initPortfolio }, { initContact }] = await Promise.all([
      import('./modules/portfolio.js'),
      import('./modules/contact.js')
    ]);

    initPortfolio();
    initContact();
  }, 500); // After LCP
});
```

**Aktualizuj modulepreload hints (usuń portfolio i contact):**
```html
<!-- Usuń te linie: -->
<link rel="modulepreload" href="js/modules/portfolio.js" />
<link rel="modulepreload" href="js/modules/contact.js" />
```

---

## 📊 OCZEKIWANE REZULTATY

| Metryka | Przed | Po modulepreload | Po lazy loading | Target |
|---------|-------|------------------|-----------------|--------|
| **Critical Path Latency** | 472ms | ~280ms | ~200ms | < 300ms ✅ |
| **TTI (Time to Interactive)** | ~2.5s | ~2.2s | ~1.9s | < 2.0s ✅ |
| **TBT (Total Blocking Time)** | ~150ms | ~150ms | ~100ms | < 200ms ✅ |
| **FCP** | ~1.2s | ~1.0s | ~0.9s | < 1.0s ✅ |

---

## ⚠️ UWAGI

### Modulepreload compatibility
- ✅ Chrome 66+ (95% użytkowników)
- ✅ Edge 79+
- ✅ Safari 15+ (iOS 15+)
- ❌ Firefox - ignoruje (graceful degradation)

### Fallback dla Firefox?
**Nie potrzebny!** Firefox i tak pobiera moduły efektywnie. Modulepreload to **enhancement**, nie requirement.

### Czy modulepreload zwiększa transfer?
**NIE!** Pobieramy te same pliki, tylko **wcześniej** (równolegle zamiast sekwencyjnie).

---

## ✅ VALIDATION

Po implementacji sprawdź:

1. **Chrome DevTools → Network tab:**
   - Wszystkie `js/*` pliki powinny startować ~tym samym czasie
   - Waterfall powinien być **szeroki** (równoległy), nie **długi** (sekwencyjny)

2. **Lighthouse → Network Dependency Tree:**
   - Critical Path Latency powinien spaść z 472ms do ~280ms

3. **Test funkcjonalności:**
   - Portfolio modal działa? ✅
   - Contact form działa? ✅
   - Matrix animation działa? ✅

---

## 🚀 IMPLEMENTACJA - KOLEJNOŚĆ

1. **Quick Win (5 min):** Dodaj modulepreload hints → Test Lighthouse
2. **Advanced (30 min):** Lazy load portfolio/contact → Test Lighthouse
3. **Compare:** Przed vs Po

---

## 📚 ZASOBY

- [MDN: `<link rel="modulepreload">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/modulepreload)
- [web.dev: Preload critical assets](https://web.dev/preload-critical-assets/)
- [Chrome: Module preload guide](https://developer.chrome.com/blog/modulepreload/)

---

**Autor:** Claude (Anthropic AI)
**Data utworzenia:** 2025-11-29
**Wersja:** 1.0
