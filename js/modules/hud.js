// js/modules/hud.js
export function initHud() {
  window.addEventListener("load", () => {
    const loadTimeElement = document.getElementById("loadTime");

    if (loadTimeElement) {
      setTimeout(() => {
        // Sprawdź Performance API
        const perfData = window.performance.getEntriesByType("navigation")[0];
        let loadTime = 0;

        if (perfData) {
          // Nowe API (dokładniejsze)
          loadTime = perfData.loadEventEnd - perfData.startTime;
        } else {
          // Fallback dla starszych przeglądarek
          loadTime =
            window.performance.timing.loadEventEnd -
            window.performance.timing.navigationStart;
        }

        // Konwersja na sekundy (np. 0.32s)
        const seconds = (loadTime / 1000).toFixed(2);

        // Wyświetlenie wyniku
        loadTimeElement.innerText = `${seconds}s`;

        // Kolorowanie wyniku (Gamification)
        if (seconds < 0.8) {
          loadTimeElement.style.color = "#4ade80"; // Zielony (Super szybko)
          loadTimeElement.style.textShadow = "0 0 8px rgba(74, 222, 128, 0.4)";
        } else if (seconds < 1.5) {
          loadTimeElement.style.color = "#facc15"; // Żółty (OK)
        } else {
          loadTimeElement.style.color = "#ef4444"; // Czerwony (Wolno)
        }
      }, 100); // Krótkie opóźnienie dla pewności, że wartości są dostępne
    }
  });
}
