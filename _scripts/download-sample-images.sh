#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# SAMPLE IMAGES DOWNLOADER - Helper Script (Linux/Mac)
# ═══════════════════════════════════════════════════════════════════
#
# Ten skrypt automatycznie pobiera przykładowe obrazy z Unsplash
# do testowania systemu optymalizacji obrazów.
#
# UWAGA: To tylko przykładowy helper do testowania.
# W produkcji zawsze używaj własnych obrazów lub legalnie pobranych z Unsplash!
#
# ═══════════════════════════════════════════════════════════════════
# JAK URUCHOMIĆ:
# ═══════════════════════════════════════════════════════════════════
#
# Linux/Mac:
#   chmod +x _scripts/download-sample-images.sh
#   ./_scripts/download-sample-images.sh
#
# ═══════════════════════════════════════════════════════════════════

# Kolory
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🖼️  SAMPLE IMAGES DOWNLOADER${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Sprawdź czy curl jest zainstalowany
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl nie jest zainstalowany. Zainstaluj curl i spróbuj ponownie.${NC}"
    exit 1
fi

# Utwórz katalogi
echo -e "${YELLOW}📂 Sprawdzam strukturę katalogów...${NC}"
mkdir -p assets/images/portfolio/originals
mkdir -p assets/images/about/originals
mkdir -p assets/images/social/originals
echo -e "${GREEN}   ✅ Katalogi gotowe${NC}"

echo ""
echo -e "${YELLOW}🌐 Pobieram przykładowe obrazy z Unsplash (wysokiej jakości)...${NC}"
echo -e "${GRAY}   (To może potrwać chwilę - obrazy mają ~2000px szerokości)${NC}"
echo ""

SUCCESS=0
FAIL=0

# Funkcja do pobierania obrazu
download_image() {
    local NAME=$1
    local PATH=$2
    local URL=$3
    local DESC=$4

    echo -e "${CYAN}📥 Pobieram: $DESC...${NC}"

    if curl -L -o "$PATH" "$URL" --progress-bar; then
        SIZE=$(du -h "$PATH" | cut -f1)
        echo -e "${GREEN}   ✅ Pobrano: $NAME ($SIZE)${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}   ❌ Błąd podczas pobierania: $NAME${NC}"
        ((FAIL++))
    fi
}

# Pobierz obrazy
download_image "kraft.jpg" \
    "assets/images/portfolio/originals/kraft.jpg" \
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=85&w=2000&auto=format&fit=crop" \
    "Kraft Daily Pub (portfolio)"

download_image "neon-estate.jpg" \
    "assets/images/portfolio/originals/neon-estate.jpg" \
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=85&w=2000&auto=format&fit=crop" \
    "Neon Estate (portfolio)"

download_image "techgear.jpg" \
    "assets/images/portfolio/originals/techgear.jpg" \
    "https://images.unsplash.com/photo-1550009158-9ebf690be2f4?q=85&w=2000&auto=format&fit=crop" \
    "TechGear Store (portfolio)"

download_image "coding-setup.jpg" \
    "assets/images/about/originals/coding-setup.jpg" \
    "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=85&w=2000&auto=format&fit=crop" \
    "Coding Setup (about section)"

download_image "og-image.jpg" \
    "assets/images/social/originals/og-image.jpg" \
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=85&w=1200&h=630&auto=format&fit=crop" \
    "OG Social Image (1200x630)"

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}📊 PODSUMOWANIE${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ Pobrano pomyślnie: $SUCCESS${NC}"
if [ $FAIL -gt 0 ]; then
    echo -e "${RED}   ❌ Błędy: $FAIL${NC}"
fi
echo ""

if [ $SUCCESS -gt 0 ]; then
    echo -e "${YELLOW}🎯 NASTĘPNE KROKI:${NC}"
    echo ""
    echo -e "${NC}   1. Zainstaluj Sharp (jeśli jeszcze nie):${NC}"
    echo -e "${GRAY}      npm install sharp --save-dev${NC}"
    echo ""
    echo -e "${NC}   2. Uruchom optymalizację obrazów:${NC}"
    echo -e "${GRAY}      node _scripts/optimize-images.js${NC}"
    echo -e "${GRAY}      lub: npm run optimize:images${NC}"
    echo ""
    echo -e "${NC}   3. Sprawdź wygenerowane pliki w:${NC}"
    echo -e "${GRAY}      assets/images/portfolio/${NC}"
    echo -e "${GRAY}      assets/images/about/${NC}"
    echo -e "${GRAY}      assets/images/social/${NC}"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}💡 TIP: W produkcji zastąp te obrazy własnymi!${NC}"
    echo -e "${GRAY}    Unsplash Terms: https://unsplash.com/license${NC}"
else
    echo -e "${RED}⚠️  Nie udało się pobrać żadnych obrazów.${NC}"
    echo -e "${YELLOW}    Sprawdź połączenie internetowe lub pobierz obrazy ręcznie.${NC}"
fi

echo ""
