---
title: Lighthouse Issues & Fixes
created: 2025-11-29
updated: 2025-11-29
status: current
type: report
tags: [lighthouse, fixes, optimization]
---

# 🔍 ANALIZA PROBLEMÓW LIGHTHOUSE - 2025-11-29

**Data audytu:** 29 listopada 2025
**URL testowy:** https://domin737.github.io/DominDev-Momentum/
**Środowisko:** GitHub Pages (mobile)

---

## 📋 EXECUTIVE SUMMARY

Po wdrożeniu optymalizacji (modulepreload hints, inline fonts CSS) zidentyfikowano **2 KRYTYCZNE problemy**:

### ❌ PROBLEM #1: Brakujące ikony FontAwesome
**Impact:** Broken UI, zła User Experience
**Lokalizacja:**
- Sekcja Contact: ikona LinkedIn
- Sekcja FAQ: 5 ikon (fa-screwdriver-wrench, fa-money-bill-wave, fa-ban, fa-gauge-high, fa-handshake)

**Root cause:** Inlined fonts CSS zawiera tylko **13 definicji ikon**, brakuje **10+ ikon** używanych na stronie.

### ⚠️ PROBLEM #2: Render-blocking inline font (600ms)
**Impact:** FCP delay, LCP delay
**Lighthouse report:** `/TbdWWEro6...` (113.5 KiB inline font) blokuje rendering przez 600ms

**Root cause:** Inlined fonts CSS został dodany jako **blocking `<style>`** tag, zamiast być async lub mieć media query.

---

## 🔎 SZCZEGÓŁOWA ANALIZA PROBLEMÓW

### 1. BRAKUJĄCE IKONY FONTAWESOME

#### A. Identyfikacja brakujących ikon

**Przeszukałem index.html i zidentyfikowałem WSZYSTKIE używane ikony:**

**FontAwesome Solid (fa-solid, fas):**
1. ✅ fa-arrow-up (scroll-to-top button)
2. ✅ fa-robot (chatbot trigger)
3. ✅ fa-terminal (chatbot header)
4. ✅ fa-paper-plane (chatbot send)
5. ✅ fa-check (używane gdzieś w UI)
6. ✅ fa-code (już zdefiniowane)
7. ✅ fa-shield-halved (FAQ #1)
8. ❌ fa-screwdriver-wrench (FAQ #2) **← BRAKUJE!**
9. ❌ fa-money-bill-wave (FAQ #3) **← BRAKUJE!**
10. ❌ fa-ban (FAQ #4) **← BRAKUJE!**
11. ❌ fa-gauge-high (FAQ #5) **← BRAKUJE!**
12. ❌ fa-handshake (FAQ #6) **← BRAKUJE!**
13. ✅ fa-database (już zdefiniowane)
14. ✅ fa-rocket (już zdefiniowane)
15. ✅ fa-layer-group (już zdefiniowane)
16. ✅ fa-lightbulb (już zdefiniowane)
17. ✅ fa-cog (już zdefiniowane)
18. ✅ fa-chart-line (już zdefiniowane)

**FontAwesome Brands (fa-brands, fab):**
1. ✅ fa-linkedin (contact section - header)
2. ❌ fa-linkedin-in (footer) **← BRAKUJE!**
3. ✅ fa-github (contact + footer)
4. ✅ fa-instagram (contact + footer)
5. ✅ fa-aws (już zdefiniowane)

#### B. Unicode mappings dla brakujących ikon

**Solid icons:**
```css
.fa-screwdriver-wrench::before { content: "\f7d9"; }
.fa-money-bill-wave::before { content: "\f53a"; }
.fa-ban::before { content: "\f05e"; }
.fa-gauge-high::before { content: "\f625"; }
.fa-handshake::before { content: "\f2b5"; }
```

**Brand icons:**
```css
.fa-linkedin-in::before { content: "\f0e1"; }
```

**Źródło Unicode:** FontAwesome 6 Free official documentation

---

### 2. RENDER-BLOCKING INLINE FONT

#### A. Lighthouse raport szczegóły

```
Render blocking requests: 750ms total
- /DominDev-Momentum/style.min.css: 150ms (11.1 KiB)
- /TbdWWEro6...= (inline font): 600ms (113.5 KiB) ← PROBLEM!
```

#### B. Analiza problemu

**Current state (index.html:375-377):**
```html
<style>
/* Google Fonts - Outfit */@font-face{...}
/* FontAwesome - Solid */@font-face{...}
/* 113+ KiB minified CSS */
</style>
```

**Dlaczego to blokuje rendering:**
1. `<style>` w `<head>` jest **synchronous** i **render-blocking** domyślnie
2. Przeglądarka musi **sparsować** 113 KiB CSS PRZED rozpoczęciem renderowania
3. Parse time na mobile: ~600ms (wolny CPU)

#### C. Rozważone rozwiązania

**Opcja 1: Preload font files + external CSS** ❌
- Wracamy do problemu external request (936ms network dependency)
- Nie rozwiązuje problemu

**Opcja 2: `<style media="print" onload="this.media='all'">` trick** ✅✅✅
- Async load trick bez JavaScript dependency
- Eliminuje render-blocking (CSS ładuje się async)
- Fallback: `<noscript>` z synchronous `<link>`
- **NAJBARDZIEJ OPTYMALNY!**

**Opcja 3: Podzielić critical vs non-critical fonts** ⚡
- Inline TYLKO Google Fonts (critical for typography)
- Defer FontAwesome (non-critical icons)
- **ADVANCED OPTIMIZATION**

**Opcja 4: Font subsetting** 🔬
- Wyciąć tylko używane glyphs (16 ikon zamiast 2000+)
- Zmniejszyć fa-solid-900.woff2 ze 147 KiB do ~10 KiB
- **NAJLEPSZA długoterminowo, ale wymaga tooling**

---

### 3. LIGHTHOUSE POZOSTAŁE ISSUES

#### A. Cache TTL (535 KiB savings)
**Problem:** Wszystkie assets mają 10-minutowy TTL zamiast 1 roku
**Impact:** ⚠️ MEDIUM (dotyczy repeat visitors)
**Rozwiązanie:** GitHub Pages konfiguracja (nie możemy zmienić z poziomu kodu)
**Status:** WONTFIX (wymaga GitHub Pages settings lub CDN)

#### B. Image optimization - portfolio-techgear-800.avif (61 KiB savings)
**Problem:**
- File size: 100.3 KiB
- Dimensions: 800x516 (source)
- Displayed: 369x656 (rendered)
- Lighthouse: "Increase compression" + "Use responsive dimensions"

**Impact:** ⚠️ MEDIUM (not LCP element, lazy-loaded)
**Analiza:**
- Obraz jest lazy-loaded → nie wpływa na FCP/LCP
- Displayed 369x656 to viewport mobile (nie stały rozmiar)
- Na desktop będzie 800px width → source jest poprawny
- **Compression:** AVIF już kompresuje agresywnie, dalsze zwiększanie może pogorszyć jakość

**Rozwiązanie:**
1. Re-encode AVIF z wyższą kompresją (quality 75 → 65)
2. OPCJONALNIE: Dodać srcset z 600w variant dla mobile
3. **PRIORYTET: LOW** (nie wpływa na Core Web Vitals mobile)

#### C. Network dependency tree (310ms max)
**Problem:**
```
index.html (69ms)
  ├─> style.min.css (174ms)
  ├─> /TbdWWEro6 (inline font - 110ms) ← to już mamy w inline!
  ├─> fa-solid-900.woff2 (281ms)
  └─> fa-brands-400.woff2 (310ms)
```

**Analiza:**
- 310ms to **DOSKONAŁY wynik!** (previous: 1,261ms)
- Fonty ładują się równolegle z HTML (dzięki inline CSS z @font-face)
- Max 310ms to maksymalny czas dla fa-brands-400.woff2

**Impact:** ✅ ACCEPTABLE (target: <500ms)
**Rozwiązanie:** NONE NEEDED (już zoptymalizowane)

---

## 🎯 PLAN NAPRAWY - PRIORYTETYZACJA

### CRITICAL (Zrób NAJPIERW)

#### TASK #1: Dodaj brakujące ikony FontAwesome
**Czas:** 3 minuty
**Lokalizacja:** [index.html:376](index.html#L376) (inline `<style>`)
**Impact:** ⚡⚡⚡ CRITICAL (broken UI)

**Akcja:**
1. Znajdź linię z `.fa-chart-line::before{content:"\f201"}`
2. Dodaj po niej:
```css
.fa-screwdriver-wrench::before{content:"\f7d9"}
.fa-money-bill-wave::before{content:"\f53a"}
.fa-ban::before{content:"\f05e"}
.fa-gauge-high::before{content:"\f625"}
.fa-handshake::before{content:"\f2b5"}
```
3. Znajdź linię z `.fa-aws::before{content:"\f375"}`
4. Dodaj po niej:
```css
.fa-linkedin-in::before{content:"\f0e1"}
```

**Verification:**
- Otwórz localhost → sekcja FAQ → wszystkie 6 ikon widoczne
- Sekcja footer → LinkedIn icon widoczna

---

#### TASK #2: Eliminuj render-blocking inline font CSS
**Czas:** 5 minut
**Lokalizacja:** [index.html:375-377](index.html#L375-L377)
**Impact:** ⚡⚡⚡ CRITICAL (FCP -600ms, LCP -400ms)

**Wybrane rozwiązanie:** Media query trick (Opcja 2)

**Akcja:**

**PRZED:**
```html
<style>
/* Google Fonts + FontAwesome */
@font-face{...} /* 113 KiB */
</style>
```

**PO:**
```html
<!-- Async load fonts CSS (non-blocking) -->
<style media="print" onload="this.media='all'">
/* Google Fonts - Outfit */@font-face{font-family:'Outfit';font-style:normal;font-weight:100 900;font-display:swap;src:url('assets/fonts/outfit-400.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:'Outfit Fallback';src:local('Arial');size-adjust:102%;ascent-override:90%;descent-override:22%;line-gap-override:0%}/* Google Fonts - Space Grotesk */@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:300 700;font-display:swap;src:url('assets/fonts/space-grotesk.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:'Space Grotesk Fallback';src:local('Courier New');size-adjust:98%;ascent-override:88%;descent-override:24%;line-gap-override:0%}/* FontAwesome - Solid */@font-face{font-family:'Font Awesome 6 Free';font-style:normal;font-weight:900;font-display:swap;src:url('assets/fonts/fa-solid-900.woff2') format('woff2')}.fas,.fa-solid{font-family:'Font Awesome 6 Free';font-weight:900}.fa,.fas,.far,.fal,.fat,.fad,.fab,.fa-solid,.fa-regular,.fa-light,.fa-thin,.fa-duotone,.fa-brands{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:inline-block;font-style:normal;font-variant:normal;line-height:1;text-rendering:auto}.fa-arrow-up::before{content:"\f062"}.fa-robot::before{content:"\f544"}.fa-terminal::before{content:"\f120"}.fa-paper-plane::before{content:"\f1d8"}.fa-check::before{content:"\f00c"}.fa-code::before{content:"\f121"}.fa-shield-halved::before{content:"\f3ed"}.fa-database::before{content:"\f1c0"}.fa-rocket::before{content:"\f135"}.fa-layer-group::before{content:"\f5fd"}.fa-lightbulb::before{content:"\f0eb"}.fa-cog::before{content:"\f013"}.fa-chart-line::before{content:"\f201"}.fa-screwdriver-wrench::before{content:"\f7d9"}.fa-money-bill-wave::before{content:"\f53a"}.fa-ban::before{content:"\f05e"}.fa-gauge-high::before{content:"\f625"}.fa-handshake::before{content:"\f2b5"}/* FontAwesome - Brands */@font-face{font-family:'Font Awesome 6 Brands';font-style:normal;font-weight:400;font-display:swap;src:url('assets/fonts/fa-brands-400.woff2') format('woff2')}.fab,.fa-brands{font-family:'Font Awesome 6 Brands';font-weight:400}.fa-linkedin::before{content:"\f08c"}.fa-github::before{content:"\f09b"}.fa-instagram::before{content:"\f16d"}.fa-aws::before{content:"\f375"}.fa-linkedin-in::before{content:"\f0e1"}
</style>

<!-- Fallback for browsers without JS -->
<noscript>
  <style>
    /* Same CSS as above, but synchronous */
    /* Google Fonts - Outfit */@font-face{font-family:'Outfit';font-style:normal;font-weight:100 900;font-display:swap;src:url('assets/fonts/outfit-400.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:'Outfit Fallback';src:local('Arial');size-adjust:102%;ascent-override:90%;descent-override:22%;line-gap-override:0%}/* Google Fonts - Space Grotesk */@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:300 700;font-display:swap;src:url('assets/fonts/space-grotesk.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:'Space Grotesk Fallback';src:local('Courier New');size-adjust:98%;ascent-override:88%;descent-override:24%;line-gap-override:0%}/* FontAwesome - Solid */@font-face{font-family:'Font Awesome 6 Free';font-style:normal;font-weight:900;font-display:swap;src:url('assets/fonts/fa-solid-900.woff2') format('woff2')}.fas,.fa-solid{font-family:'Font Awesome 6 Free';font-weight:900}.fa,.fas,.far,.fal,.fat,.fad,.fab,.fa-solid,.fa-regular,.fa-light,.fa-thin,.fa-duotone,.fa-brands{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:inline-block;font-style:normal;font-variant:normal;line-height:1;text-rendering:auto}.fa-arrow-up::before{content:"\f062"}.fa-robot::before{content:"\f544"}.fa-terminal::before{content:"\f120"}.fa-paper-plane::before{content:"\f1d8"}.fa-check::before{content:"\f00c"}.fa-code::before{content:"\f121"}.fa-shield-halved::before{content:"\f3ed"}.fa-database::before{content:"\f1c0"}.fa-rocket::before{content:"\f135"}.fa-layer-group::before{content:"\f5fd"}.fa-lightbulb::before{content:"\f0eb"}.fa-cog::before{content:"\f013"}.fa-chart-line::before{content:"\f201"}.fa-screwdriver-wrench::before{content:"\f7d9"}.fa-money-bill-wave::before{content:"\f53a"}.fa-ban::before{content:"\f05e"}.fa-gauge-high::before{content:"\f625"}.fa-handshake::before{content:"\f2b5"}/* FontAwesome - Brands */@font-face{font-family:'Font Awesome 6 Brands';font-style:normal;font-weight:400;font-display:swap;src:url('assets/fonts/fa-brands-400.woff2') format('woff2')}.fab,.fa-brands{font-family:'Font Awesome 6 Brands';font-weight:400}.fa-linkedin::before{content:"\f08c"}.fa-github::before{content:"\f09b"}.fa-instagram::before{content:"\f16d"}.fa-aws::before{content:"\f375"}.fa-linkedin-in::before{content:"\f0e1"}
  </style>
</noscript>
```

**Jak to działa:**
1. `media="print"` → przeglądarka traktuje jako non-critical (dla druku)
2. `onload="this.media='all'"` → po załadowaniu zmienia na `all` (aktywuje CSS)
3. Result: CSS ładuje się **async** (non-blocking)
4. `<noscript>` fallback dla ~0.2% użytkowników bez JS

**Expected impact:**
- Render blocking: 750ms → ~150ms (-600ms!)
- FCP: immediate improvement
- Lighthouse Performance: +8-12 punktów

**Verification:**
- Lighthouse → "Render blocking requests" powinno pokazać TYLKO style.min.css (150ms)
- `/TbdWWEro6...` powinno **zniknąć** z render-blocking section
- Visual test: fonts nadal ładują się poprawnie (może być krótki FOUT, ale z font-display:swap jest ok)

---

### MEDIUM (Opcjonalne optymalizacje)

#### TASK #3: Optymalizuj portfolio-techgear-800.avif
**Czas:** 10-15 minut
**Impact:** ⚠️ MEDIUM (61 KiB bandwidth savings, nie wpływa na LCP)
**Priorytet:** LOW

**Akcja:**
1. Re-encode `assets/images/portfolio/portfolio-techgear-800.avif` z quality=65
2. OPCJONALNIE: Dodaj 600w variant dla mobile srcset

**Command (z avif encoder):**
```bash
avifenc --min 0 --max 63 --speed 4 portfolio-techgear-source.jpg portfolio-techgear-800.avif
```

**Uwaga:** To wymaga tooling (avifenc) i może pogorszyć jakość. **Rekomendacja: SKIP na razie.**

---

## 📊 OCZEKIWANE REZULTATY

### Po wykonaniu CRITICAL TASKS (#1-2):

| Metryka | Przed | Po Tasks 1-2 | Delta |
|---------|-------|--------------|-------|
| **Render Blocking** | 750ms | ~150ms | -600ms ⚡⚡⚡ |
| **FCP** | ~1.2s | ~0.6s | -600ms ⚡⚡⚡ |
| **LCP** | ~1.8s | ~1.2s | -600ms ⚡⚡⚡ |
| **TTI** | ~2.5s | ~1.9s | -600ms ⚡⚡ |
| **Lighthouse Mobile** | 85-90 | 93-97 | +8-12 pts ⚡⚡⚡ |
| **UI Broken Icons** | ❌ 6 missing | ✅ All visible | FIXED! |

### Network Dependency Chain (po Tasks 1-2):

**PRZED:**
```
index.html (69ms)
  ├─> /TbdWWEro6 (inline font - 600ms blocking!) ← PROBLEM
  ├─> style.min.css (150ms)
  ├─> fa-solid-900.woff2 (281ms)
  └─> fa-brands-400.woff2 (310ms)

Max Critical Path: 600ms (inline font parse time)
```

**PO:**
```
index.html (69ms)
  ├─> style.min.css (150ms blocking)
  ├─> fa-solid-900.woff2 (281ms async)
  ├─> fa-brands-400.woff2 (310ms async)
  └─> fonts CSS (async, non-blocking)

Max Critical Path: 150ms (tylko style.min.css!)
```

**Delta:** -450ms Critical Path! (-75% improvement!)

---

## ✅ VERIFICATION CHECKLIST

Po wdrożeniu wszystkich zmian:

### Visual Tests (localhost)
- [ ] Sekcja FAQ: wszystkie 6 ikon widoczne (shield, wrench, money, ban, gauge, handshake)
- [ ] Footer: ikona LinkedIn widoczna (fa-linkedin-in)
- [ ] Chatbot: robot icon widoczny
- [ ] Scroll-to-top: arrow icon widoczny
- [ ] Contact: LinkedIn/GitHub/Instagram icons widoczne

### Performance Tests (localhost)
- [ ] Lighthouse Desktop: Performance > 95
- [ ] Lighthouse Mobile: Performance > 90
- [ ] Network tab: "Render blocking requests" = tylko style.min.css
- [ ] Network tab: fonts ładują się async (nie blokują rendering)

### Regression Tests
- [ ] Fonts wyświetlają się poprawnie (nie ma broken glyphs)
- [ ] Brak FOIT (Flash of Invisible Text) - font-display:swap działa
- [ ] Typography wygląda identycznie jak przed zmianami
- [ ] Icons mają poprawny alignment i rozmiar

---

## 🚀 WDROŻENIE

**Kolejność wykonania:**
1. TASK #1: Dodaj brakujące ikony (3 min)
2. Test localhost: weryfikuj ikony FAQ + footer
3. TASK #2: Media query trick dla fonts CSS (5 min)
4. Test localhost: Lighthouse + visual check
5. Commit (BEZ push do GitHub)
6. Final verification localhost
7. **User wykonuje push do GitHub Pages**

**Całkowity czas:** ~10 minut (CRITICAL tasks)

**Expected Lighthouse Mobile score:** 93-97/100 🎯

---

**Dokument utworzony przez:** Claude Code
**Następny krok:** Rozpocznij implementację TASK #1
