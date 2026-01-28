// js/modules/portfolio.js

// Responsive image configuration
const IMAGE_SIZES = [400, 800, 1200, 1600];
const IMAGE_FORMATS = ["avif", "webp", "jpg"];
const BASE_PATH = "assets/images/portfolio/";

const projectsDB = {
  kraft: {
    title: "Kraft Daily Pub",
    type: "Realizacja / WordPress",
    imageBase: "portfolio-kraft",
    tags: ["WORDPRESS", "CUSTOM THEME", "RWD"],
    challenge:
      "Lokalny browar potrzebował strony oddającej rzemieślniczy charakter marki. Głównym wyzwaniem było stworzenie systemu menu, który obsługa może edytować z telefonu w 30 sekund.",
    solution:
      "Wdrożenie autorskiego motywu (bez ciężkich builderów) oraz dedykowanych pól ACF dla menu lunchowego. Zoptymalizowano grafiki pod kątem słabego zasięgu w lokalu.",
    result: "📈 Wzrost rezerwacji stolików o 40% w pierwszym kwartale.",
  },
  neon: {
    title: "Neon Estate",
    type: "Concept / Headless",
    imageBase: "portfolio-neon",
    tags: ["NEXT.JS", "HEADLESS WP", "GSAP"],
    challenge:
      "Projekt badawczy interfejsu dla luksusowych nieruchomości. Celem było połączenie 'ciężkich' wizualnie zdjęć 4K z błyskawicznym czasem ładowania, nieosiągalnym dla standardowych stron.",
    solution:
      "Wykorzystano architekturę JAMstack (Next.js) z WordPressem jako backendem (Headless). Zastosowano format AVIF i pre-loading kluczowych zasobów.",
    result: "⚡ Czas ładowania < 0.5s przy zdjęciach 4K.",
  },
  techgear: {
    title: "TechGear Store",
    type: "Concept / E-Commerce",
    imageBase: "portfolio-techgear",
    tags: ["WOOCOMMERCE", "REDIS", "SECURITY"],
    challenge:
      "Symulacja architektury sklepu z elektroniką odpornego na duży ruch (np. Black Friday). Skupienie na optymalizacji ścieżki zakupowej (Checkout) i bezpieczeństwie.",
    solution:
      "Zoptymalizowany koszyk zakupowy, wdrożenie Redis Object Cache oraz zabezpieczeń anty-DDoS na poziomie aplikacji (Cloudflare Rules).",
    result: "🛡️ Pełna odporność na skoki ruchu i 100/100 Security Score.",
  },
};

// Detect best supported image format using feature detection
let bestFormat = "jpg";
let formatDetected = false;

const detectImageFormat = () => {
  if (formatDetected) return;

  // WebP detection via canvas (reliable)
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const webpSupported =
    canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;

  // AVIF detection via image loading (canvas.toDataURL doesn't support AVIF)
  const avifTestImage = new Image();
  avifTestImage.onload = () => {
    bestFormat = "avif";
    formatDetected = true;
  };
  avifTestImage.onerror = () => {
    bestFormat = webpSupported ? "webp" : "jpg";
    formatDetected = true;
  };
  // Tiny 1x1 AVIF image as data URI
  avifTestImage.src =
    "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgAACAgICGQISD/4R/xwB8=";

  // Fallback: if AVIF test takes too long, use WebP/JPG
  setTimeout(() => {
    if (!formatDetected) {
      bestFormat = webpSupported ? "webp" : "jpg";
      formatDetected = true;
    }
  }, 100);
};

// Get optimal image size based on container width
const getOptimalSize = (containerWidth) => {
  const dpr = window.devicePixelRatio || 1;
  const targetWidth = containerWidth * dpr;

  for (const size of IMAGE_SIZES) {
    if (size >= targetWidth) return size;
  }
  return IMAGE_SIZES[IMAGE_SIZES.length - 1];
};

// Build responsive image URL
const getResponsiveImageUrl = (imageBase, containerWidth) => {
  const size = getOptimalSize(containerWidth);
  return `${BASE_PATH}${imageBase}-${size}.${bestFormat}`;
};

export function initPortfolio() {
  const modal = document.getElementById("project-modal");
  const modalImg = document.getElementById("modal-img");
  const modalImageContainer = document.querySelector(".modal-image-container");
  const modalTitle = document.getElementById("modal-title");
  const modalType = document.getElementById("modal-type");
  const modalTags = document.getElementById("modal-tags");
  const modalChallenge = document.getElementById("modal-challenge");
  const modalSolution = document.getElementById("modal-solution");
  const modalResult = document.getElementById("modal-result");
  const modalScrollHint = document.getElementById("modal-scroll-hint");
  const closeModalBtn = document.getElementById("modal-close-btn");
  const glitchOverlay = document.getElementById("system-glitch");
  let lastFocusedElement = null;
  let autoScrollRaf = null;
  let autoScrollResumeTimer = null;
  let autoScrollEndPauseTimer = null;
  let autoScrollDirection = 1;
  let lastAutoScrollAt = 0;
  let autoScrollStarted = false;
  let isAutoScrolling = false;
  let lastFrameTime = null;
  let autoScrollPending = false;
  let userInteracting = false;
  let userInteractionTimer = null;
  let hintShowTimer = null;
  let hintShownThisSession = false;
  let autoScrollInitialDelayDone = false;
  let prevScrollBehavior = "";
  let scrollBehaviorForced = false;
  const DEBUG_MODAL_SCROLL = false;
  const AUTO_SCROLL_IDLE_DELAY = 500;
  const AUTO_SCROLL_END_PAUSE = 200;
  const AUTO_SCROLL_START_DELAY = 1000;
  const AUTO_SCROLL_SPEED_DOWN = 100; // px per second
  const AUTO_SCROLL_SPEED_UP = 200; // px per second
  const AUTO_SCROLL_MIN_DURATION = 5000;
  const AUTO_SCROLL_MAX_DURATION = 60000;
  const MAX_FRAME_DELTA = 100;
  const AUTO_SCROLL_START_MAX_ATTEMPTS = 30;
  const AUTO_SCROLL_HINT_DELAY = 2000;

  const debugLog = () => {};

  // Detect best image format on init
  detectImageFormat();

  const forceAutoScrollBehavior = () => {
    if (!modalImageContainer || scrollBehaviorForced) return;
    prevScrollBehavior = modalImageContainer.style.scrollBehavior || "";
    modalImageContainer.style.scrollBehavior = "auto";
    scrollBehaviorForced = true;
    debugLog();
  };

  const restoreScrollBehavior = () => {
    if (!modalImageContainer || !scrollBehaviorForced) return;
    modalImageContainer.style.scrollBehavior = prevScrollBehavior;
    scrollBehaviorForced = false;
    debugLog();
  };

  const clearHintTimers = () => {
    if (hintShowTimer) {
      clearTimeout(hintShowTimer);
      hintShowTimer = null;
    }
  };

  const showHint = () => {
    if (!modalScrollHint) return;
    modalScrollHint.classList.add("is-visible");
  };

  const hideHint = () => {
    if (!modalScrollHint) return;
    modalScrollHint.classList.remove("is-visible");
  };

  const scheduleHint = () => {
    if (!modalScrollHint || hintShownThisSession) return;
    hintShownThisSession = true;
    clearHintTimers();
    hintShowTimer = setTimeout(() => {
      if (!modal.classList.contains("active") || userInteracting) return;
      showHint();
    }, AUTO_SCROLL_HINT_DELAY);
  };

  const stopAutoScroll = () => {
    debugLog();
    autoScrollStarted = false;
    isAutoScrolling = false;
    lastFrameTime = null;
    if (autoScrollRaf) {
      cancelAnimationFrame(autoScrollRaf);
      autoScrollRaf = null;
    }
    clearAutoScrollTimers();
    restoreScrollBehavior();
  };

  const clearAutoScrollTimers = () => {
    if (autoScrollResumeTimer) {
      clearTimeout(autoScrollResumeTimer);
      autoScrollResumeTimer = null;
    }
    if (autoScrollEndPauseTimer) {
      clearTimeout(autoScrollEndPauseTimer);
      autoScrollEndPauseTimer = null;
    }
  };

  const clearUserInteractionTimer = () => {
    if (userInteractionTimer) {
      clearTimeout(userInteractionTimer);
      userInteractionTimer = null;
    }
  };

  const handleUserInteraction = (source, extra = {}) => {
    userInteracting = true;
    debugLog();
    hideHint();
    clearHintTimers();
    stopAutoScroll();
    clearAutoScrollTimers();
    clearUserInteractionTimer();
    userInteractionTimer = setTimeout(() => {
      userInteracting = false;
      debugLog();
      scheduleAutoScrollResume();
    }, AUTO_SCROLL_IDLE_DELAY);
  };

  const getMaxScroll = () => {
    if (!modalImageContainer) return 0;
    return Math.max(0, modalImageContainer.scrollHeight - modalImageContainer.clientHeight);
  };

  const ensureImageDecoded = () => {
    if (!modalImg || typeof modalImg.decode !== "function") return Promise.resolve();
    return modalImg.decode().catch(() => {});
  };

  const linear = (t) => t;

  const requestAutoScrollStart = (attempt = 0) => {
    if (!modalImageContainer) return;
    if (userInteracting) {
      debugLog();
      return;
    }
    if (!modal.classList.contains("active")) {
      autoScrollPending = true;
      debugLog();
      return;
    }
    autoScrollPending = false;
    const maxScroll = getMaxScroll();
    if (maxScroll <= 1) {
      debugLog();
      if (attempt < AUTO_SCROLL_START_MAX_ATTEMPTS) {
        setTimeout(() => requestAutoScrollStart(attempt + 1), 100);
      } else {
        debugLog();
      }
      return;
    }
    debugLog();
    if (!autoScrollInitialDelayDone) {
      autoScrollInitialDelayDone = true;
      debugLog();
      setTimeout(() => {
        if (userInteracting || !modal.classList.contains("active")) return;
        startAutoScroll();
      }, AUTO_SCROLL_START_DELAY);
      return;
    }
    startAutoScroll();
  };

  const startAutoScroll = () => {
    if (userInteracting) {
      debugLog();
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      debugLog();
      return;
    }
    if (autoScrollStarted) {
      debugLog();
      return;
    }
    if (!modalImageContainer || !modal.classList.contains("active")) return;
    const maxScroll = getMaxScroll();
    if (maxScroll <= 1) {
      debugLog();
      return;
    }

    autoScrollStarted = true;
    stopAutoScroll();
    autoScrollStarted = true;
    forceAutoScrollBehavior();
    scheduleHint();

    const startTop = modalImageContainer.scrollTop;
    if (startTop <= 1) {
      autoScrollDirection = 1;
    } else if (startTop >= maxScroll - 1) {
      autoScrollDirection = -1;
    }
    const targetTop = autoScrollDirection === 1 ? maxScroll : 0;
    const distance = Math.abs(targetTop - startTop);
    const speed =
      autoScrollDirection === 1 ? AUTO_SCROLL_SPEED_DOWN : AUTO_SCROLL_SPEED_UP;
    const calculatedDuration = (distance / speed) * 1000;
    const duration = Math.min(
      AUTO_SCROLL_MAX_DURATION,
      Math.max(AUTO_SCROLL_MIN_DURATION, calculatedDuration)
    );
    let startTime = performance.now();
    lastFrameTime = null;

    debugLog();

    let frameCount = 0;
    const step = (now) => {
      if (lastFrameTime !== null) {
        const frameDelta = now - lastFrameTime;
        if (frameDelta > MAX_FRAME_DELTA) {
          const excess = frameDelta - 1000 / 60;
          startTime += excess;
          debugLog();
        }
      }
      lastFrameTime = now;

      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = linear(t);
      const nextTop = startTop + (targetTop - startTop) * eased;
      isAutoScrolling = true;
      if (typeof modalImageContainer.scrollTo === "function") {
        modalImageContainer.scrollTo({ top: nextTop, behavior: "auto" });
      } else {
        modalImageContainer.scrollTop = nextTop;
      }
      lastAutoScrollAt = now;
      requestAnimationFrame(() => {
        isAutoScrolling = false;
      });

      frameCount += 1;
      if (frameCount % 30 === 0 || t >= 1) {
        debugLog();
      }

      if (t < 1) {
        autoScrollRaf = requestAnimationFrame(step);
        return;
      }

      autoScrollRaf = null;
      autoScrollDirection *= -1;
      autoScrollStarted = false;
      debugLog();
      autoScrollEndPauseTimer = setTimeout(() => {
        debugLog();
        startAutoScroll();
      }, AUTO_SCROLL_END_PAUSE);
    };

    autoScrollRaf = requestAnimationFrame(step);
  };

  const scheduleAutoScrollResume = () => {
    if (!modalImageContainer || !modal.classList.contains("active")) return;
    debugLog();
    clearAutoScrollTimers();
    autoScrollResumeTimer = setTimeout(() => {
      debugLog();
      startAutoScroll();
    }, AUTO_SCROLL_IDLE_DELAY);
  };

  window.openModal = function (projectId) {
    const data = projectsDB[projectId];
    if (!data) return;

    lastFocusedElement = document.activeElement;
    glitchOverlay.classList.add("active");
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");

    setTimeout(() => {
      debugLog();
      stopAutoScroll();
      clearAutoScrollTimers();
      autoScrollStarted = false;
      autoScrollDirection = 1;
      lastAutoScrollAt = 0;
      isAutoScrolling = false;
      lastFrameTime = null;
      autoScrollPending = false;
      userInteracting = false;
      clearUserInteractionTimer();
      hintShownThisSession = false;
      clearHintTimers();
      hideHint();
      autoScrollInitialDelayDone = false;
      if (modalImageContainer) {
        modalImageContainer.scrollTop = 0;
      }

      // Get container width for responsive image selection
      // Use fallback if container not yet visible
      const containerWidth =
        modalImageContainer && modalImageContainer.offsetWidth > 0
          ? modalImageContainer.offsetWidth
          : 700;

      // Build responsive image URL
      const newSrc = getResponsiveImageUrl(data.imageBase, containerWidth);

      debugLog();
      debugLog();

      // Clear previous src to force reload and reset complete state
      modalImg.removeAttribute("src");
      void modalImg.offsetWidth; // Force reflow

      // Set onload handler BEFORE setting src
      modalImg.onload = () => {
        modalImg.onload = null;
        debugLog();
        ensureImageDecoded().then(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (modalImageContainer) {
                modalImageContainer.style.setProperty(
                  "--modal-image-height",
                  `${modalImageContainer.clientHeight}px`
                );
                modalImageContainer.scrollTop = 0;
                debugLog();
                requestAutoScrollStart();
              }
            });
          });
        });
      };

      // Handle load errors - fallback to JPG
      modalImg.onerror = () => {
        const jpgFallback = newSrc.replace(/\.(avif|webp)$/, ".jpg");
        debugLog();
        if (newSrc !== jpgFallback) {
          modalImg.src = jpgFallback;
        }
      };

      // Set new source
      modalImg.src = newSrc;

      // For cached images, complete may be true immediately after src assignment
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (modalImg.complete && modalImg.naturalHeight > 0) {
          if (modalImageContainer) {
            modalImageContainer.style.setProperty(
              "--modal-image-height",
              `${modalImageContainer.clientHeight}px`
            );
            modalImageContainer.scrollTop = 0;
          }
          debugLog();
          ensureImageDecoded().then(() => requestAutoScrollStart());
        }
      });

      modalTitle.innerText = data.title;
      modalType.innerText = data.type;
      modalChallenge.innerText = data.challenge;
      modalSolution.innerText = data.solution;
      modalResult.innerText = data.result;

      modalTags.innerText = ""; // Clear existing
      data.tags.forEach((tag) => {
        const span = document.createElement("span");
        span.className = "tech-badge";
        span.textContent = tag;
        modalTags.appendChild(span);
      });

      glitchOverlay.classList.remove("active");

      // Accessibility Fix:
      // 1. Unhide modal for screen readers
      modal.setAttribute("aria-hidden", "false");
      // 2. Show modal visually
      modal.classList.add("active");
      if (autoScrollPending) {
        debugLog();
        requestAutoScrollStart();
      }
      // 3. Move focus to close button
      if (closeModalBtn) {
        requestAnimationFrame(() => closeModalBtn.focus());
      }
    }, 300);
  };

  window.closeModal = function () {
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
    stopAutoScroll();
    clearAutoScrollTimers();
    clearHintTimers();
    hideHint();

    // Accessibility Fix: Move focus OUT of modal BEFORE setting aria-hidden
    if (lastFocusedElement && lastFocusedElement.focus) {
      lastFocusedElement.focus();
    } else {
      // Fallback if no last focused element
      document.body.focus();
    }

    modal.setAttribute("aria-hidden", "true");
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", window.closeModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) window.closeModal();
    });
  }

  if (modalImageContainer) {
    modalImageContainer.addEventListener("scroll", () => {
      if (!modal.classList.contains("active")) return;
      if (isAutoScrolling) return;
      debugLog();
      handleUserInteraction("scroll", {
        scrollTop: modalImageContainer.scrollTop,
        maxScroll: getMaxScroll(),
      });
    });

    modalImageContainer.addEventListener(
      "wheel",
      (e) => {
      debugLog();
      handleUserInteraction("wheel", { deltaY: e.deltaY });
    },
      { passive: true }
    );
    modalImageContainer.addEventListener(
      "touchstart",
      () => {
      debugLog();
      handleUserInteraction("touchstart");
    },
      { passive: true }
    );
    modalImageContainer.addEventListener(
      "touchmove",
      () => {
      debugLog();
    },
      { passive: true }
    );
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modal && modal.classList.contains("active")) {
        window.closeModal();
      }
    }
  });

  // Keyboard support for project cards
  const projectCards = document.querySelectorAll('.project-card[role="button"]');
  projectCards.forEach((card) => {
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        
        // Support new data-attributes
        const target = card.dataset.target;
        if (target) {
          window.openModal(target);
        }
      }
    });
  });

  let resizeTimeout = null;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (modal && modal.classList.contains("active") && autoScrollStarted) {
        console.log("[AutoScroll] Resize detected, restarting animation");
        stopAutoScroll();
        requestAnimationFrame(() => {
          if (modal.classList.contains("active")) {
            startAutoScroll();
          }
        });
      }
    }, 250);
  };

  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("orientationchange", handleResize, { passive: true });
}
