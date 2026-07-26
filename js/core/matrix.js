// js/core/matrix.js
// Background Matrix with Intersection Observer & Visibility API optimization
import { REDUCED_MOTION_MEDIA } from '../utils/motion.js?v=1';

export function initMatrix() {
  const canvas = document.getElementById("matrixCanvas");
  if (!canvas) return;

  canvas.setAttribute('aria-hidden', 'true');

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
  let interval = 1000 / fps;

  // Fast initial load - higher FPS for first few seconds
  let frameCount = 0;
  const fastLoadFrames = 120;
  const isSlowConnection = navigator.connection?.effectiveType === '2g' || navigator.connection?.saveData;
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  const fastFPS = (isSlowConnection || isLowEnd) ? 15 : 30;

  let animationId = null;
  let isVisible = true; // Internal flag for loop
  const motionQuery = window.matchMedia(REDUCED_MOTION_MEDIA);
  const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
  
  // State tracking
  let isIntersecting = false; 

  // --- Handlers ---

  const mouseMoveHandler = (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  };

  const resizeHandler = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const newCols = Math.floor(width / 20);
    while (ypos.length < newCols) ypos.push(0);
    if (motionQuery.matches) drawStaticFrame();
  };

  function drawStaticFrame() {
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "15pt monospace";

    const rows = Math.ceil(height / 20);
    const columns = Math.ceil(width / 20);
    for (let row = 1; row <= rows; row++) {
      for (let column = 0; column < columns; column++) {
        if ((row * 13 + column * 7) % 5 !== 0) continue;
        const char = chars[(row * 17 + column * 31) % chars.length];
        ctx.fillStyle = (row + column) % 29 === 0
          ? "rgba(255, 31, 31, 0.28)"
          : "rgba(255, 255, 255, 0.08)";
        ctx.fillText(char, column * 20, row * 20);
      }
    }
    canvas.dataset.motionState = 'static';
  }

  function updateAnimationState() {
    // Run ONLY if intersecting AND document is visible
    const shouldRun = isIntersecting && !document.hidden && !motionQuery.matches;

    if (shouldRun && !animationId) {
      isVisible = true;
      animationId = requestAnimationFrame(matrixLoop);
    } else if (!shouldRun && animationId) {
      isVisible = false;
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  const handleVisibilityChange = () => {
    updateAnimationState();
  };

  const handleMotionChange = () => {
    updateAnimationState();
    if (motionQuery.matches) {
      drawStaticFrame();
    } else {
      canvas.dataset.motionState = 'animated';
    }
  };

  // Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isIntersecting = entry.isIntersecting;
        updateAnimationState();
      });
    },
    { threshold: 0.1 }
  );

  // --- Init Listeners ---
  observer.observe(canvas);
  window.addEventListener("mousemove", mouseMoveHandler, { passive: true });
  window.addEventListener("resize", resizeHandler, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange);
  motionQuery.addEventListener?.('change', handleMotionChange);

  if (motionQuery.matches) {
    drawStaticFrame();
  } else {
    canvas.dataset.motionState = 'animated';
  }

  // --- Animation Loop ---
  function matrixLoop(currentTime) {
    if (!isVisible) {
       animationId = null; 
       return; 
    }

    animationId = requestAnimationFrame(matrixLoop);

    if (!currentTime) currentTime = 0;

    // Use higher FPS during initial load
    if (frameCount < fastLoadFrames) {
      interval = 1000 / fastFPS;
      frameCount++;
    } else {
      interval = 1000 / fps;
    }

    const delta = currentTime - lastTime;
    if (delta < interval) return;
    lastTime = currentTime - (delta % interval);

    mouseX += (targetMouseX - mouseX) * 0.12;
    mouseY += (targetMouseY - mouseY) * 0.12;

    ctx.fillStyle = "rgba(5, 5, 5, 0.06)";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "15pt monospace";

    ypos.forEach((y, ind) => {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = ind * 20;

      const dist = Math.hypot(x - mouseX, y - mouseY);
      if (dist < 150) {
        ctx.fillStyle = `rgba(255, 31, 31, ${1 - dist / 150})`;
      } else {
        ctx.fillStyle = Math.random() > 0.98 ? "#fff" : "#333";
      }

      ctx.fillText(text, x, y);

      if (y > height + Math.random() * 10000) {
        ypos[ind] = 0;
      } else {
        ypos[ind] = y + 20;
      }
    });
  }

  // Initial start check (IntersectionObserver will trigger eventually, but let's try starting if visible)
  // Actually, IO callback fires on observe(), so we rely on that for initial start.
}
