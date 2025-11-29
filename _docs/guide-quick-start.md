---
title: Quick Start Guide
created: 2025-09-15
updated: 2025-11-29
status: current
type: core-guide
tags: [quick-start, setup, development]
---

# ⚡ Quick Start Guide

## Development

### Lokalne uruchomienie
```bash
# Po prostu otwórz w przeglądarce
index.html
```

### Tryb maintenance
```bash
# Dodaj parametr w URL
index.html?admin=true
```

## Build dla Production

### 1. Minifikacja CSS
```bash
node minify-css.js
```

LUB z npm:
```bash
npm run build
```

### 2. Zmień linki w HTML
```html
<!-- Development -->
<link rel="stylesheet" href="style.css" />

<!-- Production -->
<link rel="stylesheet" href="style.min.css" />
```

## Konfiguracja

### js/config.js
```javascript
export const CONFIG = {
  maintenanceMode: false,  // true = strona niedostępna
  enablePreloader: true,   // false = skip preloadera
  // ...
};
```

## Testing Performance

### Chrome DevTools
1. F12 → Network tab
2. Throttle: "Fast 3G"
3. Hard refresh: Ctrl+Shift+R
4. Sprawdź HUD (prawy dolny róg)

### Target Metrics
- 🟢 HUD Load Time: <1.5s
- 🟢 Lighthouse Score: 90+
- 🟢 First Contentful Paint: <1.2s

## File Structure

```
/
├── index.html              # Main HTML
├── style.css              # Development CSS
├── style.min.css          # Production CSS (build)
├── js/
│   ├── config.js          # App configuration
│   ├── main.js            # Entry point
│   ├── core/
│   │   ├── matrix.js      # Background animation
│   │   └── ui.js          # UI interactions
│   └── modules/
│       ├── chatbot.js     # Lazy-loaded chatbot
│       ├── hud.js         # Performance HUD
│       └── ...
└── minify-css.js          # Build tool
```

## Common Tasks

### Dodanie nowej sekcji
1. Dodaj HTML w `index.html`
2. Dodaj style w `style.css`
3. Jeśli potrzebny JS, utwórz w `js/modules/`
4. Import w `js/main.js`

### Zmiana kolorów HUD
Edytuj `js/modules/hud.js`:
```javascript
if (seconds < 1.5) {
  loadTimeElement.style.color = "#4ade80"; // Green
} else if (seconds < 3.0) {
  loadTimeElement.style.color = "#facc15"; // Yellow
} else {
  loadTimeElement.style.color = "#ef4444"; // Red
}
```

### Wyłączenie chatbota
W `js/main.js` zakomentuj:
```javascript
// const chatTrigger = document.getElementById("chatbot-trigger");
// if (chatTrigger) { ... }
```

## Troubleshooting

### HUD pokazuje wysokie wartości
- Sprawdź Network tab (DevTools)
- Zweryfikuj czy używasz `.min.css`
- Sprawdź throttling (może być włączony)

### Matrix zacina się
- Sprawdź console (F12)
- Sprawdź czy Intersection Observer działa
- Możliwe że Preloader nie został zatrzymany

### Chatbot się nie ładuje
- Sprawdź console - powinna być informacja o błędzie
- Sprawdź czy plik `js/modules/chatbot.js` istnieje
- Sprawdź czy `chatbot-db.json` jest dostępny

## Deploy Checklist

- [ ] `npm run build` (minifikacja)
- [ ] Zmień link na `style.min.css` w HTML
- [ ] Test na production URL
- [ ] Lighthouse audit
- [ ] Test na mobile (3G)
- [ ] Sprawdź HUD na live

## Performance Monitoring

### Real-time
Sprawdź HUD w prawym dolnym rogu (System Bar):
```
LOAD: 0.45s  ← Twój wynik
```

### Detailed Analysis
```javascript
// W console DevTools
performance.getEntriesByType("navigation")[0]
```

## Support

- 📖 Pełna dokumentacja: `guide-optimization.md`
- 📝 Historia zmian: `CHANGELOG.md`
- 🐛 Issues: GitHub Issues
- 📧 Contact: contact@domindev.com

---

**Gotowe do startu? Otwórz `index.html` i sprawdź HUD!** 🚀
