# 📚 Dokumentacja - DominDev Momentum

## 🖼️ Optymalizacja Obrazów

### Quick Start
- **[Quick Image Optimization](quick-image-optimization.md)** - 3 kroki do ultra-wydajnych obrazów

### Pełna Dokumentacja
- **[Image Optimization Guide](image-optimization-guide.md)** - Kompletny przewodnik (instalacja, użycie, troubleshooting)
- **[Image Optimization Setup](image-optimization-setup.md)** - Setup complete summary
- **[Testing Responsive Images](testing-responsive-images.md)** - 🧪 Jak testować (DevTools, PageSpeed, różne urządzenia)

---

## 📂 Inne Dokumenty

Dodatkowa dokumentacja znajduje się w odpowiednich katalogach:
- **[assets/images/README.md](../assets/images/README.md)** - Struktura katalogów i workflow dla obrazów

---

## 🚀 Najważniejsze Komendy

```bash
# Optymalizacja obrazów
npm run optimize:images

# Full build (obrazy + CSS)
npm run build

# Minifikacja CSS
npm run minify
```

---

## 💡 Struktura Projektu

```
DominDev-Momentum/
├── docs/                           ← Dokumentacja projektu
│   ├── image-optimization-guide.md
│   ├── quick-image-optimization.md
│   └── image-optimization-setup.md
│
├── assets/images/
│   ├── portfolio/originals/       ← Oryginalne obrazy portfolio
│   ├── about/originals/           ← Oryginalne obrazy sekcji "O mnie"
│   ├── social/originals/          ← Oryginalne OG images
│   └── README.md                  ← Workflow dla obrazów
│
├── _scripts/
│   ├── optimize-images.js         ← Skrypt optymalizacji
│   ├── download-sample-images.ps1 ← Helper (Windows)
│   └── download-sample-images.sh  ← Helper (Linux/Mac)
│
└── index.html                     ← Strona główna
```

---

📖 **Start:** Zobacz [Quick Image Optimization](quick-image-optimization.md) aby rozpocząć.
