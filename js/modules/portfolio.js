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
  const closeModalBtn = document.getElementById("modal-close-btn");
  const glitchOverlay = document.getElementById("system-glitch");
  let lastFocusedElement = null;

  // Detect best image format on init
  detectImageFormat();

  window.openModal = function (projectId) {
    const data = projectsDB[projectId];
    if (!data) return;

    lastFocusedElement = document.activeElement;
    glitchOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      // Reset animation state
      modalImg.classList.remove("scrolling");
      void modalImg.offsetWidth; // Force reflow

      // Get container width for responsive image selection
      // Use fallback if container not yet visible
      const containerWidth =
        modalImageContainer && modalImageContainer.offsetWidth > 0
          ? modalImageContainer.offsetWidth
          : 700;

      // Build responsive image URL
      const newSrc = getResponsiveImageUrl(data.imageBase, containerWidth);

      // Debug logging (remove in production)
      console.log("[Portfolio Debug]", {
        containerWidth,
        bestFormat,
        newSrc,
        imageBase: data.imageBase,
      });

      // Animation start handler
      const startAnimation = () => {
        modalImg.classList.add("scrolling");
        modalImg.onload = null; // Clean up handler
        console.log("[Portfolio Debug] Animation started, class added:", modalImg.classList.contains("scrolling"));
      };

      // Clear previous src to force reload and reset complete state
      modalImg.removeAttribute("src");
      void modalImg.offsetWidth; // Force reflow

      // Set onload handler BEFORE setting src
      modalImg.onload = startAnimation;

      // Handle load errors - fallback to JPG
      modalImg.onerror = () => {
        console.warn("[Portfolio] Image load failed, trying JPG fallback:", newSrc);
        const jpgFallback = newSrc.replace(/\.(avif|webp)$/, ".jpg");
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
          console.log("[Portfolio Debug] Image already complete, naturalHeight:", modalImg.naturalHeight);
          startAnimation();
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
      // 3. Move focus to close button
      if (closeModalBtn) {
        requestAnimationFrame(() => closeModalBtn.focus());
      }
    }, 300);
  };

  window.closeModal = function () {
    modal.classList.remove("active");
    document.body.style.overflow = "";

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
}
