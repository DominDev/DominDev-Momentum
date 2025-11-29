import { CONFIG } from './config.js';
import { initMatrix } from './core/matrix.js';
import { initUI, initCursor } from './core/ui.js';
import { initPortfolio } from './modules/portfolio.js';
import { initLazyBlur } from './modules/lazy-blur.js';
import { initContact } from './modules/contact.js';
import { initHud } from './modules/hud.js';
import { initMaintenance } from './modules/maintenance.js';
import { initAdaptiveImages } from './modules/adaptive-images.js';

// Globalne zmienne do kontroli pętli animacji preloadera i cleanup
let preloaderAnimId = null;
let preloaderResizeCleanup = null;

// === LEKKI PRELOADER MATRIX (CPU OPTIMIZED) ===
function initPreloaderMatrix() {
  const canvas = document.getElementById("preloader-matrix");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const cols = Math.floor(width / 20);
  const ypos = Array(cols).fill(0);

  let lastTime = 0;
  const fps = 15;
  const interval = 1000 / fps;

  const resizeHandler = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };

  window.addEventListener("resize", resizeHandler, { passive: true });

  // Save cleanup function for later removal
  preloaderResizeCleanup = () => {
    window.removeEventListener("resize", resizeHandler);
  };

  function matrixLoop(currentTime) {
    preloaderAnimId = requestAnimationFrame(matrixLoop);

    if (!currentTime) currentTime = 0;
    const delta = currentTime - lastTime;
    if (delta < interval) return;
    lastTime = currentTime - (delta % interval);

    ctx.fillStyle = "rgba(5, 5, 5, 0.08)";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "15pt monospace";

    ypos.forEach((y, ind) => {
      const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = ind * 20;

      ctx.fillStyle = Math.random() > 0.98 ? "#fff" : "#ff1f1f";
      ctx.fillText(text, x, y);

      if (y > 100 + Math.random() * 10000) {
        ypos[ind] = 0;
      } else {
        ypos[ind] = y + 20;
      }
    });
  }

  requestAnimationFrame(matrixLoop);
}

document.addEventListener("DOMContentLoaded", () => {
  // === CORE INITIALIZATION ===
  initCursor();

  // Reset scroll position
  window.scrollTo(0, 0);

  // Start preloader Matrix if enabled
  if (CONFIG.enablePreloader) {
    initPreloaderMatrix();
  }

  // === MAINTENANCE CHECK ===
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'true';

  if (CONFIG.maintenanceMode && !isAdmin) {
    const siteContent = document.getElementById("site-content");
    if (siteContent) {
      siteContent.style.display = "none";
    }

    const preloader = document.getElementById("preloader");
    if (preloader) preloader.style.display = "none";

    // FIX 1: Stop preloader animation loop if maintenance mode is active
    if (preloaderAnimId) {
      cancelAnimationFrame(preloaderAnimId);
      preloaderAnimId = null;
    }

    // FIX 2: Clean up resize event listener to prevent memory leak
    if (preloaderResizeCleanup) {
      preloaderResizeCleanup();
      preloaderResizeCleanup = null;
    }

    initMaintenance();
    return;
  }

  // === STATIC MODULES (Lightweight) ===
  initPortfolio();
  initLazyBlur();
  initContact();

  // === ADAPTIVE IMAGES (Network-Aware Loading) ===
  initAdaptiveImages();

  // === PRELOADER LOGIC (Optimized) ===
  const preloader = document.getElementById("preloader");

  const killPreloader = () => {
    if (!preloader) return;
    if (preloader.classList.contains("hiding")) return;

    preloader.classList.add("hiding");
    preloader.classList.add("loaded");

    setTimeout(() => {
      preloader.style.display = "none";

      // Remove specific body styles used during preloader
      // Safer than removeAttribute('style') which would remove ALL inline styles
      document.body.style.overflow = '';
      document.body.style.height = '';

      // CRITICAL: Kill preloader animation loop to free CPU
      if (preloaderAnimId) {
        cancelAnimationFrame(preloaderAnimId);
        preloaderAnimId = null;
      }

      // FIX 3: Clean up resize event listener to prevent memory leak
      if (preloaderResizeCleanup) {
        preloaderResizeCleanup();
        preloaderResizeCleanup = null;
      }

      // NOW start heavy operations (Matrix + UI)
      // This ensures we never run two Matrix animations simultaneously
      initMatrix();
      initUI();

      // Delayed HUD initialization to avoid blocking animations
      setTimeout(initHud, 200);
    }, 550);
  };

  // Strategy: Hide preloader ~700ms after DOMContentLoaded
  // Don't wait for all images/fonts - Content First!
  if (CONFIG.enablePreloader && preloader) {
    if (document.readyState === 'complete') {
      // Page already loaded (cached)
      setTimeout(killPreloader, 300);
    } else {
      // Normal flow - hide after reasonable time
      setTimeout(killPreloader, 700);
    }
  } else {
    // No preloader mode
    if (preloader) preloader.style.display = "none";
    document.body.style.overflow = '';
    document.body.style.height = '';
    initMatrix();
    initUI();
    initHud();
  }

  // === ULTRA LAZY CHATBOT (Load on Demand Only) ===
  const chatTrigger = document.getElementById("chatbot-trigger");
  if (chatTrigger) {
    let chatbotLoaded = false;
    let pendingOpen = false;

    const loadChatbot = async () => {
      if (chatbotLoaded) return;
      chatbotLoaded = true;

      try {
        const { initChat } = await import('./modules/chatbot.js');
        const chatAPI = initChat();

        // Jeśli user kliknął podczas ładowania, otwórz teraz
        if (pendingOpen) {
          pendingOpen = false;
          if (chatAPI && typeof chatAPI.open === 'function') {
            chatAPI.open();
          }
        }
      } catch (error) {
        console.error("❌ Failed to load chatbot:", error);
        chatbotLoaded = false;

        if (chatTrigger) {
          chatTrigger.style.opacity = "0.5";
          chatTrigger.title = "Chatbot temporarily unavailable";
          chatTrigger.style.cursor = "not-allowed";
        }
      }
    };

    let touchFired = false;

    const handleInteraction = async (e) => {
      // Zapobiegaj double-fire: touchend + click na mobile
      if (e.type === 'touchend') {
        touchFired = true;
        setTimeout(() => { touchFired = false; }, 400);
      } else if (e.type === 'click' && touchFired) {
        return; // Ignoruj click po touchend
      }

      if (!chatbotLoaded) {
        e.preventDefault();
        pendingOpen = true;
        await loadChatbot();
      }
    };

    // Preload on hover (desktop only)
    chatTrigger.addEventListener("mouseenter", loadChatbot, { once: true });

    // Handle clicks/touches
    chatTrigger.addEventListener("touchend", handleInteraction, { passive: false });
    chatTrigger.addEventListener("click", handleInteraction);
  }
});
