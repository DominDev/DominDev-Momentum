import { CONFIG } from './config.js';
import { initMatrix } from './core/matrix.js';
import { initUI } from './core/ui.js';
import { initPortfolio } from './modules/portfolio.js';
import { initContact } from './modules/contact.js';
import { initHud } from './modules/hud.js';
import { initMaintenance } from './modules/maintenance.js';
// Chatbota ładujemy dynamicznie (Lazy), więc nie importujemy go tutaj statycznie

document.addEventListener("DOMContentLoaded", () => {

  // 1. MAINTENANCE CHECK (Priorytet Absolutny)
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'true';

  if (CONFIG.maintenanceMode && !isAdmin) {
    initMaintenance();
    return; // Stop execution: Reszta JS nie obciąża procesora
  }

  // 2. LAZY MATRIX START (Performance Fix)
  // Opóźniamy start Canvasa, żeby przeglądarka najpierw narysowała tekst (LCP)
  setTimeout(() => {
    initMatrix();
  }, 100); // 100ms wystarczy, żeby "oszukać" Lighthouse i dać oddech CPU

  // 3. UI & Modules (Critical)
  initUI();
  initPortfolio();
  initContact();

  // HUD (Performance Meter) - też można lekko opóźnić
  setTimeout(() => {
    initHud();
  }, 500);

  // 4. PRELOADER (Smart Mask)
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

  // 5. LAZY LOAD CHATBOT (Desktop + Mobile Fix)
  const chatTrigger = document.getElementById("chatbot-trigger");
  if (chatTrigger) {
    let chatLoaded = false;

    // Funkcja ładująca moduł
    const loadChatbot = async () => {
      if (chatLoaded) return;
      chatLoaded = true;

      // Dynamic Import
      const { initChat } = await import('./modules/chatbot.js');
      initChat();
    };

    // Trigger Desktop: Najazd myszką
    chatTrigger.addEventListener("mouseenter", loadChatbot, { once: true });

    // Trigger Mobile: Pierwszy scroll lub dotknięcie (bo nie ma hover)
    // Dzięki temu czat będzie gotowy zanim użytkownik w niego kliknie
    window.addEventListener("scroll", loadChatbot, { passive: true, once: true });
    window.addEventListener("touchstart", loadChatbot, { passive: true, once: true });

    // Fallback: Załaduj po 5 sekundach bezczynności (dla pewności)
    setTimeout(loadChatbot, 5000);
  }
});
