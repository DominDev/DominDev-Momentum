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

  // Auto-expand textarea
  const textarea = document.getElementById("panel-message");
  if (textarea) {
    textarea.addEventListener("input", function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
  }

  // Custom Validation Logic
  const validationSummary = document.getElementById("validation-summary");
  let hasAttemptedSubmit = false;

  const updateValidationSummary = () => {
    if (!hasAttemptedSubmit || !validationSummary) return;

    const errors = [];
    const inputs = form.querySelectorAll("input, textarea, select");

    inputs.forEach(input => {
      // Check required
      if (input.hasAttribute("required") && input.validity.valueMissing) {
        const label = form.querySelector(`label[for="${input.id}"]`);
        const labelText = label ? label.innerText.replace('*', '').trim() : input.name;
        errors.push({ id: input.id, msg: `${labelText}: WYMAGANE` });
      }
      // Check email format
      else if (input.type === "email" && input.value && !input.validity.valid) {
         errors.push({ id: input.id, msg: "E-MAIL: BŁĘDNY FORMAT" });
      }
      // Custom email regex check
      else if (input.id === "panel-email" && input.value) {
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(input.value)) {
            errors.push({ id: input.id, msg: "E-MAIL: NIEPRAWIDŁOWA DOMENA" });
         }
      }
      // Check checkbox (RODO)
      else if (input.type === "checkbox" && input.hasAttribute("required") && !input.checked) {
         errors.push({ id: input.id, msg: "ZGODA RODO: WYMAGANA" });
      }
    });

    if (errors.length > 0) {
      validationSummary.style.display = "block";
      validationSummary.innerHTML = `
        <div class="validation-summary-header">
           <i class="fa-solid fa-circle-exclamation"></i> STATUS SYSTEMU: ${errors.length} BŁĘDÓW
        </div>
        <ul class="validation-list">
          ${errors.map(err => `<li class="validation-item" data-for="${err.id}">${err.msg}</li>`).join('')}
        </ul>
      `;
    } else {
      validationSummary.style.display = "none";
      validationSummary.innerHTML = "";
    }
  };

  const showError = (input, message) => {
    const group = input.closest(".form-group");
    if (!group) return;
    
    clearError(input);
    input.classList.add("invalid");
    
    // Inline error (still useful for context)
    const msgDiv = document.createElement("div");
    msgDiv.className = "validation-msg";
    msgDiv.innerText = message;
    group.appendChild(msgDiv);
  };

  const clearError = (input) => {
    input.classList.remove("invalid");
    const group = input.closest(".form-group");
    if (!group) return;
    
    const existingMsg = group.querySelector(".validation-msg");
    if (existingMsg) existingMsg.remove();
  };

  if (form) {
    // Real-time error clearing & Summary Update
    form.querySelectorAll("input, textarea, select").forEach(input => {
      input.addEventListener("input", () => {
        clearError(input);
        updateValidationSummary();
      });
      input.addEventListener("change", () => {
        clearError(input);
        updateValidationSummary();
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      hasAttemptedSubmit = true; // Enable summary
      updateValidationSummary(); // First check

      const honeypot = document.getElementById("honey-field");
      if (honeypot && honeypot.value !== "") {
        console.warn("Bot detected. Submission blocked.");
        return;
      }

      // --- CUSTOM VALIDATION START ---
      let isValid = true;
      const inputs = form.querySelectorAll("input[required], textarea[required], select[required]");
      
      // Inline Validation Loop
      inputs.forEach(input => {
        if (!input.checkValidity()) {
          isValid = false;
          // ... error mapping ...
          if (input.validity.valueMissing) showError(input, "POLE WYMAGANE");
          else if (input.validity.typeMismatch) showError(input, "BŁĘDNY FORMAT");
          else showError(input, "BŁĄD DANYCH");
        }
      });
      
      // Manual checks (RODO, Email Regex)
      const rodo = document.getElementById("panel-rodo");
      if(rodo && !rodo.checked) {
          showError(rodo, "WYMAGANA ZGODA");
          isValid = false;
      }

      const emailField = document.getElementById("panel-email");
      if (emailField && !emailField.validity.valueMissing) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
          showError(emailField, "NIEPRAWIDŁOWY ADRES");
          isValid = false;
        }
      }

      // Re-run summary to ensure sync
      updateValidationSummary();

      if (!isValid) {
        // Focus summary or first invalid
        if(validationSummary.style.display !== "none") {
            validationSummary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return; 
      }
      // --- CUSTOM VALIDATION END ---

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
