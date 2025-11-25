import { CONFIG } from './config.js';
import { initMatrix } from './core/matrix.js';
import { initUI, initCursor } from './core/ui.js';
import { initPortfolio } from './modules/portfolio.js';
import { initContact } from './modules/contact.js';
import { initHud } from './modules/hud.js';
import { initMaintenance } from './modules/maintenance.js';

// === PRELOADER MATRIX ANIMATION ===
function initPreloaderMatrix() {
  const canvas = document.getElementById("preloader-matrix");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const cols = Math.floor(width / 20);
  const ypos = Array(cols).fill(0);

  let mouseX = -100;
  let mouseY = -100;
  let targetMouseX = -100;
  let targetMouseY = -100;

  let lastTime = 0;
  const fps = 15;
  const interval = 1000 / fps;

  window.addEventListener("mousemove", (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  });

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const newCols = Math.floor(width / 20);
    while (ypos.length < newCols) ypos.push(0);
  });

  function matrixLoop(currentTime) {
    requestAnimationFrame(matrixLoop);

    if (!currentTime) currentTime = 0;
    const delta = currentTime - lastTime;
    if (delta < interval) return;
    lastTime = currentTime - (delta % interval);

    mouseX += (targetMouseX - mouseX) * 0.12;
    mouseY += (targetMouseY - mouseY) * 0.12;

    ctx.fillStyle = "rgba(5, 5, 5, 0.06)";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "15pt monospace";

    ypos.forEach((y, ind) => {
      const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = ind * 20;

      const dist = Math.hypot(x - mouseX, y - mouseY);
      if (dist < 150) {
        ctx.fillStyle = `rgba(255, 31, 31, ${1 - dist / 150})`;
      } else {
        ctx.fillStyle = Math.random() > 0.98 ? "#fff" : "#333";
      }

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
  // === CORE (Always run) ===
  initMatrix();
  initCursor();

  // Reset scroll position (overflow already blocked in CSS)
  window.scrollTo(0, 0);
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

    initMaintenance();

    return;
  }

  // === NORMAL MODE ===
  initUI();
  initPortfolio();
  initContact();

  setTimeout(() => {
    initHud();
  }, 500);

  // === PRELOADER (Smart Conditional Display) ===
  if (CONFIG.enablePreloader) {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      window.addEventListener("load", () => {
        const perfData = performance.getEntriesByType("navigation")[0];
        let loadTime = 0;

        if (perfData && perfData.loadEventEnd > 0) {
          loadTime = perfData.loadEventEnd - perfData.startTime;
        } else {
          loadTime = performance.now();
        }

        const threshold = 800;

        if (loadTime < threshold) {
          requestAnimationFrame(() => {
            setTimeout(() => {
              preloader.style.display = "none";
              document.body.removeAttribute("style");
            }, 50);
          });
        } else {
          setTimeout(() => {
            preloader.classList.add("loaded");
            setTimeout(() => {
              preloader.style.display = "none";
              document.body.removeAttribute("style");
            }, 550);
          }, 500);
        }
      });

      setTimeout(() => {
        if (preloader && !preloader.classList.contains("loaded")) {
          preloader.classList.add("loaded");
          setTimeout(() => {
            preloader.style.display = "none";
            document.body.removeAttribute("style");
          }, 550);
        }
      }, 4000);
    }
  } else {
    const pre = document.getElementById("preloader");
    if (pre) pre.style.display = "none";
    document.body.removeAttribute("style");
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
