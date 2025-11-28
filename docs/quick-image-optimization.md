# ⚡ QUICK START - Image Optimization

## 3 kroki do ultra-wydajnych obrazów:

### 1️⃣ Instalacja (jednorazowo)
```bash
npm install sharp --save-dev
```

### 2️⃣ Przygotuj obrazy
Umieść oryginalne obrazy (min. 1600px szerokości) w folderach:
```
assets/images/portfolio/originals/kraft.jpg
assets/images/about/originals/coding-setup.jpg
assets/images/social/originals/og-image.png
```

### 3️⃣ Uruchom skrypt
```bash
node _scripts/optimize-images.js
```

**✅ GOTOWE!** Skrypt wygeneruje:
- 4 rozmiary (400px, 800px, 1200px, 1600px)
- 3 formaty (AVIF, WebP, JPEG)
- = 12 wariantów na obraz

---

## 📊 Rezultaty:

- **-60% do -80%** rozmiaru obrazów
- **+15-25 punktów** PageSpeed Score
- **-0.5s do -1.5s** LCP (Largest Contentful Paint)
- **Ostre obrazy** na wszystkich urządzeniach (Mobile, Tablet, Desktop, Retina)

---

## 🔧 Dodawanie nowych obrazów:

1. Umieść w `originals/` folder
2. Uruchom `node _scripts/optimize-images.js`
3. Gotowe! (HTML już zaktualizowany z `<picture>` elementami)

---

📖 **Pełna dokumentacja:** [IMAGE-OPTIMIZATION-GUIDE.md](IMAGE-OPTIMIZATION-GUIDE.md)
