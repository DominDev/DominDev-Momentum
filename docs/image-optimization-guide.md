# 🚀 IMAGE OPTIMIZATION GUIDE - HIGH-PERFORMANCE WEB

## 📋 SPIS TREŚCI

1. [Wprowadzenie](#wprowadzenie)
2. [Instalacja i Konfiguracja](#instalacja-i-konfiguracja)
3. [Jak Używać Skryptu](#jak-używać-skryptu)
4. [Struktura Katalogów](#struktura-katalogów)
5. [Co Generuje Skrypt](#co-generuje-skrypt)
6. [Najlepsze Praktyki](#najlepsze-praktyki)
7. [Testowanie i Weryfikacja](#testowanie-i-weryfikacja)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 WPROWADZENIE

Ten projekt używa **zaawansowanej optymalizacji obrazów** dla maksymalnej wydajności na wszystkich urządzeniach:
- 📱 Mobile (320px-768px, 2x/3x Retina)
- 📟 Tablet (768px-1024px, 2x)
- 🖥️ Desktop (1024px+, 1x/2x/3x)

### Czemu to jest ważne?

- **PageSpeed Score:** +15-25 punktów
- **LCP (Largest Contentful Paint):** -0.5s do -1.5s
- **Transfer Size:** -60% do -80% dla obrazów
- **Mobile Data:** Oszczędność ~2-3 MB na pełne załadowanie strony
- **Retina Display:** Ostre obrazy na iPhone, MacBook, high-DPI ekranach

---

## 🔧 INSTALACJA I KONFIGURACJA

### 1. Zainstaluj Sharp (bibliotekę do przetwarzania obrazów)

```bash
npm install sharp --save-dev
```

**Co to jest Sharp?**
- Najszybsza biblioteka do przetwarzania obrazów w Node.js
- Używa libvips (10x szybsze niż ImageMagick)
- Wspiera AVIF, WebP, JPEG, PNG, TIFF

### 2. Sprawdź czy instalacja się powiodła

```bash
node -e "console.log(require('sharp'))"
```

Jeśli zobaczysz obiekt konfiguracji Sharp - wszystko działa!

---

## 📂 STRUKTURA KATALOGÓW

### Przed uruchomieniem skryptu:

Utwórz foldery `originals/` i umieść w nich oryginalne obrazy:

```
assets/images/
├── portfolio/
│   └── originals/          ← TUTAJ umieść oryginalne obrazy portfolio
│       ├── kraft.jpg       (np. Unsplash download, 2000x1500px)
│       ├── neon-estate.png
│       └── techgear.jpg
│
├── about/
│   └── originals/          ← TUTAJ umieść obrazy do sekcji About
│       └── coding-setup.jpg
│
└── social/
    └── originals/          ← TUTAJ umieść OG image (min. 1200x630px)
        └── og-image.png
```

### Po uruchomieniu skryptu:

```
assets/images/
├── portfolio/
│   ├── originals/
│   │   ├── kraft.jpg       (oryginał - pozostaje bez zmian)
│   │   ├── neon-estate.png
│   │   └── techgear.jpg
│   │
│   ├── kraft-400.avif      ⬅ Wygenerowane automatycznie
│   ├── kraft-400.webp
│   ├── kraft-400.jpg
│   ├── kraft-800.avif
│   ├── kraft-800.webp
│   ├── kraft-800.jpg
│   ├── kraft-1200.avif
│   ├── kraft-1200.webp
│   ├── kraft-1200.jpg
│   ├── kraft-1600.avif
│   ├── kraft-1600.webp
│   ├── kraft-1600.jpg
│   └── ... (to samo dla neon-estate, techgear)
│
├── about/
│   ├── originals/
│   │   └── coding-setup.jpg
│   ├── coding-setup-400.avif
│   ├── ... (wszystkie warianty)
│   └── coding-setup-1600.jpg
│
└── social/
    ├── originals/
    │   └── og-image.png
    ├── og-image-social.webp  (dedykowany 1200x630 dla OG)
    └── og-image-social.jpg
```

---

## ▶️ JAK UŻYWAĆ SKRYPTU

### Krok 1: Przygotuj obrazy

1. Pobierz wysokiej jakości obrazy (min. 1600px szerokości)
2. Umieść je w folderach `originals/`:
   - `assets/images/portfolio/originals/`
   - `assets/images/about/originals/`
   - `assets/images/social/originals/`

**💡 TIP:** Możesz użyć oryginalnych obrazów z Unsplash (2000px+) - skrypt sam je zmniejszy.

### Krok 2: Uruchom skrypt

```bash
node _scripts/optimize-images.js
```

### Krok 3: Poczekaj na zakończenie

Zobaczysz output:

```
═══════════════════════════════════════════════════════════════════
🚀 IMAGE OPTIMIZATION SCRIPT - HIGH-PERFORMANCE WEB
═══════════════════════════════════════════════════════════════════

📂 Przetwarzam katalog: assets/images/portfolio/originals
─────────────────────────────────────────────────────────────────

🖼️  Przetwarzam: kraft.jpg
  📦 Oryginalny rozmiar: 485.23 KB

  📐 Rozmiar: 400px
    ✅ AVIF: 400x300 - 18.45 KB (96% smaller)
    ✅ WEBP: 400x300 - 28.12 KB (94% smaller)
    ✅ JPG: 400x300 - 52.34 KB (89% smaller)

  📐 Rozmiar: 800px
    ✅ AVIF: 800x600 - 45.67 KB (91% smaller)
    ✅ WEBP: 800x600 - 72.89 KB (85% smaller)
    ✅ JPG: 800x600 - 128.45 KB (74% smaller)

  ... (1200px, 1600px)

  💾 Łącznie wygenerowano: 12 wariantów
  💰 Oszczędność miejsca: 2.87 MB

═══════════════════════════════════════════════════════════════════
✅ OPTYMALIZACJA ZAKOŃCZONA
═══════════════════════════════════════════════════════════════════
📊 Statystyki:
   • Przetworzono obrazów: 5
   • Wygenerowano wariantów: 60
   • Czas wykonania: 12.34s
```

---

## 🎨 CO GENERUJE SKRYPT

### Dla każdego obrazu portfolio/about:

| Rozmiar | Format | Użycie | Urządzenia |
|---------|--------|--------|------------|
| 400px | AVIF, WebP, JPG | Mobile 1x, Tablet 1x | iPhone SE, Samsung A-series |
| 800px | AVIF, WebP, JPG | Mobile 2x, Tablet 2x, Desktop 1x | iPhone 12/13, iPad, Desktop HD |
| 1200px | AVIF, WebP, JPG | Mobile 3x, Desktop 2x | iPhone 14 Pro, MacBook Retina |
| 1600px | AVIF, WebP, JPG | Desktop 3x, Large 2x | iMac 5K, Dell UltraSharp |

### Dla obrazów social (OG/Twitter):

| Rozmiar | Format | Użycie |
|---------|--------|--------|
| 1200x630px | WebP, JPG | Facebook, LinkedIn, Twitter Card |

### Jakość kompresji:

- **AVIF:** quality=75, effort=4 (najlepsza kompresja, -90% rozmiaru)
- **WebP:** quality=80, effort=4 (dobra kompresja, -70% rozmiaru)
- **JPEG:** quality=80, progressive, mozjpeg (legacy, wszystkie przeglądarki)

---

## ✅ NAJLEPSZE PRAKTYKI

### 1. Rozmiar oryginalnych obrazów

**Zalecane rozmiary oryginałów:**
- Portfolio/About: min. **1600px** szerokości (lub więcej)
- Social OG: min. **1200x630px** (dokładnie ten rozmiar)

**Czemu duże?** Skrypt zmniejsza obrazy z zachowaniem jakości. Nie potrafi "stworzyć" detali, których nie ma w oryginale.

### 2. Format oryginalnych plików

**Akceptowane formaty:**
- `.jpg` / `.jpeg` (najlepszy dla fotografii)
- `.png` (dla grafik z przezroczystością - ale skrypt i tak wygeneruje jpg/webp/avif)
- `.webp` / `.tiff` (jeśli już masz)

**NIE używaj:**
- Bardzo skompresowanych JPEGów (jakość poniżej 80)
- Upscalowanych obrazów (np. 800px rozciągnięte do 1600px)

### 3. Nazewnictwo plików

**✅ DOBRZE:**
```
kraft.jpg
coding-setup.jpg
og-image.png
```

**❌ ŹLE:**
```
IMG_1234.jpg           (nieinformacyjne)
my photo (1).jpg       (spacje w nazwie)
VERY-LONG-NAME-WITH-MANY-WORDS.jpg (za długie)
```

Skrypt używa nazwy pliku do generowania wariantów: `kraft.jpg` → `kraft-400.avif`

### 4. Co zrobić z Unsplash?

Jeśli używasz obrazów z Unsplash:

**KROK 1:** Pobierz oryginalny obraz (nie używaj URL Unsplash w produkcji):
```
https://images.unsplash.com/photo-XXX?q=100&w=2000&auto=format&fit=crop
```

**KROK 2:** Zapisz jako `kraft.jpg` w `originals/`

**KROK 3:** Uruchom skrypt - wygeneruje wszystkie warianty lokalnie

**CZEMU?**
- Kontrola nad jakością i rozmiarem
- Brak zewnętrznych zależności (Unsplash może zmienić/usunąć obraz)
- AVIF support (Unsplash nie wspiera AVIF)

---

## 🔍 TESTOWANIE I WERYFIKACJA

### 1. Sprawdź czy pliki zostały wygenerowane

```bash
# Windows PowerShell
Get-ChildItem -Recurse assets/images/ -Include *.avif,*.webp,*.jpg | Measure-Object

# Windows CMD
dir /s /b assets\images\*.avif assets\images\*.webp assets\images\*.jpg | find /c /v ""

# Linux/Mac
find assets/images -type f \( -name "*.avif" -o -name "*.webp" -o -name "*.jpg" \) | wc -l
```

**Oczekiwana liczba plików:**
- 1 obraz = 12 wariantów (4 rozmiary × 3 formaty)
- 5 obrazów = 60 wariantów

### 2. Przetestuj w przeglądarce

Otwórz DevTools (F12) → Network → Img:

**Sprawdź:**
- ✅ Przeglądarka pobiera `.avif` (Chrome, Edge, Safari 16+)
- ✅ Na Mobile pobiera `400w` lub `800w` (nie `1600w`)
- ✅ Na Desktop 1x pobiera `800w` (nie `1600w`)
- ✅ Na Retina Desktop pobiera `1200w` lub `1600w`

**Jak przetestować Retina:**
1. DevTools → Device Toolbar (Ctrl+Shift+M)
2. Wybierz "Responsive"
3. Ustaw DPR (Device Pixel Ratio) na 2 lub 3
4. Odśwież stronę
5. Sprawdź czy pobiera większy wariant

### 3. PageSpeed Insights

Przed i po optymalizacji:

```
https://pagespeed.web.dev/
```

**Spodziewane wyniki:**
- **Properly size images:** 🟢 (było 🔴 lub 🟡)
- **Serve images in next-gen formats:** 🟢 (AVIF/WebP)
- **LCP:** -0.5s do -1.5s szybciej
- **Total Score:** +15-25 punktów

### 4. Chrome DevTools Coverage

1. F12 → Coverage (Ctrl+Shift+P → "Show Coverage")
2. Reload strony
3. Sprawdź % niewykorzystanych bajtów dla obrazów

**Oczekiwane:** < 5% (obrazy ładują się w dokładnym rozmiarze potrzebnym dla viewport)

---

## 🐛 TROUBLESHOOTING

### Problem: "Cannot find module 'sharp'"

**Rozwiązanie:**
```bash
npm install sharp --save-dev
```

Jeśli nadal nie działa (Windows):
```bash
npm install --platform=win32 --arch=x64 sharp
```

---

### Problem: "Katalog nie istnieje: assets/images/portfolio/originals"

**Rozwiązanie:**
Utwórz katalogi ręcznie:

```bash
# Windows CMD
mkdir assets\images\portfolio\originals
mkdir assets\images\about\originals
mkdir assets\images\social\originals

# PowerShell/Linux/Mac
mkdir -p assets/images/portfolio/originals
mkdir -p assets/images/about/originals
mkdir -p assets/images/social/originals
```

---

### Problem: "Brak obrazów do przetworzenia"

**Sprawdź:**
1. Czy pliki mają poprawne rozszerzenia: `.jpg`, `.jpeg`, `.png`, `.webp`, `.tiff`
2. Czy pliki są w folderze `originals/` (nie w `portfolio/` bezpośrednio)
3. Czy nazwy plików nie zawierają polskich znaków lub spacji

---

### Problem: Obrazy są rozmazane na Retina

**Możliwe przyczyny:**
1. Oryginalny obraz był za mały (< 1200px)
2. Przeglądarka nie wspiera AVIF/WebP i ładuje JPG (sprawdź w DevTools)
3. Błędny `sizes` attribute w HTML

**Rozwiązanie:**
- Użyj większego oryginału (min. 1600px)
- Sprawdź czy `<picture>` element jest poprawnie zaimplementowany
- Przetestuj w różnych przeglądarkach

---

### Problem: Skrypt działa bardzo wolno

**Przyczyny:**
- Bardzo duże oryginały (> 5000px)
- Wiele obrazów jednocześnie
- Słaby procesor

**Rozwiązanie:**
Zmień `effort` w `_scripts/optimize-images.js`:

```javascript
formats: [
  { ext: 'avif', quality: 75, options: { effort: 2 } },  // było 4
  { ext: 'webp', quality: 80, options: { effort: 2 } },  // było 4
  { ext: 'jpg',  quality: 80, options: { progressive: true } },
]
```

`effort: 2` = 2x szybciej, ale ~10% większe pliki

---

### Problem: "Permission denied" przy zapisie plików

**Rozwiązanie (Windows):**
Uruchom terminal jako Administrator:
1. Kliknij prawym na PowerShell/CMD
2. "Uruchom jako administrator"
3. `cd` do folderu projektu
4. `node _scripts/optimize-images.js`

**Rozwiązanie (Linux/Mac):**
```bash
sudo chown -R $USER:$USER assets/images/
chmod -R 755 assets/images/
```

---

## 📊 EXPECTED PERFORMANCE GAINS

### Przed optymalizacją:

```
Total Image Size: 2.8 MB
LCP: 2.4s
PageSpeed Mobile: 72/100
```

### Po optymalizacji:

```
Total Image Size: 580 KB (-79%)
LCP: 0.9s (-62%)
PageSpeed Mobile: 94/100 (+22 pkt)
```

### Breakdown per device:

| Urządzenie | Transfer Before | Transfer After | Savings |
|------------|-----------------|----------------|---------|
| iPhone SE (375px, 2x) | 485 KB JPG | 72 KB AVIF | **-85%** |
| iPad (768px, 2x) | 1.2 MB JPG | 180 KB AVIF | **-85%** |
| Desktop HD (1920px, 1x) | 485 KB JPG | 128 KB AVIF | **-74%** |
| MacBook Retina (1920px, 2x) | 1.2 MB JPG | 280 KB AVIF | **-77%** |

---

## 🎯 NEXT STEPS

1. ✅ Uruchom skrypt i wygeneruj wszystkie warianty
2. ✅ Sprawdź czy HTML używa `<picture>` elementów (już zaktualizowane)
3. ✅ Przetestuj na różnych urządzeniach
4. ✅ Zmierz PageSpeed Score przed i po
5. 📸 Dodaj nowe obrazy? Powtórz proces:
   - Umieść w `originals/`
   - Uruchom skrypt
   - Zaktualizuj HTML

---

## 📚 DODATKOWE ZASOBY

- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [AVIF vs WebP Comparison](https://jakearchibald.com/2020/avif-has-landed/)
- [Responsive Images Guide](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Can I Use - AVIF](https://caniuse.com/avif)

---

**🚀 Gotowe! Twoja strona jest teraz zoptymalizowana pod kątem maksymalnej wydajności na wszystkich urządzeniach.**

Masz pytania? Sprawdź sekcję [Troubleshooting](#troubleshooting) lub otwórz issue.
