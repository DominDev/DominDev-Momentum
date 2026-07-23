// js/modules/chatbot.js
let botData = null;
let botDataPromise = null;
const SPLIT_REGEX = /[\s,.;!?]+/;
const DATA_LOAD_ERROR_RESPONSE = "⚠️ Nie udało się wczytać bazy odpowiedzi. Spróbuj odświeżyć stronę lub napisz ponownie za chwilę.";

/**
 * Normalizuje tekst, usuwając polskie znaki diakrytyczne.
 * @param {string} str - Tekst do normalizacji.
 * @returns {string} - Znormalizowany tekst.
 */
const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

async function loadBotData() {
  if (botData) return botData;
  if (botDataPromise) return botDataPromise;

  botDataPromise = (async () => {
  try {
    const response = await fetch("data/chatbot-db.json");
    if (!response.ok) {
      throw new Error(`Chatbot data request failed with ${response.status}`);
    }

    const data = await response.json();
    if (!data || typeof data !== "object" || !Array.isArray(data.vulgarWords)
      || !data.keywordMap || !data.responses || !data.glossary) {
      throw new Error("Chatbot data has an invalid shape");
    }

    // Pre-kompilacja i normalizacja danych dla maksymalnej wydajności
    data.normalizedVulgarWords = data.vulgarWords.map(normalize);

    data.precomputedGlossary = Object.keys(data.glossary)
      .map((term) => ({
        original: term,
        normalized: normalize(term),
      }))
      .sort((a, b) => b.normalized.length - a.normalized.length);

    data.normalizedKeywordMap = {};
    data.precomputedPhrases = [];

    for (const key in data.keywordMap) {
      const normalizedKey = normalize(key);
      data.normalizedKeywordMap[normalizedKey] = data.keywordMap[key];
      if (key.includes(" ")) {
        data.precomputedPhrases.push({
          original: key,
          normalized: normalizedKey,
        });
      }
    }
    botData = data;
    return botData;
  } catch (error) {
    console.error("Failed to load chatbot data:", error);
    return null;
  } finally {
    botDataPromise = null;
  }
  })();

  return botDataPromise;
}

export function initChat() {
  const chatbotTrigger = document.getElementById("chatbot-trigger");
  const chatbotBackdrop = document.getElementById("chatbot-backdrop");
  const chatbotWindow = document.getElementById("chatbot-window");
  const chatbotClose = document.getElementById("chatbot-close");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSend = document.getElementById("chatbot-send");
  const chatbotMessages = document.getElementById("chatbot-messages");
  let previousFocus = null;
  let lockedScrollY = 0;
  let savedBodyStyles = null;

  const focusableSelector = [
    "button:not([disabled])",
    "[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex=\"-1\"])",
  ].join(",");

  function lockPageScroll() {
    if (!window.matchMedia("(max-width: 1024px)").matches || savedBodyStyles) {
      return;
    }

    const body = document.body;
    lockedScrollY = window.scrollY;
    savedBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${lockedScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.classList.add("chatbot-open");
  }

  function unlockPageScroll() {
    if (!savedBodyStyles) return;

    const body = document.body;
    Object.assign(body.style, savedBodyStyles);
    body.classList.remove("chatbot-open");

    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, lockedScrollY);
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
    savedBodyStyles = null;
  }

  async function openChat() {
    if (!chatbotWindow || !chatbotTrigger || chatbotWindow.classList.contains("active")) {
      return;
    }

    previousFocus = document.activeElement;
    chatbotWindow.classList.add("active");
    chatbotTrigger.classList.add("active");
    chatbotTrigger.setAttribute("aria-expanded", "true");
    chatbotWindow.setAttribute("aria-hidden", "false");
    if (chatbotBackdrop) {
      chatbotBackdrop.classList.add("active");
      chatbotBackdrop.setAttribute("aria-hidden", "false");
    }
    lockPageScroll();

    // Delay focus aby poczekać na animację otwarcia
    setTimeout(() => {
      if (chatbotWindow.classList.contains("active") && chatbotInput) {
        chatbotInput.focus();
      }
    }, 100);

    if (!botData) {
      await loadBotData();
    }
  }

  function closeChat() {
    if (!chatbotWindow || !chatbotWindow.classList.contains("active")) return;

    chatbotWindow.classList.remove("active");
    chatbotTrigger.classList.remove("active");
    chatbotTrigger.setAttribute("aria-expanded", "false");
    chatbotWindow.setAttribute("aria-hidden", "true");
    if (chatbotBackdrop) {
      chatbotBackdrop.classList.remove("active");
      chatbotBackdrop.setAttribute("aria-hidden", "true");
    }
    unlockPageScroll();

    const focusTarget = chatbotTrigger || previousFocus;
    if (focusTarget && typeof focusTarget.focus === "function") {
      requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
    }
    previousFocus = null;
  }

  function toggleChat() {
    if (chatbotWindow.classList.contains("active")) {
      closeChat();
    } else {
      openChat();
    }
  }

  if (chatbotClose) chatbotClose.addEventListener("click", closeChat);
  if (chatbotBackdrop) {
    chatbotBackdrop.addEventListener("click", (event) => {
      if (event.target === chatbotBackdrop) closeChat();
    });
  }

  // Escape zamyka dialog, a Tab pozostaje w jego obrębie.
  if (chatbotWindow) chatbotWindow.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeChat();
      return;
    }

    if (e.key !== "Tab") return;

    const focusable = [...chatbotWindow.querySelectorAll(focusableSelector)]
      .filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  let lastMessageTime = 0;
  const COOLDOWN_MS = 500;
  let responseQueue = Promise.resolve();

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function deliverResponse(msg) {
    showTyping();

    try {
      if (!botData && !(await loadBotData())) {
        throw new Error("Chatbot data is unavailable");
      }

      await wait(600 + Math.random() * 500);
      removeTyping();
      addMessage(getBotResponse(msg));
    } catch (error) {
      console.error("Failed to prepare chatbot response:", error);
      removeTyping();
      addMessage(DATA_LOAD_ERROR_RESPONSE);
    }
  }

  function sendMessage() {
    const now = Date.now();
    if (now - lastMessageTime < COOLDOWN_MS) return;
    lastMessageTime = now;

    const msg = chatbotInput.value.trim();
    if (!msg) return;

    addMessage(msg, true);
    chatbotInput.value = "";
    chatbotSend.classList.remove("active"); // Usuń aktywny stan po wysłaniu

    // Serializuje odpowiedzi, aby szybkie kolejne wysyłki nie tworzyły
    // kilku elementów `typing-indicator` z tym samym identyfikatorem.
    responseQueue = responseQueue.then(() => deliverResponse(msg));
  }

  if (chatbotSend) chatbotSend.addEventListener("click", sendMessage);
  if (chatbotInput) {
    chatbotInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });

    // Aktywuj/dezaktywuj ikonę wysyłki w zależności od treści pola
    chatbotInput.addEventListener("input", () => {
      if (chatbotInput.value.trim().length > 0) {
        chatbotSend.classList.add("active");
      } else {
        chatbotSend.classList.remove("active");
      }
    });
  }

  function addMessage(text, isUser = false) {
    const div = document.createElement("div");
    div.className = `chat-message ${isUser ? "user" : "bot"}`;

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    if (isUser) {
      // SEC-01: User messages use textContent to prevent XSS
      messageContent.textContent = text;
    } else {
      // SEC-02: Bot messages use Safe Renderer (No innerHTML vulnerability)
      renderSafeHTML(messageContent, text);
    }

    div.appendChild(messageContent);
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    // Zamknij chat automatycznie po kliknięciu w link na małych ekranach
    if (!isUser && window.innerWidth <= 1024) {
      const links = div.querySelectorAll("a");
      links.forEach((link) => {
        link.addEventListener("click", () => {
          closeChat();
        });
      });
    }
  }

  /**
   * Bezpiecznie renderuje HTML z dozwolonych tagów.
   * Zapobiega XSS (Cross-Site Scripting).
   */
  function renderSafeHTML(container, htmlString) {
    container.textContent = ""; // Clear
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    
    // Dozwolone tagi (lowercase convention)
    const allowedTags = ["p", "ul", "ol", "li", "strong", "b", "a", "br"];

    function sanitizeNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return document.createTextNode(node.textContent);
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        
        if (allowedTags.includes(tagName)) {
          const el = document.createElement(tagName);
          
          // Kopiuj tylko bezpieczne atrybuty
          if (tagName === "a") {
            const href = node.getAttribute("href");
            const safeHref = href ? href.trim() : "";
            // Allow http, mailto, anchor, and relative paths
            if (safeHref && (safeHref.startsWith("http") || safeHref.startsWith("mailto") || safeHref.startsWith("#") || safeHref.startsWith("/"))) {
              const anchorTarget = safeHref.startsWith("#") ? safeHref.slice(1) : "";
              const resolvedHref = anchorTarget && !document.getElementById(anchorTarget)
                ? `/${safeHref}`
                : safeHref;
              el.setAttribute("href", resolvedHref);
            }
            if (node.classList.contains("chatbot-link")) {
              el.classList.add("chatbot-link");
            }
            
            // UX Fix: Open ONLY external HTTP links in new tab
            if (safeHref && safeHref.startsWith("http")) {
                el.setAttribute("target", "_blank");
                el.setAttribute("rel", "noopener noreferrer");
            }
          }
          
          // Rekurencyjnie przetwarzaj dzieci
          node.childNodes.forEach(child => {
            const processedChild = sanitizeNode(child);
            if (processedChild) el.appendChild(processedChild);
          });
          
          return el;
        } else {
          // Jeśli tag niedozwolony, zwróć jego zawartość tekstową (lub przetwórz dzieci bez wrappera)
          const fragment = document.createDocumentFragment();
          node.childNodes.forEach(child => {
            const processedChild = sanitizeNode(child);
            if (processedChild) fragment.appendChild(processedChild);
          });
          return fragment;
        }
      }
      return null;
    }

    doc.body.childNodes.forEach(node => {
      const sanitized = sanitizeNode(node);
      if (sanitized) container.appendChild(sanitized);
    });
  }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "chat-message bot";
    div.id = "typing-indicator";
    div.setAttribute("role", "status");
    div.setAttribute("aria-label", "Asystent przygotowuje odpowiedź");
    
    // Safe DOM creation
    const indicator = document.createElement("div");
    indicator.className = "typing-indicator";
    indicator.appendChild(document.createElement("span"));
    indicator.appendChild(document.createElement("span"));
    indicator.appendChild(document.createElement("span"));
    
    div.appendChild(indicator);
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function removeTyping() {
    const typing = document.getElementById("typing-indicator");
    if (typing) typing.remove();
  }

  /**
   * Znajduje intencję użytkownika i zwraca odpowiednią odpowiedź.
   * Używa zoptymalizowanej struktury `keywordMap` i `glossary`.
   * @param {string} msg - Wiadomość od użytkownika.
   * @returns {string} - Odpowiedź bota.
   */
  function getBotResponse(msg) {
    if (!botData) return "⚠️ System niedostępny. Spróbuj odświeżyć stronę.";

    // Walidacja pustej wiadomości
    if (!msg || msg.trim() === "") {
      return "🤔 Nie rozumiem. Napisz coś!";
    }

    const lowerInput = msg.toLowerCase().trim();
    const normalizedInput = normalize(lowerInput);
    const words = normalizedInput.split(SPLIT_REGEX).filter(Boolean);
    const serviceIntents = new Set([
      "landing",
      "business",
      "ecommerce",
      "webapp",
      "audit",
      "speedboost",
      "integration",
      "performance",
    ]);
    const matchesTerm = (term) => term.includes(" ")
      ? normalizedInput.includes(term)
      : words.includes(term);

    // Wulgaryzmy są sprawdzane jako pełne słowa, aby np. „hello” nie zawierało
    // fałszywie wykrytego „hell”.
    if (botData.normalizedVulgarWords.some(matchesTerm)) {
      return getRandom(botData.responses.vulgar);
    }

    const glossaryMatch = botData.precomputedGlossary.find((term) => matchesTerm(term.normalized));
    const phraseMatches = botData.precomputedPhrases
      .filter((phrase) => normalizedInput.includes(phrase.normalized))
      .map((phrase) => ({
        ...phrase,
        intent: botData.normalizedKeywordMap[phrase.normalized],
      }))
      .filter((phrase) => phrase.intent);
    const wordMatches = words
      .map((word) => ({ word, intent: botData.normalizedKeywordMap[word] }))
      .filter((match) => match.intent);
    const scores = new Map();

    phraseMatches.forEach((match) => {
      scores.set(match.intent, (scores.get(match.intent) || 0) + match.normalized.length + 10);
    });
    wordMatches.forEach((match) => {
      scores.set(match.intent, (scores.get(match.intent) || 0) + 1);
    });

    const asksDefinition = /^(co to|czym jest|co oznacza|definicja|jak dziala)\b/.test(normalizedInput);
    if (glossaryMatch && (asksDefinition || normalizedInput === glossaryMatch.normalized)) {
      return botData.glossary[glossaryMatch.original];
    }

    const priceRequested = scores.has("price");
    const rankedServices = [...scores.entries()]
      .filter(([candidate]) => serviceIntents.has(candidate))
      .sort((a, b) => b[1] - a[1]);
    const rankedIntents = [...scores.entries()].sort((a, b) => b[1] - a[1]);
    const intent = priceRequested && rankedServices.length
      ? rankedServices[0][0]
      : rankedIntents[0]?.[0] || (glossaryMatch ? glossaryMatch.original : "unknown");

    return getRandom(botData.responses[intent] || botData.responses.unknown);
  }

  function getRandom(arr) {
    return Array.isArray(arr)
      ? arr[Math.floor(Math.random() * arr.length)]
      : arr;
  }

  // Return API dla external control
  return {
    open: openChat,
    close: closeChat,
    toggle: toggleChat,
  };
}
