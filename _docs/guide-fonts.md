---
title: Font Optimization Guide
created: 2025-11-20
updated: 2025-11-29
status: current
type: implementation-guide
tags: [fonts, self-hosting, performance]
---

# 🔤 PRZEWODNIK IMPLEMENTACJI OPTYMALIZACJI FONTÓW

**Data:** 2025-11-29
**Projekt:** DominDev Momentum
**Zakres:** Self-hosting fontów, font-display, metric overrides, FOIT/FOUT prevention

---

## 📋 SPIS TREŚCI

1. [Problem: Fonty z CDN](#problem)
2. [Rozwiązanie: Self-Hosting](#rozwiązanie)
3. [Krok po kroku: FontAwesome](#fontawesome)
4. [Krok po kroku: Google Fonts](#google-fonts)
5. [Font Metric Overrides - Deep Dive](#font-metric-overrides)
6. [Testing & Validation](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🚨 PROBLEM: Fonty z CDN {#problem}

### Aktualny stan aplikacji

#### FontAwesome z Cloudflare CDN
```html
<!-- index.html linie 342-353 -->
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
  media="print"
  onload="this.media='all'"
/>
```

**Problemy:**
1. ❌ **200ms opóźnienie renderingu** (DNS lookup + TLS + download)
2. ❌ **Brak `font-display: swap`** → potencjalny FOIT (Flash of Invisible Text)
3. ❌ **Lighthouse warning:** "Ensure text remains visible during webfont load"
4. ❌ **Blocking CSS** mimo `media="print"` trick
5. ❌ **Zewnętrzna zależność** (CDN downtime = broken icons)

#### Google Fonts (Outfit + Space Grotesk)
```html
<!-- index.html linie 336-339 -->
<link
  href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&family=Space+Grotesk:wght@300;500;700&display=swap"
  rel="stylesheet"
/>
```

**Problemy:**
1. ⚠️ **100-150ms opóźnienie** (DNS + CSS download + fonts download)
2. ⚠️ **GDPR concerns** (Google może trackować IP użytkowników)
3. ⚠️ **Brak kontroli nad cache timing**
4. ⚠️ **Potencjalny CLS** podczas font swap (mimo `display=swap`)

---

## ✅ ROZWIĄZANIE: Self-Hosting {#rozwiązanie}

### Dlaczego self-hosting?

| Aspekt | CDN | Self-Hosted |
|--------|-----|-------------|
| **DNS Lookup** | 50-100ms | 0ms ✅ |
| **Connection Time** | 50-150ms | 0ms ✅ |
| **Cache Control** | Ograniczona | Pełna ✅ |
| **GDPR** | Problematyczne | Compliant ✅ |
| **Offline** | ❌ | ✅ (z Service Worker) |
| **CLS Prevention** | Trudne | Łatwe (metric overrides) ✅ |
| **Maintenance** | Zero | Minimalna |

### Architektura docelowa

```
assets/fonts/
├── fa-solid-900.woff2          (FontAwesome Solid)
├── fa-brands-400.woff2         (FontAwesome Brands)
├── outfit-300.woff2            (Outfit Light)
├── outfit-400.woff2            (Outfit Regular)
├── outfit-700.woff2            (Outfit Bold)
├── outfit-900.woff2            (Outfit Black)
├── space-grotesk-300.woff2    (Space Grotesk Light)
├── space-grotesk-500.woff2    (Space Grotesk Medium)
└── space-grotesk-700.woff2    (Space Grotesk Bold)
```

**Dlaczego tylko .woff2?**
- ✅ Obsługa > 95% przeglądarek (IE11 nie ma znaczenia w 2025)
- ✅ Najlepsza kompresja (30% mniejsze niż .woff)
- ✅ Natywna obsługa w Chrome 36+, Firefox 39+, Safari 12+, Edge 14+

---

## 🎨 KROK PO KROKU: FontAwesome {#fontawesome}

### Krok 1: Pobierz FontAwesome Free

#### Metoda A: NPM (zalecane)
```bash
cd d:/ProgramData/DominDev/DominDev-Momentum

# Instaluj FontAwesome Free
npm install --save-dev @fortawesome/fontawesome-free

# Lub jeśli nie masz package.json:
npm init -y
npm install --save-dev @fortawesome/fontawesome-free
```

#### Metoda B: Ręczne pobranie
1. Przejdź do: https://fontawesome.com/download
2. Pobierz "FontAwesome Free for the Web"
3. Rozpakuj archiwum

### Krok 2: Skopiuj TYLKO potrzebne fonty

```bash
# Utwórz katalog fonts jeśli nie istnieje
mkdir -p assets/fonts

# Skopiuj TYLKO solid i brands (używane w projekcie)
cp node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2 assets/fonts/
cp node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-400.woff2 assets/fonts/

# OPCJONALNIE: Regular (jeśli używasz .far)
# cp node_modules/@fortawesome/fontawesome-free/webfonts/fa-regular-400.woff2 assets/fonts/
```

**Weryfikacja:**
```bash
ls -lh assets/fonts/fa-*.woff2

# Oczekiwany output:
# fa-brands-400.woff2  (~130KB)
# fa-solid-900.woff2   (~160KB)
```

### Krok 3: Dodaj @font-face do CSS

**Otwórz `style.css` i dodaj na początku (po :root):**

```css
/* ===========================================
   FONTAWESOME SELF-HOSTED
   =========================================== */

/* Font Awesome Solid (900) */
@font-face {
  font-family: 'Font Awesome 6 Free';
  font-style: normal;
  font-weight: 900;
  font-display: swap; /* ← KLUCZOWE! Eliminuje FOIT */
  src: url('../fonts/fa-solid-900.woff2') format('woff2');
}

/* Font Awesome Brands (400) */
@font-face {
  font-family: 'Font Awesome 6 Brands';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../fonts/fa-brands-400.woff2') format('woff2');
}

/* ===========================================
   FONTAWESOME FALLBACK z METRIC OVERRIDES
   =========================================== */

/* Fallback dla solid icons - zapobiega CLS */
@font-face {
  font-family: 'Font Awesome 6 Free Fallback';
  src: local('Arial');
  size-adjust: 100%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}

/* Fallback dla brand icons */
@font-face {
  font-family: 'Font Awesome 6 Brands Fallback';
  src: local('Arial');
  size-adjust: 100%;
  ascent-override: 85%;
  descent-override: 20%;
  line-gap-override: 0%;
}

/* ===========================================
   FONTAWESOME CLASSES (zastępuje all.min.css)
   =========================================== */

.fa,
.fas,
.fa-solid {
  font-family: 'Font Awesome 6 Free', 'Font Awesome 6 Free Fallback', sans-serif;
  font-weight: 900;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.fab,
.fa-brands {
  font-family: 'Font Awesome 6 Brands', 'Font Awesome 6 Brands Fallback', sans-serif;
  font-weight: 400;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Podstawowe ikony - przykłady najczęściej używanych */
.fa-arrow-up::before { content: "\f062"; }
.fa-robot::before { content: "\f544"; }
.fa-terminal::before { content: "\f120"; }
.fa-paper-plane::before { content: "\f1d8"; }
.fa-check::before { content: "\f00f"; }
.fa-shield-halved::before { content: "\f3ed"; }
.fa-code::before { content: "\f121"; }
.fa-database::before { content: "\f1c0"; }
.fa-bolt::before { content: "\f0e7"; }
.fa-gauge-high::before { content: "\f625"; }
.fa-rocket::before { content: "\f135"; }
.fa-layer-group::before { content: "\f5fd"; }
.fa-cart-shopping::before { content: "\f07a"; }
.fa-handshake::before { content: "\f2b5"; }
.fa-stethoscope::before { content: "\f0f1"; }
.fa-plug::before { content: "\f1e6"; }
.fa-screwdriver-wrench::before { content: "\f7d9"; }
.fa-money-bill-wave::before { content: "\f53a"; }
.fa-ban::before { content: "\f05e"; }
.fa-power-off::before { content: "\f011"; }
.fa-arrow-right::before { content: "\f061"; }

/* Brands */
.fa-linkedin::before,
.fa-linkedin-in::before { content: "\f0e1"; }
.fa-github::before { content: "\f09b"; }
.fa-instagram::before { content: "\f16d"; }
.fa-react::before { content: "\f41b"; }
.fa-aws::before { content: "\f375"; }
```

**UWAGA:** To tylko podstawowy zestaw ikon. Jeśli używasz więcej, dodaj je ręcznie lub użyj pełnego pliku `all.min.css` z FontAwesome (ale to zwiększy rozmiar CSS).

### Krok 4: Usuń CDN z HTML

**Otwórz `index.html` i USUŃ linie 342-353:**

```html
<!-- ❌ USUŃ TO: -->
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
  media="print"
  onload="this.media='all'"
/>
<noscript>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
  />
</noscript>
```

**RÓWNIEŻ USUŃ linie 313 (dns-prefetch dla cdnjs):**
```html
<!-- ❌ USUŃ: -->
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
```

### Krok 5: Test FontAwesome

**Otwórz stronę w przeglądarce i sprawdź:**

1. **Wszystkie ikony renderują się poprawnie:**
   - Nawigacja: arrow-up, robot, terminal
   - Usługi: rocket, layer-group, cart, handshake
   - Social: linkedin, github, instagram

2. **Network tab:**
   - ✅ Zero requestów do `cdnjs.cloudflare.com`
   - ✅ `fa-solid-900.woff2` i `fa-brands-400.woff2` ładowane z `/assets/fonts/`
   - ✅ Status 200, rozmiar ~290KB total

3. **Performance:**
   - Otwórz Chrome DevTools → Lighthouse
   - Uruchom audit
   - ✅ Warning "Ensure text remains visible" powinien zniknąć

---

## 🎯 KROK PO KROKU: Google Fonts {#google-fonts}

### Krok 1: Pobierz fonty lokalnie

#### Metoda A: Google Webfonts Helper (ZALECANE)
1. Przejdź do: **https://gwfh.mranftl.com/fonts**
2. Wyszukaj "Outfit"
3. Wybierz styles: `300`, `400`, `700`, `900`
4. Charset: **latin**
5. Scroll down → **Download files**
6. Rozpakuj, przejdź do `/fonts/`, skopiuj `*.woff2` do `assets/fonts/`

Powtórz dla "Space Grotesk" (styles: `300`, `500`, `700`)

#### Metoda B: NPM Fontsource
```bash
npm install @fontsource/outfit @fontsource/space-grotesk

# Skopiuj pliki
cp node_modules/@fontsource/outfit/files/outfit-latin-300-normal.woff2 assets/fonts/outfit-300.woff2
cp node_modules/@fontsource/outfit/files/outfit-latin-400-normal.woff2 assets/fonts/outfit-400.woff2
cp node_modules/@fontsource/outfit/files/outfit-latin-700-normal.woff2 assets/fonts/outfit-700.woff2
cp node_modules/@fontsource/outfit/files/outfit-latin-900-normal.woff2 assets/fonts/outfit-900.woff2

cp node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-300-normal.woff2 assets/fonts/space-grotesk-300.woff2
cp node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2 assets/fonts/space-grotesk-500.woff2
cp node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2 assets/fonts/space-grotesk-700.woff2
```

**Weryfikacja:**
```bash
ls -lh assets/fonts/*.woff2

# Powinno być 9 plików:
# fa-brands-400.woff2
# fa-solid-900.woff2
# outfit-300.woff2
# outfit-400.woff2
# outfit-700.woff2
# outfit-900.woff2
# space-grotesk-300.woff2
# space-grotesk-500.woff2
# space-grotesk-700.woff2
```

### Krok 2: Oblicz Font Metric Overrides

**Dlaczego metric overrides?**
Gdy font ładuje się, przeglądarka najpierw renderuje tekst w fallback foncie (Arial/sans-serif). Gdy prawdziwy font się załaduje, następuje swap → **potencjalny layout shift (CLS)**.

Font metric overrides pozwalają "dopasować" fallback font do wymiarów docelowego fontu → **CLS = 0**.

#### Narzędzie: Fontaine (automatyczne)
```bash
npm install -g @capsizecss/metrics

# Dla Outfit
npx @capsizecss/metrics "Outfit" --output json

# Output przykładowy:
{
  "capHeight": 700,
  "ascent": 1050,
  "descent": -250,
  "lineGap": 0,
  "unitsPerEm": 1000
}

# Oblicz size-adjust:
size-adjust = (Outfit UPM / Arial UPM) × 100%
            = (1000 / 2048) × 100% ≈ 48.8%

# NIE! To złe obliczenie. Użyj narzędzia poniżej.
```

#### Narzędzie: Screenspan Fallback Calculator (ZALECANE)
1. Przejdź do: **https://screenspan.net/fallback**
2. Wklej font file: `outfit-400.woff2`
3. Wybierz fallback: `Arial`
4. Kliknij **Calculate**
5. Skopiuj wygenerowany CSS

**Przykładowy output dla Outfit:**
```css
@font-face {
  font-family: 'Outfit Fallback';
  src: local('Arial');
  size-adjust: 102.5%;
  ascent-override: 95%;
  descent-override: 25%;
  line-gap-override: 0%;
}
```

Powtórz dla Space Grotesk.

### Krok 3: Dodaj @font-face do CSS

**Otwórz `style.css` i dodaj PO sekcji FontAwesome:**

```css
/* ===========================================
   GOOGLE FONTS SELF-HOSTED - OUTFIT
   =========================================== */

/* Fallback z metric overrides (zapobiega CLS) */
@font-face {
  font-family: 'Outfit Fallback';
  src: local('Arial');
  size-adjust: 102.5%;
  ascent-override: 95%;
  descent-override: 25%;
  line-gap-override: 0%;
}

/* Outfit Light (300) */
@font-face {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url('../fonts/outfit-300.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Outfit Regular (400) */
@font-face {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../fonts/outfit-400.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Outfit Bold (700) */
@font-face {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('../fonts/outfit-700.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Outfit Black (900) */
@font-face {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url('../fonts/outfit-900.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* ===========================================
   GOOGLE FONTS SELF-HOSTED - SPACE GROTESK
   =========================================== */

/* Fallback z metric overrides */
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
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Space Grotesk Medium (500) */
@font-face {
  font-family: 'Space Grotesk';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('../fonts/space-grotesk-500.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Space Grotesk Bold (700) */
@font-face {
  font-family: 'Space Grotesk';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('../fonts/space-grotesk-700.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

### Krok 4: Update CSS Variables z fallback

**Znajdź w `style.css` (linia 11-12) i ZMIEŃ:**

```css
/* PRZED: */
:root {
  --font-main: "Space Grotesk", sans-serif;
  --font-display: "Outfit", sans-serif;
}

/* PO: */
:root {
  --font-main: "Space Grotesk", "Space Grotesk Fallback", sans-serif;
  --font-display: "Outfit", "Outfit Fallback", sans-serif;
}
```

**Dlaczego dodajemy fallback font do stack?**
Jeśli prawdziwy font się nie załaduje (błąd sieci), fallback z metric overrides zapewni podobne wymiary tekstu → mniejsze CLS.

### Krok 5: Usuń Google Fonts z HTML

**Otwórz `index.html` i USUŃ:**

**Linie 311-317 (DNS prefetch + preconnect):**
```html
<!-- ❌ USUŃ: -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://fonts.gstatic.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

**Linie 336-339 (Google Fonts link):**
```html
<!-- ❌ USUŃ: -->
<link
  href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&family=Space+Grotesk:wght@300;500;700&display=swap"
  rel="stylesheet"
/>
```

### Krok 6: OPCJONALNIE - Preload critical fonts

**Jeśli chcesz przyspieszyć ładowanie najważniejszych fontów:**

**Dodaj w `<head>` (po meta tags, przed stylesheets):**
```html
<!-- Preload krytycznych fontów dla faster FCP -->
<link
  rel="preload"
  href="assets/fonts/outfit-900.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
<link
  rel="preload"
  href="assets/fonts/space-grotesk-500.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

**UWAGA:** Preloaduj TYLKO fonty używane above-the-fold (hero section). Nie preloaduj wszystkich 9 fontów → marnowanie bandwidth!

### Krok 7: Test Google Fonts

1. **Visual regression:**
   - Porównaj screenshoty strony przed/po
   - Typografia powinna wyglądać IDENTYCZNIE

2. **Network tab:**
   - ✅ Zero requestów do `fonts.googleapis.com` i `fonts.gstatic.com`
   - ✅ Wszystkie .woff2 ładowane z `/assets/fonts/`
   - ✅ Total font size ~200-300KB (zależnie od używanych weights)

3. **Lighthouse:**
   - FCP powinien się poprawić o 80-150ms
   - CLS powinien być bliski 0

---

## 🔬 FONT METRIC OVERRIDES - DEEP DIVE {#font-metric-overrides}

### Czym są metric overrides?

CSS deskryptory pozwalające "dopasować" wymiary fallback fontu do docelowego fontu.

**Dostępne overrides:**
- `size-adjust`: Skalowanie całkowite fontu (%)
- `ascent-override`: Wysokość nad baseline (%)
- `descent-override`: Głębokość pod baseline (%)
- `line-gap-override`: Odstęp między liniami (%)

### Jak działają?

```css
/* BEZ metric overrides: */
@font-face {
  font-family: 'Outfit';
  src: url('outfit-400.woff2');
  font-display: swap;
}

body {
  font-family: 'Outfit', Arial, sans-serif;
  font-size: 16px;
}

/* Proces renderingu:
1. Przeglądarka zaczyna ładować Outfit (100-200ms)
2. W międzyczasie renderuje tekst w Arial
3. Arial ma INNE wymiary niż Outfit:
   - Arial: wysoki ascent (90%), mały descent (22%)
   - Outfit: niższy ascent (85%), większy descent (30%)
4. Gdy Outfit się załaduje → SWAP → tekst "skacze" (CLS!)
*/

/* Z metric overrides: */
@font-face {
  font-family: 'Outfit Fallback';
  src: local('Arial');
  ascent-override: 85%;  /* ← Dopasowane do Outfit */
  descent-override: 30%; /* ← Dopasowane do Outfit */
  size-adjust: 102%;     /* ← Outfit jest 2% większy */
}

body {
  font-family: 'Outfit', 'Outfit Fallback', sans-serif;
}

/* Teraz:
1. Przeglądarka renderuje w "Outfit Fallback" (= modified Arial)
2. Modified Arial ma PRAWIE identyczne wymiary jak Outfit
3. Gdy Outfit się załaduje → SWAP → minimalne przesunięcie → CLS ≈ 0!
*/
```

### Przykład wizualny

```
┌─────────────────────────────────────┐
│ BEZ METRIC OVERRIDES:               │
│                                     │
│ [Loading] Arial:                   │
│ The quick brown FOX                │  ← Arial
│ jumps over the lazy dog            │
│                                     │
│ [Loaded] Outfit:                   │
│ The quick brown FOX                │  ← Outfit (większy!)
│ jumps over the                     │  ← "dog" przeskoczył do nowej linii!
│ lazy dog                           │  ← CLS = 0.15 (duży skok)
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Z METRIC OVERRIDES:                 │
│                                     │
│ [Loading] Outfit Fallback:         │
│ The quick brown FOX                │  ← Modified Arial (dopasowany)
│ jumps over the lazy dog            │
│                                     │
│ [Loaded] Outfit:                   │
│ The quick brown FOX                │  ← Outfit (prawie identyczny!)
│ jumps over the lazy dog            │  ← Bez przeskoków!
│                                     │  ← CLS = 0.001 (niemal 0)
└─────────────────────────────────────┘
```

### Jak obliczyć overrides ręcznie?

**Potrzebne dane (z font metadata):**
1. `unitsPerEm` (UPM) - najczęściej 1000 lub 2048
2. `ascent` - wysokość nad baseline
3. `descent` - głębokość pod baseline
4. `lineGap` - odstęp między liniami

**Przykład dla Outfit:**
```
Outfit metrics (z FontForge / fontkit):
- unitsPerEm: 1000
- ascent: 950
- descent: 250
- lineGap: 0

Arial metrics:
- unitsPerEm: 2048
- ascent: 1854
- descent: 434
- lineGap: 0

Obliczenia:
ascent-override = (Outfit ascent / Outfit UPM) × 100%
                = (950 / 1000) × 100% = 95%

descent-override = (Outfit descent / Outfit UPM) × 100%
                 = (250 / 1000) × 100% = 25%

line-gap-override = (Outfit lineGap / Outfit UPM) × 100%
                  = (0 / 1000) × 100% = 0%

size-adjust = (średnia wysokość znaku Outfit / średnia wysokość znaku Arial) × 100%
            ≈ 102% (wymaga testów wizualnych)
```

**W praktyce:** Użyj narzędzia https://screenspan.net/fallback - robi to automatycznie!

---

## ✅ TESTING & VALIDATION {#testing}

### Pre-deployment Checklist

#### 1. Visual Regression Testing
```bash
# Zrób screenshoty PRZED zmianami
# (Użyj Chrome DevTools Device Toolbar)

# Desktop (1920x1080)
# Tablet (768x1024)
# Mobile (375x667)

# Zapisz jako: before-desktop.png, before-tablet.png, before-mobile.png
```

**Po wdrożeniu:**
```bash
# Zrób te same screenshoty
# Porównaj piksel-po-pikselu (narzędzie: PixelMatch, Resemble.js)

# Różnice powinny być ZERO (poza antyaliasing artifacts)
```

#### 2. Font Loading Test

**Chrome DevTools → Network tab:**
```
Filtr: "woff2"

✅ Sprawdź:
- fa-solid-900.woff2: Status 200, Size ~160KB, Time < 50ms (z cache)
- fa-brands-400.woff2: Status 200, Size ~130KB
- outfit-300.woff2: Status 200
- outfit-400.woff2: Status 200
- outfit-700.woff2: Status 200
- outfit-900.woff2: Status 200
- space-grotesk-300.woff2: Status 200
- space-grotesk-500.woff2: Status 200
- space-grotesk-700.woff2: Status 200

❌ Błędy:
- Status 404 → Sprawdź ścieżkę w @font-face (../fonts/ vs /assets/fonts/)
- Status 0 (CORS error) → Dodaj Access-Control-Allow-Origin header
- Długi czas (> 200ms) → Sprawdź server config (compression, cache)
```

#### 3. Lighthouse Audit

**Przed zmianami:**
```bash
# Chrome DevTools → Lighthouse
# Mode: Navigation
# Device: Mobile
# Categories: Performance

# Zapisz wyniki:
FCP: ~1.2s
LCP: ~1.8s
CLS: ~0.05
Performance Score: 85
```

**Po zmianach:**
```bash
# Ten sam audit

# Oczekiwane rezultaty:
FCP: ~0.9s (↓ 300ms) ✅
LCP: ~1.5s (↓ 300ms) ✅
CLS: ~0.01 (↓ 0.04) ✅
Performance Score: 92 (↑ 7 points) ✅

# Sprawdź że warning znikł:
❌ "Ensure text remains visible during webfont load" → Powinien zniknąć!
```

#### 4. Cross-Browser Testing

**Test matrix:**
| Browser | Version | OS | Result |
|---------|---------|-----|--------|
| Chrome | 120+ | Windows/Mac | ✅ |
| Firefox | 115+ | Windows/Mac | ✅ |
| Safari | 16+ | Mac/iOS | ✅ |
| Edge | 120+ | Windows | ✅ |
| Samsung Internet | Latest | Android | ✅ |

**Sprawdź:**
- [ ] Wszystkie fonty renderują się poprawnie
- [ ] Typografia wygląda identycznie jak przed
- [ ] Brak console errors
- [ ] Network tab: fonty ładowane lokalnie

#### 5. Slow Connection Test

**Chrome DevTools → Network → Throttling: Slow 3G**

**Sprawdź:**
- [ ] Tekst renderuje się NATYCHMIAST (fallback font)
- [ ] Po 2-3 sekundach: smooth swap do docelowego fontu
- [ ] Brak "flash of invisible text" (FOIT)
- [ ] Brak dużych layout shifts (CLS < 0.05)

---

## 🔧 TROUBLESHOOTING {#troubleshooting}

### Problem 1: Fonty się nie ładują (404 Not Found)

**Symptom:**
```
Network tab:
GET /assets/fonts/outfit-400.woff2 404 (Not Found)
```

**Przyczyna:**
Nieprawidłowa ścieżka w `@font-face`.

**Rozwiązanie:**

**A. Sprawdź strukturę katalogów:**
```bash
ls -la assets/fonts/

# Powinno być:
drwxr-xr-x  fonts/
-rw-r--r--  fa-solid-900.woff2
-rw-r--r--  outfit-400.woff2
...
```

**B. Sprawdź ścieżkę w CSS:**
```css
/* style.css jest w ROOT projektu, więc: */
@font-face {
  src: url('../fonts/outfit-400.woff2'); /* ❌ ZŁE - zakłada CSS w /css/ */
  src: url('assets/fonts/outfit-400.woff2'); /* ✅ DOBRE */
  src: url('/assets/fonts/outfit-400.woff2'); /* ✅ RÓWNIEŻ OK (absolute) */
}
```

**C. Jeśli CSS jest minifikowany/bundled:**
```css
/* Użyj absolute path: */
@font-face {
  src: url('/assets/fonts/outfit-400.woff2') format('woff2');
}
```

---

### Problem 2: CORS Error (Failed to load font)

**Symptom:**
```
Console:
Access to font at 'https://example.com/assets/fonts/outfit-400.woff2'
from origin 'https://www.example.com' has been blocked by CORS policy
```

**Przyczyna:**
Server nie wysyła `Access-Control-Allow-Origin` header dla fontów.

**Rozwiązanie:**

**Dla Apache (.htaccess):**
```apache
<FilesMatch "\.(woff|woff2|ttf|otf|eot)$">
  Header set Access-Control-Allow-Origin "*"
</FilesMatch>
```

**Dla Nginx:**
```nginx
location ~* \.(woff|woff2|ttf|otf|eot)$ {
  add_header Access-Control-Allow-Origin *;
}
```

**Dla Cloudflare Pages / Vercel / Netlify:**
```
# _headers file
/assets/fonts/*
  Access-Control-Allow-Origin: *
```

---

### Problem 3: Font metric overrides nie działają (CLS nadal wysoki)

**Symptom:**
Lighthouse: CLS = 0.15 (powinno być < 0.05)

**Przyczyna:**
Metric overrides nieprawidłowo obliczone lub fallback font nie w font stack.

**Rozwiązanie:**

**A. Sprawdź font stack w CSS:**
```css
/* ❌ ZŁE: */
body {
  font-family: "Outfit", sans-serif;
}

/* ✅ DOBRE: */
body {
  font-family: "Outfit", "Outfit Fallback", sans-serif;
}
```

**B. Przeliczyć metric overrides:**
1. Użyj https://screenspan.net/fallback
2. Upload REAL font file (nie edytowany)
3. Wybierz CORRECT fallback (Arial dla sans-serif, Times dla serif)
4. Skopiuj wartości 1:1

**C. Test wizualny:**
```javascript
// Dodaj w DevTools Console:
document.fonts.ready.then(() => {
  console.log('All fonts loaded');
});

// Ogranicz ładowanie fontu do testów:
@font-face {
  font-family: 'Outfit';
  src: url('fake-url-to-delay.woff2'); /* ← Nigdy się nie załaduje */
  font-display: swap;
}

// Sprawdź czy fallback font wygląda podobnie do docelowego
```

---

### Problem 4: Icons nie renderują się (kwadraciki �)

**Symptom:**
Zamiast ikon widać: `□` lub `�`

**Przyczyna:**
Brak `::before` content dla używanych ikon LUB nieprawidłowy font-family.

**Rozwiązanie:**

**A. Sprawdź DevTools:**
```javascript
// Computed styles dla <i class="fa-solid fa-rocket">:
font-family: "Font Awesome 6 Free", sans-serif; // ✅
font-weight: 900; // ✅ (dla solid)

// ::before content:
content: "\f135"; // ✅ (rocket icon)
```

**B. Dodaj brakujące ikony do CSS:**
```css
/* Znajdź Unicode dla ikony na: https://fontawesome.com/icons */
.fa-TWOJA-IKONA::before {
  content: "\fXXX"; /* ← Code z FA website */
}
```

**C. Alternatywa: Include pełny all.min.css lokalnie**
```bash
# Skopiuj z FontAwesome package:
cp node_modules/@fortawesome/fontawesome-free/css/all.min.css assets/css/fontawesome.min.css

# Link w HTML:
<link rel="stylesheet" href="assets/css/fontawesome.min.css">
```

**UWAGA:** To zwiększy CSS o ~70KB (minified). Lepiej dodać tylko używane ikony ręcznie.

---

### Problem 5: Typografia wygląda "inaczej" po zmianie

**Symptom:**
Fonty renderują się, ale spacing/sizing nie jest identyczny jak przed.

**Przyczyna:**
Google Fonts używa `hinting` i `subsetting` - lokalny font może mieć inne parametry.

**Rozwiązanie:**

**A. Użyj EXACT tego samego pliku co Google:**
```bash
# Pobierz font bezpośrednio z Google:
curl "https://fonts.googleapis.com/css2?family=Outfit:wght@400&display=swap" -H "User-Agent: Mozilla/5.0"

# Znajdź URL do .woff2 w response
# Pobierz ten EXACT plik
wget <URL-z-response>
```

**B. Fine-tune metric overrides:**
```css
/* Zwiększ/zmniejsz size-adjust o 1-2%: */
@font-face {
  font-family: 'Outfit Fallback';
  src: local('Arial');
  size-adjust: 103%; /* Był 102%, zwiększam o 1% */
  ...
}
```

**C. Porównaj metadane:**
```bash
# Użyj FontForge lub fontkit:
npm install fontkit

node -e "
const fontkit = require('fontkit');
const font = fontkit.openSync('outfit-400.woff2');
console.log('UPM:', font.unitsPerEm);
console.log('Ascent:', font.ascent);
console.log('Descent:', font.descent);
"
```

---

## 📚 DODATKOWE ZASOBY

### Dokumentacja
- **Font-display:** https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display
- **Metric overrides:** https://web.dev/articles/font-fallbacks
- **Web Vitals:** https://web.dev/articles/vitals

### Narzędzia
- **Fallback calculator:** https://screenspan.net/fallback
- **Font subsetter:** https://github.com/zachleat/glyphhanger
- **Font analyzer:** https://wakamaifondue.com/

### Case Studies
- **Next.js @next/font:** https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
- **Nuxt Fontaine:** https://github.com/nuxt-modules/fontaine
- **Shopify font optimization:** https://shopify.engineering/how-shopify-uses-webfonts

---

**Dokument stworzony:** 2025-11-29
**Wersja:** 1.0
**Autor:** Claude (Anthropic)
