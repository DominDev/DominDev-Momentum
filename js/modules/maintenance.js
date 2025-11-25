// js/modules/maintenance.js
import { initMatrix } from '../core/matrix.js';

export function initMaintenance() {
  const siteContent = document.getElementById("site-content");
  if (siteContent) siteContent.style.display = "none";

  const preloader = document.getElementById("preloader");
  if (preloader) preloader.style.display = "none";

  const maintenanceScreen = document.getElementById("maintenance-screen");
  if (maintenanceScreen) maintenanceScreen.classList.add("active");

  document.body.style.overflow = "hidden";

  setTimeout(() => {
    initMatrix();
  }, 100);
}
