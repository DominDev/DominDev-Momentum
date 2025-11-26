// js/core/matrix.js
// Background Matrix with Intersection Observer optimization
export function initMatrix() {
  const canvas = document.getElementById("matrixCanvas");
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

  // Pause animation when canvas is not visible (CPU saver)
  let isVisible = true;
  let animationId = null;

  // Intersection Observer - pauses animation when canvas out of viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        // If became visible, restart animation loop
        if (isVisible && !animationId) {
          animationId = requestAnimationFrame(matrixLoop);
        }
      });
    },
    { threshold: 0.1 } // Trigger when at least 10% visible
  );

  observer.observe(canvas);

  const mouseMoveHandler = (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  };

  const resizeHandler = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const newCols = Math.floor(width / 20);
    while (ypos.length < newCols) ypos.push(0);
  };

  window.addEventListener("mousemove", mouseMoveHandler, { passive: true });
  window.addEventListener("resize", resizeHandler, { passive: true });

  function matrixLoop(currentTime) {
    // Only continue loop if canvas is visible
    if (!isVisible) {
      animationId = null;
      return;
    }

    animationId = requestAnimationFrame(matrixLoop);

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

      if (y > height + Math.random() * 10000) {
        ypos[ind] = 0;
      } else {
        ypos[ind] = y + 20;
      }
    });
  }

  // Start animation
  animationId = requestAnimationFrame(matrixLoop);
}
