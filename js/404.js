// js/404.js
import { initMatrix } from './core/matrix.js';

document.addEventListener("DOMContentLoaded", () => {
  initMatrix();

  const cursorDot = document.getElementById("cursor-dot");
  const cursorOutline = document.getElementById("cursor-outline");

  if (cursorDot && cursorOutline && window.matchMedia("(min-width: 1024px)").matches) {
    window.addEventListener("mousemove", (e) => {
      const posX = e.clientX;
      const posY = e.clientY;
      cursorDot.style.left = `${posX}px`;
      cursorDot.style.top = `${posY}px`;
      cursorOutline.animate(
        { left: `${posX}px`, top: `${posY}px` },
        { duration: 500, fill: "forwards" }
      );
    });

    const btn = document.querySelector(".btn");
    if (btn) {
      btn.addEventListener("mouseenter", () => document.body.classList.add("hovering"));
      btn.addEventListener("mouseleave", () => document.body.classList.remove("hovering"));
    }

    document.addEventListener("mouseleave", () => document.body.classList.add("cursor-hidden"));
    document.addEventListener("mouseenter", () => document.body.classList.remove("cursor-hidden"));
  }
});
