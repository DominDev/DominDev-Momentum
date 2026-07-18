// js/maintenance-page.js
// Standalone matrix animation for the maintenance page (served with 503).
// Plain script (no module) so it works under CSP script-src 'self'.
(function () {
  "use strict";

  var canvas = document.getElementById("maintenance-matrix");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var width = (canvas.width = window.innerWidth);
  var height = (canvas.height = window.innerHeight);

  var cols = Math.floor(width / 20);
  var ypos = Array(cols).fill(0);

  var mouseX = -100;
  var mouseY = -100;
  var targetMouseX = -100;
  var targetMouseY = -100;

  var lastTime = 0;
  var fps = 15;
  var interval = 1000 / fps;

  var reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  window.addEventListener("mousemove", function (e) {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  });

  window.addEventListener("resize", function () {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    var newCols = Math.floor(width / 20);
    while (ypos.length < newCols) ypos.push(0);
  });

  var chars =
    "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

  function matrixLoop(currentTime) {
    requestAnimationFrame(matrixLoop);

    if (!currentTime) currentTime = 0;
    var delta = currentTime - lastTime;
    if (delta < interval) return;
    lastTime = currentTime - (delta % interval);

    mouseX += (targetMouseX - mouseX) * 0.12;
    mouseY += (targetMouseY - mouseY) * 0.12;

    ctx.fillStyle = "rgba(5, 5, 5, 0.06)";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "15pt monospace";

    ypos.forEach(function (y, ind) {
      var text = chars[Math.floor(Math.random() * chars.length)];
      var x = ind * 20;

      var dist = Math.hypot(x - mouseX, y - mouseY);
      if (dist < 150) {
        ctx.fillStyle = "rgba(255, 31, 31, " + (1 - dist / 150) + ")";
      } else {
        ctx.fillStyle = Math.random() > 0.98 ? "#fff" : "#333";
      }

      ctx.fillText(text, x, y);

      if (y > 100 + Math.random() * 10000) {
        ypos[ind] = 0;
      } else {
        ypos[ind] = y + 20;
      }
    });
  }

  if (!reducedMotion) {
    requestAnimationFrame(matrixLoop);
  }
})();
