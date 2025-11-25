// js/modules/hud.js

export function initHud() {
  const loadTimeElement = document.getElementById("loadTime");
  if (!loadTimeElement) return;

  // Funkcja obliczająca i wyświetlająca czas
  const displayLoadTime = () => {
    // Dajemy przeglądarce chwilę na wypełnienie struktur performance (50ms)
    setTimeout(() => {
      let loadTime = 0;

      // METODA 1: Performance Navigation Timing API (Nowoczesna)
      const perfData = window.performance.getEntriesByType("navigation")[0];

      if (perfData && perfData.loadEventEnd > 0) {
        loadTime = perfData.loadEventEnd - perfData.startTime;
      }
      // METODA 2: Performance Timing API (Fallback dla starszych)
      else if (window.performance.timing) {
        loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      }

      // METODA 3: Fallback ostateczny (performance.now)
      // Jeśli API zwróciło 0 (bo np. odpaliliśmy funkcję zbyt szybko), bierzemy bieżący czas
      if (loadTime <= 0) {
        loadTime = performance.now();
      }

      // Konwersja na sekundy
      const seconds = (loadTime / 1000).toFixed(2);

      // Renderowanie
      loadTimeElement.innerText = `${seconds}s`;

      // Kolorowanie wyniku
      if (seconds < 0.5) {
        loadTimeElement.style.color = "#4ade80"; // Zielony (Ultra szybko)
        loadTimeElement.style.textShadow = "0 0 8px rgba(74, 222, 128, 0.6)";
      } else if (seconds < 1.2) {
        loadTimeElement.style.color = "#facc15"; // Żółty (Standard)
      } else {
        loadTimeElement.style.color = "#ef4444"; // Czerwony (Wolno)
      }
    }, 50);
  };

  // KLUCZOWA POPRAWKA: Sprawdź stan gotowości dokumentu
  if (document.readyState === "complete") {
    // Jeśli strona już załadowana -> licz od razu
    displayLoadTime();
  } else {
    // Jeśli jeszcze się ładuje -> czekaj na zdarzenie
    window.addEventListener("load", displayLoadTime);
  }
}
