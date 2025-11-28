// js/modules/adaptive-images.js
/**
 * ADAPTIVE IMAGE LOADING - Network-Aware Performance
 *
 * Automatycznie dopasowuje jakość obrazów do:
 * - Szybkości połączenia (4G, 3G, 2G)
 * - Trybu oszczędzania danych (Save-Data)
 */

export function initAdaptiveImages() {
  // Sprawdź czy przeglądarka wspiera Network Information API
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  const saveData = connection?.saveData || false;

  // Wykryj typ połączenia i dostosuj strategie
  const networkStrategy = getNetworkStrategy(connection, saveData);

  console.log(`🌐 Network Strategy: ${networkStrategy.type}`);
  console.log(`📊 Effective Type: ${connection?.effectiveType || "unknown"}`);
  console.log(`💾 Save-Data: ${saveData ? "ON" : "OFF"}`);

  // Zastosuj strategię do wszystkich obrazów
  // WAŻNE: Dla 4G/WiFi funkcja NIE MODYFIKUJE srcset (pozwala przeglądarce samej wybrać)
  applyImageStrategy(networkStrategy);

  // Nasłuchuj zmian połączenia (np. przejście z WiFi na 3G)

  let debounceTimer = null;

  if (connection) {
    connection.addEventListener("change", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const newStrategy = getNetworkStrategy(
          connection,
          connection?.saveData
        );
        console.log(`🔄 Network changed: ${newStrategy.type}`);
        applyImageStrategy(newStrategy);
      }, 300); // Debounce 300ms
    });
  }
}

/**
 * Określa strategię ładowania obrazów na podstawie połączenia
 */
function getNetworkStrategy(connection, saveData) {
  // Priorytet 1: Save-Data mode
  if (saveData) {
    return {
      type: "save-data",
      quality: "low",
      maxWidth: 800,
      format: "webp", // AVIF może być za duży dla weak connection
      lazy: true,
      description: "Data Saver Mode - użytkownik oszczędza transfer",
    };
  }

  // Priorytet 2: Effective Connection Type
  const effectiveType = connection?.effectiveType;

  switch (effectiveType) {
    case "slow-2g":
    case "2g":
      return {
        type: "2g",
        quality: "low",
        maxWidth: 400,
        format: "webp",
        lazy: true,
        description: "2G - bardzo wolne połączenie",
      };

    case "3g":
      return {
        type: "3g",
        quality: "medium",
        maxWidth: 800,
        format: "webp",
        lazy: true,
        description: "3G - średnie połączenie",
      };

    case "4g":
      return {
        type: "4g",
        quality: "high",
        maxWidth: 1600,
        format: "avif",
        lazy: false, // Można preloadować
        description: "4G - szybkie połączenie",
      };

    default:
      // WiFi lub nieznane - zakładamy szybkie
      return {
        type: "wifi",
        quality: "high",
        maxWidth: 1600,
        format: "avif",
        lazy: false,
        description: "WiFi/Unknown - zakładamy szybkie połączenie",
      };
  }
}

/**
 * Aplikuje strategię do wszystkich obrazów na stronie
 */
function applyImageStrategy(strategy) {
  // WAŻNE: Dla szybkich połączeń (4G, WiFi) NIE MODYFIKUJ srcset
  // Pozwól przeglądarce samej wybrać optymalny rozmiar
  const shouldOptimize = strategy.type !== "4g" && strategy.type !== "wifi";

  if (!shouldOptimize) {
    console.log("⚡ Fast connection detected - using native browser selection");
    return; // NIE modyfikuj obrazów dla szybkich połączeń
  }

  // Znajdź wszystkie <picture> elementy
  const pictures = document.querySelectorAll("picture");

  pictures.forEach((picture) => {
    const sources = picture.querySelectorAll("source");
    const img = picture.querySelector("img");

    // Modyfikuj srcset TYLKO dla wolnych połączeń
    sources.forEach((source) => {
      const originalSrcset =
        source.dataset.originalSrcset || source.getAttribute("srcset");

      // Zapisz oryginał (jeśli jeszcze nie)
      if (!source.dataset.originalSrcset) {
        source.dataset.originalSrcset = originalSrcset;
      }

      // Filtruj srcset do max width
      const filteredSrcset = filterSrcsetByWidth(
        originalSrcset,
        strategy.maxWidth
      );
      source.setAttribute("srcset", filteredSrcset);

      // Dla Save-Data: wyłącz AVIF, zostaw tylko WebP/JPEG
      if (
        strategy.format === "webp" &&
        source.getAttribute("type") === "image/avif"
      ) {
        source.setAttribute("media", "(max-width: 0px)"); // Wyłącz bez usuwania
      } else if (source.getAttribute("type") === "image/avif") {
        source.removeAttribute("media"); // Przywróć jeśli potrzebne
      }
    });

    // Dodaj loading="lazy" dla wolnych połączeń
    if (strategy.lazy && img) {
      img.setAttribute("loading", "lazy");
    }
  });

  // Dodaj wskaźnik dla użytkownika (opcjonalnie)
  showNetworkIndicator(strategy);
}

/**
 * Filtruje srcset aby usunąć warianty większe niż maxWidth
 */
function filterSrcsetByWidth(srcset, maxWidth) {
  if (!srcset) return "";

  const entries = srcset.split(",").map((entry) => entry.trim());

  return entries
    .filter((entry) => {
      const match = entry.match(/(\d+)w$/);
      if (!match) return true; // Zachowaj jeśli nie ma width descriptor
      const width = parseInt(match[1]);
      return width <= maxWidth;
    })
    .join(", ");
}

/**
 * Pokazuje wskaźnik typu połączenia (opcjonalnie)
 */
function showNetworkIndicator(strategy) {
  // Usuń stary wskaźnik jeśli istnieje
  const oldIndicator = document.getElementById("network-indicator");
  if (oldIndicator) oldIndicator.remove();

  // Nie pokazuj dla szybkich połączeń
  if (strategy.type === "4g" || strategy.type === "wifi") return;

  // Stwórz nowy wskaźnik
  const indicator = document.createElement("div");
  indicator.id = "network-indicator";
  indicator.style.cssText = `
    position: fixed;
    bottom: 60px;
    right: 20px;
    background: rgba(204, 0, 0, 0.9);
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 12px;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  indicator.innerHTML = `
    <strong>🐌 ${strategy.type.toUpperCase()}</strong><br>
    Obrazy w trybie oszczędnym
  `;

  document.body.appendChild(indicator);

  // Auto-ukryj po 5 sekundach
  setTimeout(() => {
    indicator.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => indicator.remove(), 300);
  }, 5000);
}

// Dodaj animacje CSS
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(120%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(120%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
