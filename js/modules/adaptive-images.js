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

  // Debug logs disabled for production
  // console.log(`🌐 Network Strategy: ${networkStrategy.type}`);

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
        // Debug: console.log(`🔄 Network changed: ${newStrategy.type}`);
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
        lazy: true,
        description: "2G - bardzo wolne połączenie",
      };

    case "3g":
      return {
        type: "3g",
        quality: "medium",
        maxWidth: 800,
        lazy: true,
        description: "3G - średnie połączenie",
      };

    case "4g":
      return {
        type: "4g",
        quality: "high",
        maxWidth: 1600,
        lazy: false, // Można preloadować
        description: "4G - szybkie połączenie",
      };

    default:
      // WiFi lub nieznane - zakładamy szybkie
      return {
        type: "wifi",
        quality: "high",
        maxWidth: 1600,
        lazy: false,
        description: "WiFi/Unknown - zakładamy szybkie połączenie",
      };
  }
}

/**
 * Aplikuje strategię do wszystkich obrazów na stronie
 */
function applyImageStrategy(strategy) {
  const shouldOptimize = strategy.type !== "4g" && strategy.type !== "wifi";

  // Znajdź wszystkie <picture> elementy
  const pictures = document.querySelectorAll("picture");

  pictures.forEach((picture) => {
    const sources = picture.querySelectorAll("source");
    const img = picture.querySelector("img");

    sources.forEach((source) => updateResponsiveCandidate(source, strategy, shouldOptimize));

    if (img) {
      updateResponsiveCandidate(img, strategy, shouldOptimize);
      if (!img.dataset.originalLoading) {
        img.dataset.originalLoading = img.getAttribute("loading") || "auto";
      }
      if (strategy.lazy && img.dataset.imagePriority !== "high") {
        img.setAttribute("loading", "lazy");
      } else if (img.dataset.originalLoading === "auto") {
        img.removeAttribute("loading");
      } else {
        img.setAttribute("loading", img.dataset.originalLoading);
      }
    }
  });

  // Dodaj wskaźnik dla użytkownika (opcjonalnie)
  showNetworkIndicator(strategy);
}

function updateResponsiveCandidate(element, strategy, shouldOptimize) {
  const currentSrcset = element.getAttribute("srcset");
  if (!currentSrcset) return;

  if (!element.dataset.originalSrcset) {
    element.dataset.originalSrcset = currentSrcset;
  }

  element.setAttribute(
    "srcset",
    shouldOptimize
      ? filterSrcsetByWidth(element.dataset.originalSrcset, strategy.maxWidth)
      : element.dataset.originalSrcset
  );
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
  // Styles moved to style.css for CSP compliance
  
    // Safe DOM creation instead of innerHTML
    const strong = document.createElement('strong');
    strong.textContent = strategy.type.toUpperCase();
    
    indicator.appendChild(strong);
    indicator.appendChild(document.createElement('br'));
    indicator.appendChild(document.createTextNode('Obrazy w trybie oszczędnym'));

  document.body.appendChild(indicator);

  // Auto-ukryj po 5 sekundach
  setTimeout(() => {
    indicator.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => indicator.remove(), 300);
  }, 5000);
}
// Dynamic style injection removed for Strict CSP
