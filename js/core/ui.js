// js/core/ui.js

// === CURSOR (Separate export for Maintenance mode) ===
export function initCursor() {
  const cursorDot = document.getElementById("cursor-dot");
  const cursorOutline = document.getElementById("cursor-outline");

  // Custom cursor tylko na desktopie
  if (!cursorDot || !cursorOutline) return;
  if (!window.matchMedia("(min-width: 1024px)").matches) return;

  // Pozycja startowa (środek ekranu – żeby nie "stał" w lewym górnym rogu)
  const initPosX = window.innerWidth / 2;
  const initPosY = window.innerHeight / 2;

  cursorDot.style.left = `${initPosX}px`;
  cursorDot.style.top = `${initPosY}px`;
  cursorOutline.style.left = `${initPosX}px`;
  cursorOutline.style.top = `${initPosY}px`;

  window.addEventListener("mousemove", (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    cursorOutline.animate(
      {
        left: `${posX}px`,
        top: `${posY}px`,
      },
      { duration: 500, fill: "forwards" }
    );
  });

  // Elementy, na których kursor ma wejść w tryb "hovering"
  const interactiveSelectors = [
    "a",
    "button",
    "input",
    "textarea",
    "select",
    ".btn",
    ".nav-link",
    ".link",
    ".card",
    ".chatbot-trigger",
    ".progress-wrap",
    ".faq-item",
    ".faq-question",
    "input[type='range']",
    "input[type='checkbox']",
    ".cert-chip",
  ].join(", ");

  document.body.addEventListener("mouseover", (e) => {
    if (e.target.closest(interactiveSelectors)) {
      document.body.classList.add("hovering");
    }
  });

  document.body.addEventListener("mouseout", (e) => {
    if (e.target.closest(interactiveSelectors)) {
      document.body.classList.remove("hovering");
    }
  });

  document.addEventListener("mouseleave", () => {
    document.body.classList.add("cursor-hidden");
  });

  document.addEventListener("mouseenter", () => {
    document.body.classList.remove("cursor-hidden");
  });
}

// === UI COMPONENTS (Normal mode only) ===
export function initUI() {
  // CRITICAL FIX: Pre-activate ALL reveal animations on first hash link click
  // This ensures stable offsetTop for all sections (prevents layout shifts)
  let allRevealsActivated = false;

  const activateAllReveals = () => {
    if (allRevealsActivated) return;
    allRevealsActivated = true;

    const allReveals = document.querySelectorAll('.reveal:not(.active)');
    allReveals.forEach(el => el.classList.add('active'));

    // Force layout recalculation
    document.body.offsetHeight;
  };

  // Pre-activate reveals on hash link click
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href^='#']");
    if (link) {
      activateAllReveals();
    }
  });

  // === HAMBURGER MENU ===
  const hamburger = document.getElementById("hamburger-menu");
  const menu = document.getElementById("fullscreen-menu");

  if (hamburger && menu) {
    const links = menu.querySelectorAll("a");

    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      menu.classList.toggle("active");
      document.body.classList.toggle("menu-open");
    });

    links.forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        menu.classList.remove("active");
        document.body.classList.remove("menu-open");
      });
    });
  }

  // === SCROLL PROGRESS ===
  const progressWrap = document.getElementById("progress-wrap");

  if (progressWrap) {
    const progressPath = progressWrap.querySelector("path");
    if (progressPath) {
      const pathLength = progressPath.getTotalLength();

      progressPath.style.transition = progressPath.style.WebkitTransition =
        "none";
      progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
      progressPath.style.strokeDashoffset = pathLength;
      progressPath.getBoundingClientRect();
      progressPath.style.transition = progressPath.style.WebkitTransition =
        "stroke-dashoffset 10ms linear";

      window.addEventListener("scroll", () => {
        const scroll = window.pageYOffset || document.documentElement.scrollTop;
        const height =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        const progress = pathLength - (scroll * pathLength) / height;
        progressPath.style.strokeDashoffset = progress;

        if (window.pageYOffset > 50) {
          progressWrap.classList.add("active-progress");
        } else {
          progressWrap.classList.remove("active-progress");
        }
      });
    }

    progressWrap.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // === TYPEWRITER (hero) ===
  const typeTextSpan = document.querySelector(".typewriter-text");
  const cursorSpan = document.querySelector(".typewriter-cursor");

  if (typeTextSpan) {
    const words = ["BROŃ.", "PRZEWAGA.", "DOMINACJA.", "MASZYNA."];
    const typingDelay = 150;
    const erasingDelay = 80;
    const newWordDelay = 2500;
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      const currentWord = words[wordIndex];

      if (isDeleting) {
        typeTextSpan.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typeTextSpan.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }

      let typeSpeed = isDeleting ? erasingDelay : typingDelay;

      if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = newWordDelay;
        isDeleting = true;
        if (cursorSpan) cursorSpan.style.animationPlayState = "paused";
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
        if (cursorSpan) cursorSpan.style.animationPlayState = "running";
      }

      setTimeout(type, typeSpeed);
    };

    setTimeout(type, 1000);
  }

  // === FAQ ACCORDION (klik na CAŁĄ kartę) ===
  const faqItems = document.querySelectorAll(".faq-item");

  if (faqItems.length) {
    const closeAll = () => {
      faqItems.forEach((item) => {
        item.classList.remove("is-open");
        const answer = item.querySelector(".faq-answer");
        const question = item.querySelector(".faq-question");
        if (answer) answer.style.maxHeight = "0px";
        if (question) question.setAttribute("aria-expanded", "false");
      });
    };

    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");
      if (!question || !answer) return;

      // Start: wszystko zamknięte
      answer.style.maxHeight = "0px";
      question.setAttribute("role", "button");
      question.setAttribute("tabindex", "0");
      question.setAttribute("aria-expanded", "false");

      const toggleItem = () => {
        const isOpen = item.classList.contains("is-open");
        closeAll();

        if (!isOpen) {
          item.classList.add("is-open");
          answer.style.maxHeight = `${answer.scrollHeight}px`;
          question.setAttribute("aria-expanded", "true");
        }
      };

      // Klik na CAŁĄ kartę (oprócz linków w środku)
      item.addEventListener("click", (e) => {
        const isLink = e.target.closest("a, button");
        if (isLink) return;
        toggleItem();
      });

      // Obsługa klawiatury (Enter / Space) na pytaniu
      question.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleItem();
        }
      });
    });

    // Klik poza FAQ zamyka wszystkie
    document.addEventListener("click", (e) => {
      // Don't close FAQ items when clicking hash navigation links OR hamburger menu
      const isHashLink = e.target.closest("a[href^='#']");
      const isHamburger = e.target.closest(".hamburger, #hamburger-menu");

      if (isHashLink || isHamburger) return;
      if (!e.target.closest(".faq-item")) closeAll();
    });
  }

  // === SCROLL REVEAL ===
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    { threshold: 0.1 }
  );

  const revealElements = document.querySelectorAll(".reveal");
  revealElements.forEach((el) => observer.observe(el));
}
