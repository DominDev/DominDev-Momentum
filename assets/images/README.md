# 📸 Images Directory - Struktura i Workflow

## 📂 Struktura Katalogów

```
assets/images/
│
├── portfolio/
│   ├── originals/          ⬅ UMIEŚĆ TUTAJ oryginalne obrazy portfolio
│   │   ├── kraft.jpg
│   │   ├── neon-estate.png
│   │   └── techgear.jpg
│   │
│   └── (wygenerowane warianty przez skrypt)
│       kraft-400.avif, kraft-400.webp, kraft-400.jpg
│       kraft-800.avif, kraft-800.webp, kraft-800.jpg
│       kraft-1200.avif, kraft-1200.webp, kraft-1200.jpg
│       kraft-1600.avif, kraft-1600.webp, kraft-1600.jpg
│
├── about/
│   ├── originals/          ⬅ UMIEŚĆ TUTAJ obrazy do sekcji "O mnie"
│   │   └── coding-setup.jpg
│   │
│   └── (wygenerowane warianty)
│
├── social/
│   ├── originals/          ⬅ UMIEŚĆ TUTAJ OG image (min. 1200x630px)
│   │   └── og-image.png
│   │
│   └── (wygenerowane warianty)
│       og-image-social.webp (1200x630 dla Facebook/Twitter)
│       og-image-social.jpg
│
└── icons/                  (favicons - nie dotykaj)
    ├── favicon.ico
    ├── favicon-32x32.png
    ├── favicon-16x16.png
    └── apple-touch-icon.png
```

---

## ⚡ Quick Workflow

### Dodawanie nowego obrazu:

1. **Pobierz/Stwórz obraz** (min. 1600px szerokości, wysokiej jakości)

2. **Umieść w odpowiednim folderze `originals/`:**
   ```
   Portfolio → assets/images/portfolio/originals/
   About → assets/images/about/originals/
   Social → assets/images/social/originals/
   ```

3. **Uruchom skrypt optymalizacji:**
   ```bash
   node _scripts/optimize-images.js
   ```

4. **Gotowe!** Skrypt wygeneruje wszystkie warianty automatycznie.

---

## 📋 Wymagania dla obrazów:

### Portfolio & About:
- **Min. szerokość:** 1600px
- **Formaty źródłowe:** JPG, PNG, WebP, TIFF
- **Jakość:** Wysokiej jakości (nie bardzo skompresowane)
- **Aspect ratio:** Dowolny (skrypt zachowa proporcje)

### Social (OG Image):
- **Dokładny rozmiar:** 1200x630px
- **Format źródłowy:** PNG lub JPG
- **Jakość:** Wysoka (to obraz preview dla Facebook/Twitter)

---

## ⚠️ WAŻNE ZASADY

### ✅ DO:
- Używaj oryginalnych, wysokiej jakości obrazów
- Umieszczaj TYLKO w folderach `originals/`
- Nazywaj pliki bez polskich znaków i spacji: `kraft.jpg` ✓
- Używaj rozmiaru min. 1600px dla portfolio/about

### ❌ NIE:
- NIE edytuj ręcznie plików poza `originals/` (zostaną nadpisane)
- NIE używaj bardzo skompresowanych JPEGów
- NIE używaj małych obrazów (< 1200px)
- NIE nazywaj plików: `mój obraz (1).jpg` ✗

---

## 🔄 Re-optymalizacja

Jeśli chcesz zmienić oryginalny obraz:

1. Zastąp plik w `originals/`
2. Uruchom `node _scripts/optimize-images.js`
3. Stare warianty zostaną nadpisane nowymi

---

## 📊 Co generuje skrypt?

Dla każdego obrazu w `originals/`:

| Nazwa pliku | Warianty |
|-------------|----------|
| `kraft.jpg` | kraft-400.avif, kraft-400.webp, kraft-400.jpg<br>kraft-800.avif, kraft-800.webp, kraft-800.jpg<br>kraft-1200.avif, kraft-1200.webp, kraft-1200.jpg<br>kraft-1600.avif, kraft-1600.webp, kraft-1600.jpg |
| **TOTAL:** | **12 plików** (4 rozmiary × 3 formaty) |

---

## 🎯 Rezultaty:

- **AVIF:** -90% rozmiaru (Chrome 85+, Safari 16+, Edge 121+)
- **WebP:** -70% rozmiaru (szeroka kompatybilność)
- **JPEG:** Legacy fallback (wszystkie przeglądarki)

Przeglądarka automatycznie wybiera najlepszy format i rozmiar dla danego urządzenia.

---

📖 **Pełna dokumentacja:** Zobacz [IMAGE-OPTIMIZATION-GUIDE.md](../../IMAGE-OPTIMIZATION-GUIDE.md) w katalogu głównym projektu.
