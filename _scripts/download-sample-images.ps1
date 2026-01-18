# ═══════════════════════════════════════════════════════════════════
# SAMPLE IMAGES DOWNLOADER - Helper Script
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
# PowerShell (Windows):
#   .\_scripts\download-sample-images.ps1
#
# Jeśli otrzymasz błąd ExecutionPolicy:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   .\_scripts\download-sample-images.ps1
#
# ═══════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🖼️  SAMPLE IMAGES DOWNLOADER" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Sprawdź czy katalogi originals/ istnieją
$dirs = @(
    "assets\images\portfolio\originals",
    "assets\images\about\originals",
    "assets\images\social\originals"
)

Write-Host "📂 Sprawdzam strukturę katalogów..." -ForegroundColor Yellow
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   ✅ Utworzono: $dir" -ForegroundColor Green
    } else {
        Write-Host "   ✓ Istnieje: $dir" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🌐 Pobieram przykładowe obrazy z Unsplash (wysokiej jakości)..." -ForegroundColor Yellow
Write-Host "   (To może potrwać chwilę - obrazy mają ~2000px szerokości)" -ForegroundColor Gray
Write-Host ""

# Definiuj obrazy do pobrania (Unsplash photo IDs)
$images = @(
    @{
        Name = "kraft.jpg"
        Path = "assets\images\portfolio\originals\kraft.jpg"
        URL = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=85&w=2000&auto=format&fit=crop"
        Description = "Kraft Daily Pub (portfolio)"
    },
    @{
        Name = "neon-estate.jpg"
        Path = "assets\images\portfolio\originals\neon-estate.jpg"
        URL = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=85&w=2000&auto=format&fit=crop"
        Description = "Neon Estate (portfolio)"
    },
    @{
        Name = "techgear.jpg"
        Path = "assets\images\portfolio\originals\techgear.jpg"
        URL = "https://images.unsplash.com/photo-1550009158-9ebf690be2f4?q=85&w=2000&auto=format&fit=crop"
        Description = "TechGear Store (portfolio)"
    },
    @{
        Name = "coding-setup.jpg"
        Path = "assets\images\about\originals\coding-setup.jpg"
        URL = "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=85&w=2000&auto=format&fit=crop"
        Description = "Coding Setup (about section)"
    },
    @{
        Name = "og-image.jpg"
        Path = "assets\images\social\originals\og-image.jpg"
        URL = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=85&w=1200&h=630&auto=format&fit=crop"
        Description = "OG Social Image (1200x630)"
    }
)

$successCount = 0
$failCount = 0

foreach ($img in $images) {
    Write-Host "📥 Pobieram: $($img.Description)..." -ForegroundColor Cyan

    try {
        Invoke-WebRequest -Uri $img.URL -OutFile $img.Path -UseBasicParsing

        # Sprawdź rozmiar pobranego pliku
        $fileSize = (Get-Item $img.Path).Length / 1KB
        Write-Host "   ✅ Pobrano: $($img.Name) ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "   ❌ Błąd podczas pobierania: $($img.Name)" -ForegroundColor Red
        Write-Host "      $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 PODSUMOWANIE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ Pobrano pomyślnie: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "   ❌ Błędy: $failCount" -ForegroundColor Red
}
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "🎯 NASTĘPNE KROKI:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   1. Zainstaluj Sharp (jeśli jeszcze nie):" -ForegroundColor White
    Write-Host "      npm install sharp --save-dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Uruchom optymalizację obrazów:" -ForegroundColor White
    Write-Host "      node _scripts\optimize-images.js" -ForegroundColor Gray
    Write-Host "      lub: npm run optimize:images" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Sprawdź wygenerowane pliki w:" -ForegroundColor White
    Write-Host "      assets\images\portfolio\" -ForegroundColor Gray
    Write-Host "      assets\images\about\" -ForegroundColor Gray
    Write-Host "      assets\images\social\" -ForegroundColor Gray
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 TIP: W produkcji zastąp te obrazy własnymi!" -ForegroundColor Yellow
    Write-Host "    Unsplash Terms: https://unsplash.com/license" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Nie udało się pobrać żadnych obrazów." -ForegroundColor Red
    Write-Host "    Sprawdź połączenie internetowe lub pobierz obrazy ręcznie." -ForegroundColor Yellow
}

Write-Host ""
