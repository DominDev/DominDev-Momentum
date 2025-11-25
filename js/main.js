import { CONFIG } from './config.js';
import { initMatrix } from './core/matrix.js';
import { initUI } from './core/ui.js';
import { initPortfolio } from './modules/portfolio.js';
import { initContact } from './modules/contact.js';
import { initHud } from './modules/hud.js';
import { initMaintenance } from './modules/maintenance.js';

document.addEventListener("DOMContentLoaded", () => {
  // === MAINTENANCE CHECK ===
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'true';

  if (CONFIG.maintenanceMode && !isAdmin) {
    initMaintenance();
    return;
  }

  // === LAZY MATRIX START ===
  setTimeout(() => {
    initMatrix();
  }, 100);

  // === CORE MODULES ===
  initUI();
  initPortfolio();
  initContact();

  setTimeout(() => {
    initHud();
  }, 500);

  // === PRELOADER ===
  if (CONFIG.enablePreloader) {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      window.addEventListener("load", () => {
        setTimeout(() => {
          preloader.classList.add("loaded");
          setTimeout(() => preloader.style.display = "none", 500);
        }, 300);
      });

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

  // === LAZY CHATBOT ===
  const chatTrigger = document.getElementById("chatbot-trigger");
  if (chatTrigger) {
    let chatLoaded = false;

    const loadChatbot = async () => {
      if (chatLoaded) return;
      chatLoaded = true;
      const { initChat } = await import('./modules/chatbot.js');
      initChat();
    };

    chatTrigger.addEventListener("mouseenter", loadChatbot, { once: true });
    window.addEventListener("scroll", loadChatbot, { passive: true, once: true });
    window.addEventListener("touchstart", loadChatbot, { passive: true, once: true });
    setTimeout(loadChatbot, 5000);
  }
});
