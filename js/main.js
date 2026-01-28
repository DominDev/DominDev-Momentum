import { CONFIG } from './config.js';
import { initMatrix } from './core/matrix.js';
import { initUI, initCursor } from './core/ui.js';
import { initPortfolio } from './modules/portfolio.js';
import { initContact } from './modules/contact.js';
import { initHud } from './modules/hud.js';
import { initMaintenance } from './modules/maintenance.js';
import { initAdaptiveImages } from './modules/adaptive-images.js';
import { initPrivacyPolicy } from './modules/privacy-policy.js';
import { initPortfolioExpand } from './modules/portfolio-expand.js';

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
  let interval = 1000 / fps;

  // Fast initial load - higher FPS for first few seconds (only on capable devices)
  let frameCount = 0;
  const fastLoadFrames = 120; // ~4 seconds at fast FPS
  // Disable fast loading on slow connections or low-end devices
  const isSlowConnection = navigator.connection?.effectiveType === '2g' || navigator.connection?.saveData;
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  const fastFPS = (isSlowConnection || isLowEnd) ? 15 : 30; // 2x faster only on capable devices

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

    // Use higher FPS during initial load for faster fill
    if (frameCount < fastLoadFrames) {
      interval = 1000 / fastFPS;
      frameCount++;
    } else {
      interval = 1000 / fps;
    }

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

  // === SKIP LINK HANDLER (A11Y - No Hash Change) ===
  const skipLinkBtn = document.getElementById('skip-link-btn');
  if (skipLinkBtn) {
    skipLinkBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Stop URL hash change
      const target = document.getElementById('hero');
      if (target) {
        // Ensure target can receive focus
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
        }
        
        target.scrollIntoView({ behavior: 'smooth' });
        target.focus({ preventScroll: true }); // preventScroll because we used smooth scroll above
      }
    });
  }

  // Reset scroll position (only if no hash)
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }

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
  initPortfolioExpand();
  initContact();
  initPrivacyPolicy();

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
      document.body.style.overflow = '';
      document.body.style.height = '';

      // Kill preloader animation loop to free CPU
      if (preloaderAnimId) {
        cancelAnimationFrame(preloaderAnimId);
        preloaderAnimId = null;
      }

      // Clean up resize event listener to prevent memory leak
      if (preloaderResizeCleanup) {
        preloaderResizeCleanup();
        preloaderResizeCleanup = null;
      }

      // Start heavy operations (Matrix + UI)
      initMatrix();
      initUI();

      // Check if we have a hash that needs scrolling
      if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          // CRITICAL FIX: Pre-activate ALL reveal animations BEFORE scroll
          const allReveals = document.querySelectorAll('.reveal:not(.active)');
          allReveals.forEach(el => el.classList.add('active'));
          document.body.offsetHeight; // Force layout recalculation

          setTimeout(() => {
            const rect = target.getBoundingClientRect();
            const offset = window.pageYOffset + rect.top - 80; // navbar height
            window.scrollTo({ top: offset, behavior: 'smooth' });
          }, 100);
        }
      }

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

  // === GLOBAL EVENT DELEGATION (Replace inline onclick) ===
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-action]');
    if (!trigger) return;

    const action = trigger.dataset.action;

    // Prevent default for links acting as buttons (avoid hash jump)
    // Only block if href is empty, '#', or starts with '#' (anchor link handled by JS)
    if (trigger.tagName === 'A') {
      const href = trigger.getAttribute('href');
      if (!href || href === '#' || href.startsWith('#')) {
        e.preventDefault();
      }
    }

    switch (action) {
      case 'open-modal':
        if (window.openModal && trigger.dataset.target) {
          window.openModal(trigger.dataset.target);
        }
        break;

      case 'prefill':
        // Fix: Close project modal if requested (e.g., from "Similar Project" button)
        if (trigger.dataset.closeContext === "true" && window.closeModal) {
          window.closeModal();
        }

        if (window.prefillForm) {
          const service = trigger.dataset.service;
          const budget = trigger.dataset.budget ? parseInt(trigger.dataset.budget, 10) : 0;
          window.prefillForm(service, budget);
        }
        break;

      case 'open-contact':
        if (window.openContactPanel) window.openContactPanel();
        break;

      case 'close-privacy':
        const privacyCloseBtn = document.getElementById('privacy-close-btn');
        if (privacyCloseBtn) privacyCloseBtn.click();
        break;
    }
  });

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
