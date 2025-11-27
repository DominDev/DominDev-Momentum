# 🚀 DominDev Momentum

High-Performance Portfolio Landing Page z efektem Matrix.

## ⚡ Quick Start

### Development (localhost)
```bash
# Po prostu otwórz w przeglądarce
index.html
```

**Gotowe!** Żadnych buildów, instalacji, kompilacji.

---

## 📦 Przed wdrożeniem na produkcję

### TL;DR: Minifikacja to usunięcie spacji z CSS (40% mniejszy plik = szybsze ładowanie)

```bash
# 1. Zminifikuj CSS (zalecane!)
node _scripts/minify-css.js

# 2. Zmień w index.html:
# <link rel="stylesheet" href="style.css" />
# na:
# <link rel="stylesheet" href="style.min.css" />

# 3. Wrzuć wszystko na serwer
```

**❓ Nie rozumiesz co to minifikacja?** → [Przeczytaj proste wyjaśnienie](_docs/MINIFICATION-EXPLAINED.md)

---

## 📊 Performance Metrics

Po otwarciu strony sprawdź **HUD** (prawy dolny róg):

- 🟢 **Zielony (0-1.5s)** - Excellent
- 🟡 **Żółty (1.5-3s)** - Good
- 🔴 **Czerwony (>3s)** - Needs optimization

**Cel:** <1.5s (zielony)

---

## 🔧 Konfiguracja

### Tryb maintenance
```javascript
// js/config.js
export const CONFIG = {
  maintenanceMode: true,  // Strona niedostępna
  enablePreloader: true   // Animacja ładowania
};
```

Lub w URL:
```
index.html?admin=true  # Pomiń maintenance mode
```

---

## 📁 Struktura projektu

```
/
├── index.html              # Główna strona
├── style.css              # Style (development)
├── style.min.css          # Style (production) - generowane
├── js/
│   ├── main.js            # Entry point
│   ├── config.js          # Konfiguracja
│   ├── core/              # Główne moduły (Matrix, UI)
│   └── modules/           # Funkcje (chatbot, HUD, portfolio)
├── _docs/                 # Dokumentacja (opcjonalna)
└── _scripts/              # Build tools (opcjonalne)
```

---

## 🎨 Features

- ✅ Matrix background animation (pausuje się gdy off-screen)
- ✅ Preloader z animacją
- ✅ Lazy-loaded chatbot (ładuje się tylko na hover/click)
- ✅ Performance HUD (real-time load time)
- ✅ Maintenance mode
- ✅ Responsive design
- ✅ Custom cursor effects
- ✅ Portfolio showcase
- ✅ Contact form

---

## 🚀 Performance Optimizations

- **User-centric metrics** - HUD mierzy "perceived speed"
- **Zero CPU waste** - Matrix pausuje się gdy poza viewport
- **Lazy loading** - Chatbot ładuje się tylko na żądanie
- **Async resources** - Font Awesome nie blokuje renderowania
- **DNS Prefetch** - Szybsze łączenie z CDN

**Rezultat:** Load time **0.3-1.5s** (vs 1.2-2.0s przed optymalizacją)

---

## 📚 Dokumentacja

Szczegółowa dokumentacja (opcjonalna):
- **[MINIFICATION-EXPLAINED.md](_docs/MINIFICATION-EXPLAINED.md)** - Co to jest minifikacja? (ZACZNIJ TU!)
- [QUICK-START.md](_docs/QUICK-START.md) - Szczegółowy quick start
- [OPTIMIZATION-GUIDE.md](_docs/OPTIMIZATION-GUIDE.md) - Pełny przewodnik optymalizacji
- [CHANGELOG.md](_docs/CHANGELOG.md) - Historia zmian

**Nie musisz** ich czytać, żeby użyć projektu lokalnie. Są dla ciekawskich 😉

---

## 🐛 Troubleshooting

### HUD pokazuje wysokie wartości?
- Sprawdź Network tab (F12) - może masz throttling włączony
- Sprawdź czy używasz `.min.css` (jeśli na produkcji)

### Chatbot się nie ładuje?
- Sprawdź console (F12) - będzie informacja o błędzie
- Upewnij się że `js/modules/chatbot.js` istnieje

### Matrix zacina się?
- To normalne na starszych komputerach
- Automatycznie pausuje się gdy scrollujesz w dół

---

## 📧 Contact

- **Email:** contact@domindev.com
- **Portfolio:** https://domindev.com
- **Issues:** GitHub Issues

---

## 📄 License

MIT License - używaj jak chcesz!

---

**Gotowy do startu?** Otwórz `index.html` i sprawdź HUD! 🚀
