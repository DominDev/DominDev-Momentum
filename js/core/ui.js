// js/core/ui.js

// === CURSOR (Separate export for Maintenance mode) ===
export function initCursor() {
  const cursorDot = document.getElementById("cursor-dot");
  const cursorOutline = document.getElementById("cursor-outline");

  if (cursorDot && cursorOutline && window.matchMedia("(min-width: 1024px)").matches) {
    // Set initial position immediately to prevent "frozen" cursor during preloader
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

      cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
      }, { duration: 500, fill: "forwards" });
    });

    const interactiveSelectors = "a, button, input, textarea, select, .project-card, .service-card, .chatbot-trigger, .progress-wrap, input[type='range'], input[type='checkbox'], .cert-chip";

    document.body.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        document.body.classList.add("hovering");
      }
    });

    document.body.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        document.body.classList.remove("hovering");
      }
    });

    document.addEventListener("mouseleave", () => document.body.classList.add("cursor-hidden"));
    document.addEventListener("mouseenter", () => document.body.classList.remove("cursor-hidden"));
  }
}

// === UI COMPONENTS (Normal mode only) ===
export function initUI() {

  // === HAMBURGER MENU ===
  const hamburger = document.getElementById("hamburger-menu");
  const menu = document.getElementById("fullscreen-menu");
  if (hamburger && menu) {
    const links = menu.querySelectorAll("a");
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      menu.classList.toggle("active");
    });
    links.forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        menu.classList.remove("active");
      });
    });
  }

  // === SCROLL PROGRESS ===
  const progressWrap = document.getElementById("progress-wrap");
  if (progressWrap) {
    const progressPath = progressWrap.querySelector("path");
    const pathLength = progressPath.getTotalLength();
    progressPath.style.transition = progressPath.style.WebkitTransition = "none";
    progressPath.style.strokeDasharray = pathLength + " " + pathLength;
    progressPath.style.strokeDashoffset = pathLength;
    progressPath.getBoundingClientRect();
    progressPath.style.transition = progressPath.style.WebkitTransition = "stroke-dashoffset 10ms linear";

    window.addEventListener("scroll", () => {
      const scroll = window.pageYOffset || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = pathLength - (scroll * pathLength) / height;
      progressPath.style.strokeDashoffset = progress;

      if (window.pageYOffset > 50) {
        progressWrap.classList.add("active-progress");
      } else {
        progressWrap.classList.remove("active-progress");
      }
    });

    progressWrap.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // === TYPEWRITER ===
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

    function type() {
      const currentWord = words[wordIndex];
      if (isDeleting) {
        typeTextSpan.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typeTextSpan.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }

      let typeSpeed = typingDelay;
      if (isDeleting) typeSpeed = erasingDelay;

      if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = newWordDelay;
        isDeleting = true;
        if (cursorSpan) cursorSpan.style.animationPlayState = "paused";
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex++;
        if (wordIndex === words.length) wordIndex = 0;
        typeSpeed = 500;
        if (cursorSpan) cursorSpan.style.animationPlayState = "running";
      }
      setTimeout(type, typeSpeed);
    }
    setTimeout(type, 1000);
  }

  // === SCROLL REVEAL ===
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}
