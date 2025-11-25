// js/404.js - Minimal script for 404 page (Matrix + Cursor only)
import { initMatrix } from './core/matrix.js';

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Matrix background
  initMatrix();

  // Initialize Cursor (simplified for 404)
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

    // Hover effect on button
    const btn = document.querySelector(".btn");
    if (btn) {
      btn.addEventListener("mouseenter", () => document.body.classList.add("hovering"));
      btn.addEventListener("mouseleave", () => document.body.classList.remove("hovering"));
    }

    document.addEventListener("mouseleave", () => document.body.classList.add("cursor-hidden"));
    document.addEventListener("mouseenter", () => document.body.classList.remove("cursor-hidden"));
  }
});
