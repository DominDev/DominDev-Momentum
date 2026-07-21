// js/service-page.js
// Lean entry point for service landing pages. Brings the one-pager's visual
// language (matrix background, scroll-reveal, custom cursor, mobile menu,
// scroll progress) WITHOUT the preloader, portfolio modal, contact form or
// chatbot - so a cold Google visitor sees content instantly but the page still
// feels like the rest of the site.
import { initMatrix } from "./core/matrix.js";
import { initUI, initCursor } from "./core/ui.js";

// Safety net: .reveal starts at opacity 0 and is normally revealed by the
// IntersectionObserver in core/ui.js. On a landing page that visitors reach
// cold from Google, "invisible until JS behaves" is not acceptable - a stalled
// observer (odd viewport, prerender, embedded webview) would mean a blank page.
// So we force everything visible shortly after load; the observer still runs
// and animates whatever it reaches first.
const REVEAL_FALLBACK_MS = 1200;

function revealEverything() {
  document
    .querySelectorAll(".reveal:not(.active)")
    .forEach((el) => el.classList.add("active"));
}

function start() {
  initMatrix();
  initUI();
  initCursor();
  setTimeout(revealEverything, REVEAL_FALLBACK_MS);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}

// If the module itself fails to execute for any reason, this never runs - the
// <noscript> stylesheet covers the JS-disabled case.
