// js/modules/maintenance.js

import { initMatrix } from '../core/matrix.js';

export function initMaintenance() {
  // Ukryj treść strony
  const siteContent = document.getElementById("site-content");
  if (siteContent) siteContent.style.display = "none";

  // FIX: Natychmiast ukryj Preloader (inaczej zasłoni Maintenance)
  const preloader = document.getElementById("preloader");
  if (preloader) preloader.style.display = "none";

  // Pokaż ekran serwisowy
  const maintenanceScreen = document.getElementById("maintenance-screen");
  if (maintenanceScreen) maintenanceScreen.classList.add("active");

  // Zablokuj scroll
  document.body.style.overflow = "hidden";

  // Uruchom Matrix w tle dla efektu wizualnego (z lekkim opóźnieniem)
  setTimeout(() => {
    initMatrix();
  }, 100);
}
