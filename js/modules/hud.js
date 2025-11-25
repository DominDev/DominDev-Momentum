// js/modules/hud.js
export function initHud() {
  const loadTimeElement = document.getElementById("loadTime");
  if (!loadTimeElement) return;

  const displayLoadTime = () => {
    setTimeout(() => {
      let loadTime = 0;

      const perfData = window.performance.getEntriesByType("navigation")[0];

      if (perfData && perfData.loadEventEnd > 0) {
        loadTime = perfData.loadEventEnd - perfData.startTime;
      } else if (window.performance.timing) {
        loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      }

      if (loadTime <= 0) {
        loadTime = performance.now();
      }

      const seconds = (loadTime / 1000).toFixed(2);
      loadTimeElement.innerText = `${seconds}s`;

      if (seconds < 0.5) {
        loadTimeElement.style.color = "#4ade80";
        loadTimeElement.style.textShadow = "0 0 8px rgba(74, 222, 128, 0.6)";
      } else if (seconds < 1.2) {
        loadTimeElement.style.color = "#facc15";
      } else {
        loadTimeElement.style.color = "#ef4444";
      }
    }, 50);
  };

  if (document.readyState === "complete") {
    displayLoadTime();
  } else {
    window.addEventListener("load", displayLoadTime);
  }
}
