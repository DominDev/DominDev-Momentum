// js/modules/hud.js
// User-Centric Performance Metrics
export function initHud() {
  const loadTimeElement = document.getElementById("loadTime");
  if (!loadTimeElement) return;

  const displayLoadTime = () => {
    let loadTime = 0;

    // Get Navigation Timing metrics
    const perfData = window.performance.getEntriesByType("navigation")[0];

    if (perfData) {
      // Use domContentLoadedEventEnd (when DOM is ready and interactive)
      // This is "perceived speed" - when user can see and interact with content
      // NOT loadEventEnd (which waits for all images/fonts)
      loadTime = perfData.domContentLoadedEventEnd || perfData.responseEnd;
    } else {
      // Fallback for older browsers
      loadTime = performance.now();
    }

    // Format to 2 decimal places
    const seconds = (loadTime / 1000).toFixed(2);
    loadTimeElement.innerText = `${seconds}s`;

    // Performance thresholds
    if (seconds < 1.5) {
      loadTimeElement.style.color = "#4ade80"; // Green - Excellent (0-1.5s)
      loadTimeElement.style.textShadow = "0 0 8px rgba(74, 222, 128, 0.6)";
    } else if (seconds < 3.0) {
      loadTimeElement.style.color = "#facc15"; // Yellow - Good (1.5-3s)
      loadTimeElement.style.textShadow = "0 0 5px rgba(250, 204, 21, 0.4)";
    } else {
      loadTimeElement.style.color = "#ef4444"; // Red - Needs optimization (>3s)
      loadTimeElement.style.textShadow = "0 0 5px rgba(239, 68, 68, 0.4)";
    }
  };

  // Execute immediately (HUD is called with delay from main.js)
  requestAnimationFrame(displayLoadTime);
}
