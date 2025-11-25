// js/modules/contact.js
import { CONFIG } from '../config.js';

export function initContact() {
  const contactPanel = document.getElementById("contact-panel");
  const contactCloseBtn = document.getElementById("contact-close-btn");
  const glitchOverlay = document.getElementById("system-glitch");

  window.openContactPanel = function () {
    if (!contactPanel) return;

    if (glitchOverlay) {
      glitchOverlay.classList.add("active");
    }
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      if (glitchOverlay) {
        glitchOverlay.classList.remove("active");
      }
      contactPanel.classList.add("active");
    }, 300);
  };

  window.closeContactPanel = function () {
    if (contactPanel) {
      contactPanel.classList.remove("active");
      document.body.style.overflow = "";
    }
  };

  if (contactCloseBtn) {
    contactCloseBtn.addEventListener("click", window.closeContactPanel);
  }

  if (contactPanel) {
    contactPanel.addEventListener("click", (e) => {
      if (e.target === contactPanel) window.closeContactPanel();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (contactPanel && contactPanel.classList.contains("active")) {
        window.closeContactPanel();
      }
    }
  });

  window.prefillForm = function (serviceType, budgetValue) {
    window.openContactPanel();

    const serviceSelect = document.getElementById("panel-service");
    const budgetInput = document.getElementById("panel-budget");
    const budgetLabel = document.getElementById("budgetValue");

    if (serviceSelect) {
      serviceSelect.value = serviceType;
    }

    if (budgetInput && budgetLabel) {
      if (budgetValue === 0) {
        budgetInput.value = 0;
        budgetLabel.innerText = "Partnerstwo | Win-Win";
      } else {
        budgetInput.value = budgetValue;
        budgetLabel.innerText = budgetValue.toLocaleString("pl-PL") + " PLN";
      }
    }
  };

  const panelBudget = document.getElementById("panel-budget");
  const budgetValueLabel = document.getElementById("budgetValue");

  if (panelBudget && budgetValueLabel) {
    panelBudget.addEventListener("input", function () {
      const val = parseInt(this.value);
      if (val === 0) {
        budgetValueLabel.innerText = "Partnerstwo | Win-Win";
      } else {
        budgetValueLabel.innerText = val.toLocaleString("pl-PL") + " PLN";
      }
    });
  }

  const form = document.getElementById("contactForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const honeypot = document.getElementById("honey-field");
      if (honeypot && honeypot.value !== "") {
        console.warn("Bot detected. Submission blocked.");
        return;
      }

      const btn = form.querySelector("button[type='submit']");
      const msgDiv = document.getElementById("formMessage");
      const originalText = btn.innerText;

      btn.innerText = "NADAWANIE SYGNAŁU...";
      btn.disabled = true;
      btn.style.opacity = "0.7";

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
        let response;

        if (CONFIG.mail.provider === 'formspree') {
          response = await sendViaFormspree(data);
        } else if (CONFIG.mail.provider === 'custom') {
          throw new Error("Custom provider not implemented yet");
        } else {
          throw new Error("Unknown mail provider");
        }

        if (response.ok) {
          btn.innerText = "POTWIERDZONO.";
          btn.style.borderColor = "#4ade80";
          btn.style.color = "#4ade80";
          btn.style.opacity = "1";

          if (msgDiv) {
            msgDiv.innerText = "Sygnał odebrany. Bez odbioru.";
            msgDiv.style.color = "#4ade80";
          }

          setTimeout(() => {
            window.closeContactPanel();
            setTimeout(() => {
              btn.innerText = originalText;
              btn.disabled = false;
              btn.style = "";
              if (msgDiv) msgDiv.innerText = "";
              form.reset();
            }, 500);
          }, 2000);

        } else {
          throw new Error("Błąd transmisji danych.");
        }

      } catch (error) {
        console.error(error);
        btn.innerText = "BŁĄD NADAWANIA";
        btn.style.borderColor = "#ff1f1f";
        btn.style.color = "#ff1f1f";

        if (msgDiv) {
          msgDiv.innerText = "Błąd połączenia. Spróbuj ponownie lub napisz bezpośrednio.";
          msgDiv.style.color = "#ff1f1f";
        }

        setTimeout(() => {
          btn.innerText = originalText;
          btn.disabled = false;
          btn.style = "";
        }, 4000);
      }
    });
  }
}

async function sendViaFormspree(data) {
  const endpoint = `https://formspree.io/f/${CONFIG.mail.formspreeId}`;

  return await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
}
