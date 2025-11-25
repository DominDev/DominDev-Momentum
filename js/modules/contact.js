// js/modules/contact.js

export function initContact() {
  const contactPanel = document.getElementById("contact-panel");
  const contactCloseBtn = document.getElementById("contact-close-btn");
  const glitchOverlay = document.getElementById("system-glitch");

  // Funkcja otwierania panelu kontaktowego (z efektem Glitch jak w Portfolio)
  window.openContactPanel = function () {
    if (!contactPanel) return;

    // KROK 1: Odpal Glitch
    if (glitchOverlay) {
      glitchOverlay.classList.add("active");
    }
    document.body.style.overflow = "hidden";

    // Symulacja czasu "Włamania" (300ms)
    setTimeout(() => {
      // KROK 2: Wyłącz Glitch i Pokaż Panel
      if (glitchOverlay) {
        glitchOverlay.classList.remove("active");
      }
      contactPanel.classList.add("active");
    }, 300);
  };

  // Funkcja zamykania panelu
  window.closeContactPanel = function () {
    if (contactPanel) {
      contactPanel.classList.remove("active");
      document.body.style.overflow = "";
    }
  };

  if (contactCloseBtn) {
    contactCloseBtn.addEventListener("click", window.closeContactPanel);
  }

  // Zamknij klikając w tło
  if (contactPanel) {
    contactPanel.addEventListener("click", (e) => {
      if (e.target === contactPanel) window.closeContactPanel();
    });
  }

  // Zamknij na ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (contactPanel && contactPanel.classList.contains("active")) {
        window.closeContactPanel();
      }
    }
  });

  /* --- SMART PREFILL LOGIC --- */
  window.prefillForm = function (serviceType, budgetValue) {
    // 1. Otwórz panel
    window.openContactPanel();

    // 2. Znajdź elementy formularza (są teraz w panelu)
    const serviceSelect = document.getElementById("panel-service");
    const budgetInput = document.getElementById("panel-budget");
    const budgetLabel = document.getElementById("budgetValue");

    // 3. Ustaw usługę
    if (serviceSelect) {
      serviceSelect.value = serviceType;
    }

    // 4. Ustaw budżet
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

  // Budget slider update w panelu
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
}
