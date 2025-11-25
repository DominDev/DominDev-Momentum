import { CONFIG } from './config.js';
import { initMatrix } from './core/matrix.js';
import { initUI } from './core/ui.js';
import { initPortfolio } from './modules/portfolio.js';
import { initContact } from './modules/contact.js';
import { initHud } from './modules/hud.js';
// Chatbota ładujemy dynamicznie (Lazy), więc nie importujemy go tutaj statycznie

document.addEventListener("DOMContentLoaded", () => {

  // 1. CORE (Critical Path)
  initMatrix();

  // Maintenance Check
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'true';
  if (CONFIG.maintenanceMode && !isAdmin) {
    const mScreen = document.getElementById("maintenance-screen");
    const siteContent = document.getElementById("site-content");
    if (mScreen) mScreen.classList.add("active");
    if (siteContent) siteContent.style.display = "none";
    document.body.style.overflow = "hidden";
    return; // Stop reszty
  }

  // UI & Modules
  initUI();
  initPortfolio();
  initContact();
  initHud();

  // 2. PRELOADER
  if (CONFIG.enablePreloader) {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      window.addEventListener("load", () => {
        setTimeout(() => {
          preloader.classList.add("loaded");
          setTimeout(() => preloader.style.display = "none", 500);
        }, 300);
      });

      // Timeout bezpieczeństwa
      setTimeout(() => {
        if (!preloader.classList.contains("loaded")) {
          preloader.classList.add("loaded");
          preloader.style.display = "none";
        }
      }, 3000);
    }
  } else {
    const pre = document.getElementById("preloader");
    if(pre) pre.style.display = "none";
  }

  // 3. LAZY LOAD CHATBOT (Tylko po najechaniu myszką na ikonę!)
  const chatTrigger = document.getElementById("chatbot-trigger");
  if (chatTrigger) {
    chatTrigger.addEventListener("mouseenter", async () => {
      // Dynamic Import - pobiera kod chatbota dopiero teraz
      const { initChat } = await import('./modules/chatbot.js');
      initChat();
    }, { once: true }); // Wykonaj tylko raz
  }
});
