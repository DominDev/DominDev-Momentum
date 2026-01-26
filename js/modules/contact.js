// js/modules/contact.js
import { CONFIG } from "../config.js";

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
      // A11Y: Remove aria-hidden when modal is visible to prevent focus conflict
      contactPanel.setAttribute("aria-hidden", "false");
      // Focus first interactive element for keyboard users
      if (contactCloseBtn) {
        contactCloseBtn.focus();
      }
    }, 300);
  };

  // Store the element that opened the modal for focus restore
  let lastFocusedElement = null;

  const originalOpenContactPanel = window.openContactPanel;
  window.openContactPanel = function () {
    lastFocusedElement = document.activeElement;
    originalOpenContactPanel();
  };

  window.closeContactPanel = function () {
    if (contactPanel) {
      contactPanel.classList.remove("active");
      document.body.style.overflow = "";

      // A11Y: Move focus OUT of modal BEFORE setting aria-hidden
      if (lastFocusedElement && lastFocusedElement.focus) {
        lastFocusedElement.focus();
      } else {
        document.body.focus();
      }

      // A11Y: Now safe to hide from assistive technology
      contactPanel.setAttribute("aria-hidden", "true");
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
      } else if (budgetValue >= 15000) {
        budgetInput.value = 15000;
        budgetLabel.innerText = "15 000+ PLN";
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
      } else if (val >= 15000) {
        budgetValueLabel.innerText = "15 000+ PLN";
      } else {
        budgetValueLabel.innerText = val.toLocaleString("pl-PL") + " PLN";
      }
    });
  }

  const form = document.getElementById("contactForm");

  // Auto-expand textarea
  const textarea = document.getElementById("panel-message");
  if (textarea) {
    textarea.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });
  }

  // Custom Validation Logic
  const validationSummary = document.getElementById("validation-summary");
  let hasAttemptedSubmit = false;

  const updateValidationSummary = () => {
    if (!hasAttemptedSubmit || !validationSummary) return;

    const errors = [];
    const inputs = form.querySelectorAll("input, textarea, select");

    inputs.forEach((input) => {
      // Check required
      if (input.hasAttribute("required") && input.validity.valueMissing) {
        const label = form.querySelector(`label[for="${input.id}"]`);
        const labelText = label
          ? label.innerText.replace("*", "").trim()
          : input.name;
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
      else if (
        input.type === "checkbox" &&
        input.hasAttribute("required") &&
        !input.checked
      ) {
        errors.push({ id: input.id, msg: "ZGODA RODO: WYMAGANA" });
      }
    });

    if (errors.length > 0) {
      validationSummary.style.display = "block";
      // A11Y: Set role and aria-live for screen reader announcements
      validationSummary.setAttribute("role", "alert");
      validationSummary.setAttribute("aria-live", "assertive");
      validationSummary.innerHTML = `
        <div class="validation-summary-header">
           <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> STATUS SYSTEMU: ${errors.length} BŁĘDÓW
        </div>
        <ul class="validation-list">
          ${errors.map((err) => `<li class="validation-item" data-for="${err.id}">${err.msg}</li>`).join("")}
        </ul>
      `;
    } else {
      validationSummary.style.display = "none";
      validationSummary.removeAttribute("role");
      validationSummary.removeAttribute("aria-live");
      validationSummary.innerHTML = "";
    }
  };

  const showError = (input, message) => {
    const group = input.closest(".form-group");
    if (!group) return;

    clearError(input);
    input.classList.add("invalid");

    // A11Y: Generate unique error ID and link to input
    const errorId = input.id + "-error";
    const msgDiv = document.createElement("div");
    msgDiv.id = errorId;
    msgDiv.className = "validation-msg";
    msgDiv.setAttribute("role", "alert");
    msgDiv.innerText = message;
    group.appendChild(msgDiv);

    // A11Y: Mark input as invalid and link to error message
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", errorId);
  };

  const clearError = (input) => {
    input.classList.remove("invalid");

    // A11Y: Remove ARIA attributes when error is cleared
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");

    const group = input.closest(".form-group");
    if (!group) return;

    const existingMsg = group.querySelector(".validation-msg");
    if (existingMsg) existingMsg.remove();
  };

  if (form) {
    // Real-time error clearing & Summary Update
    form.querySelectorAll("input, textarea, select").forEach((input) => {
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
      let firstInvalidField = null; // A11Y: Track first invalid field for focus
      const inputs = form.querySelectorAll(
        "input[required], textarea[required], select[required]",
      );

      // Inline Validation Loop
      inputs.forEach((input) => {
        if (!input.checkValidity()) {
          isValid = false;
          if (!firstInvalidField) firstInvalidField = input;
          // ... error mapping ...
          if (input.validity.valueMissing) showError(input, "POLE WYMAGANE");
          else if (input.validity.typeMismatch)
            showError(input, "BŁĘDNY FORMAT");
          else showError(input, "BŁĄD DANYCH");
        }
      });

      // Manual checks (RODO, Email Regex)
      const rodo = document.getElementById("panel-rodo");
      if (rodo && !rodo.checked) {
        showError(rodo, "WYMAGANA ZGODA");
        if (!firstInvalidField) firstInvalidField = rodo;
        isValid = false;
      }

      const emailField = document.getElementById("panel-email");
      if (emailField && !emailField.validity.valueMissing) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
          showError(emailField, "NIEPRAWIDŁOWY ADRES");
          if (!firstInvalidField) firstInvalidField = emailField;
          isValid = false;
        }
      }

      // Re-run summary to ensure sync
      updateValidationSummary();

      if (!isValid) {
        // A11Y: Focus validation summary so screen reader announces all errors
        if (validationSummary) {
          // Make summary focusable if not already
          if (!validationSummary.hasAttribute("tabindex")) {
            validationSummary.setAttribute("tabindex", "-1");
          }
          validationSummary.focus();
          validationSummary.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
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

        if (CONFIG.mail.provider === "formspree") {
          response = await sendViaFormspree(data);
        } else if (CONFIG.mail.provider === "cloudflare") {
          response = await sendViaCloudflare(data);
        } else if (CONFIG.mail.provider === "custom") {
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
            msgDiv.innerText = "Sygnał odebrany. Potwierdzam status.\nOczekuj zaszyfrowanej transmisji (e-maila) w ciągu 24h.";
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
          msgDiv.innerHTML =
            'Błąd połączenia. Spróbuj ponownie lub <a href="mailto:contact@domindev.com" style="color: #ff1f1f; text-decoration: underline;">napisz bezpośrednio</a>.';
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
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

async function sendViaCloudflare(data) {
  // Get Turnstile token from the hidden input (auto-populated by Cloudflare widget)
  const form = document.getElementById("contactForm");
  const turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
  const turnstileToken = turnstileInput ? turnstileInput.value : "";

  // Build payload - FormData uses 'name' attribute from inputs
  // Form has: name="name", name="email", name="message", name="budget", name="service", name="rodo"
  const payload = {
    name: data.name || "",
    email: data.email || "",
    message: data.message || "",
    budget: data.budget || "",
    service: data.service || "",
    rodoAccepted: data.rodo === "on", // checkbox value is "on" when checked
    honey: document.getElementById("honey-field")?.value || "",
    turnstileToken: turnstileToken,
  };

  return await fetch("/api/contact", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
