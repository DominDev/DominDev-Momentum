# _scripts

Zestaw pomocniczych skryptów dla DominDev Momentum.

## Wymagania (Node)

Obsługiwane wersje: Node.js 22.22.x lub 24.8+.

Główna zależność przetwarzania zasobów:
- `sharp` (`optimize-images.js`)

Instalacja (w root projektu):
```bash
npm ci
```

## Uruchamianie

### Kontrolowany artefakt Cloudflare Pages
```bash
npm run build
```

### Wszystkie bramki jakości
```bash
npm test
```

### Minifikacja CSS (jednorazowo)
```bash
npm run minify
```

### Watcher CSS
```bash
npm run watch
```

### Optymalizacja obrazów
```bash
node _scripts/optimize-images.js
```

### Snapshot (PowerShell)
```powershell
powershell -ExecutionPolicy Bypass -File .\_scripts\snapshot_code.ps1
powershell -ExecutionPolicy Bypass -File .\_scripts\snapshot_structure.ps1
```
