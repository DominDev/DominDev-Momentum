// js/modules/portfolio.js

// 1. Baza danych projektów (Storytelling)
const projectsDB = {
  kraft: {
    title: "Kraft Daily Pub",
    type: "Realizacja / WordPress",
    image:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1600596542815-27508887cd27?q=80&w=800&auto=format&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1550009158-9ebf690be2f4?q=80&w=800&auto=format&fit=crop",
    tags: ["WOOCOMMERCE", "REDIS", "SECURITY"],
    challenge:
      "Symulacja architektury sklepu z elektroniką odpornego na duży ruch (np. Black Friday). Skupienie na optymalizacji ścieżki zakupowej (Checkout) i bezpieczeństwie.",
    solution:
      "Zoptymalizowany koszyk zakupowy, wdrożenie Redis Object Cache oraz zabezpieczeń anty-DDoS na poziomie aplikacji (Cloudflare Rules).",
    result: "🛡️ Pełna odporność na skoki ruchu i 100/100 Security Score.",
  },
};

export function initPortfolio() {
  // 2. Elementy DOM
  const modal = document.getElementById("project-modal");
  const modalImg = document.getElementById("modal-img");
  const modalTitle = document.getElementById("modal-title");
  const modalType = document.getElementById("modal-type");
  const modalTags = document.getElementById("modal-tags");
  const modalChallenge = document.getElementById("modal-challenge");
  const modalSolution = document.getElementById("modal-solution");
  const modalResult = document.getElementById("modal-result");
  const closeModalBtn = document.getElementById("modal-close-btn");
  const glitchOverlay = document.getElementById("system-glitch");

  // 3. Funkcja otwierania z efektem SYSTEM BREACH
  window.openModal = function (projectId) {
    const data = projectsDB[projectId];
    if (!data) return;

    // KROK 1: Odpal Glitch
    glitchOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    // Symulacja czasu "Włamania" (300ms)
    setTimeout(() => {
      // KROK 2: Podmień dane w tle (gdy glitch zasłania ekran)

      // Reset animacji scrollowania
      modalImg.classList.remove("scrolling");
      void modalImg.offsetWidth; // Trigger reflow

      modalImg.src = data.image;
      modalTitle.innerText = data.title;
      modalType.innerText = data.type;
      modalChallenge.innerText = data.challenge;
      modalSolution.innerText = data.solution;
      modalResult.innerText = data.result;

      // Generuj tagi
      modalTags.innerHTML = data.tags
        .map((tag) => `<span class="tech-badge">${tag}</span>`)
        .join("");

      // Dodaj klasę animacji do obrazka
      modalImg.classList.add("scrolling");

      // KROK 3: Wyłącz Glitch i Pokaż Panel
      glitchOverlay.classList.remove("active");
      modal.classList.add("active");
    }, 300);
  };

  // 4. Funkcja zamykania
  window.closeModal = function () {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  // Eventy zamykania
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", window.closeModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) window.closeModal();
    });
  }

  // Zamknij na klawisz ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modal && modal.classList.contains("active")) {
        window.closeModal();
      }
    }
  });
}
