// js/modules/chatbot.js
let botData = null;
const SPLIT_REGEX = /[\s,.;!?]+/;

/**
 * Normalizuje tekst, usuwając polskie znaki diakrytyczne.
 * @param {string} str - Tekst do normalizacji.
 * @returns {string} - Znormalizowany tekst.
 */
const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

async function loadBotData() {
  if (botData) return botData;
  try {
    const response = await fetch("data/chatbot-db.json");
    const data = await response.json();

    // Pre-kompilacja i normalizacja danych dla maksymalnej wydajności
    data.normalizedVulgarWords = data.vulgarWords.map(normalize);

    data.precomputedGlossary = Object.keys(data.glossary).map((term) => ({
      original: term,
      normalized: normalize(term),
    }));

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
  }
}

export function initChat() {
  const chatbotTrigger = document.getElementById("chatbot-trigger");
  const chatbotWindow = document.getElementById("chatbot-window");
  const chatbotClose = document.getElementById("chatbot-close");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSend = document.getElementById("chatbot-send");
  const chatbotMessages = document.getElementById("chatbot-messages");

  async function openChat() {
    chatbotWindow.classList.add("active");
    chatbotTrigger.classList.add("active");

    // Delay focus aby poczekać na animację otwarcia
    setTimeout(() => {
      chatbotInput.focus();
    }, 100);

    if (!botData) {
      await loadBotData();
    }
  }

  function closeChat() {
    chatbotWindow.classList.remove("active");
    chatbotTrigger.classList.remove("active");
  }

  if (chatbotTrigger) {
    let touchStarted = false;

    const toggleChat = () => {
      if (chatbotWindow.classList.contains("active")) {
        closeChat();
      } else {
        openChat();
      }
    };

    // Unified handler - zapobiega double-fire touch+click
    const handleToggle = (e) => {
      e.preventDefault();

      // Na mobile, touchend może wywołać także click - ignoruj click po touch
      if (e.type === 'touchend') {
        touchStarted = true;
        toggleChat();
        setTimeout(() => { touchStarted = false; }, 400);
      } else if (e.type === 'click' && !touchStarted) {
        toggleChat();
      }
    };

    chatbotTrigger.addEventListener("touchend", handleToggle, { passive: false });
    chatbotTrigger.addEventListener("click", handleToggle);
  }

  if (chatbotClose) chatbotClose.addEventListener("click", closeChat);

  // Zamknij chat klawiszem ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && chatbotWindow.classList.contains("active")) {
      closeChat();
    }
  });

  let lastMessageTime = 0;
  const COOLDOWN_MS = 500;

  function sendMessage() {
    const now = Date.now();
    if (now - lastMessageTime < COOLDOWN_MS) return;
    lastMessageTime = now;

    const msg = chatbotInput.value.trim();
    if (!msg) return;

    addMessage(msg, true);
    chatbotInput.value = "";
    chatbotSend.classList.remove("active"); // Usuń aktywny stan po wysłaniu

    if (!botData) {
      addMessage("System initializing...", false);
      loadBotData().then(() => {
        const response = getBotResponse(msg);
        addMessage(response);
      });
    } else {
      showTyping();
      setTimeout(() => {
        removeTyping();
        const response = getBotResponse(msg);
        addMessage(response);
      }, 600 + Math.random() * 500);
    }
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
            // Allow http, mailto, anchor, and relative paths
            if (href && (href.startsWith("http") || href.startsWith("mailto") || href.startsWith("#") || href.startsWith("/"))) {
              el.setAttribute("href", href.trim()); // Trim whitespace
            }
            if (node.classList.contains("chatbot-link")) {
              el.classList.add("chatbot-link");
            }
            
            // UX Fix: Open ONLY external HTTP links in new tab
            if (href && href.startsWith("http")) {
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
    let intent = "unknown";

    // ETAP 1: Wulgaryzmy
    if (
      botData.normalizedVulgarWords.some((word) =>
        normalizedInput.includes(word)
      )
    ) {
      intent = "vulgar";
    }
    // ETAP 2: Dokładne frazy ze słownika (glossary)
    else {
      const glossaryMatch = botData.precomputedGlossary.find((term) =>
        normalizedInput.includes(term.normalized)
      );
      if (glossaryMatch) {
        return botData.glossary[glossaryMatch.original]; // Zwracamy od razu definicję
      }
    }
    // ETAP 3: Dokładne frazy z keywordMap
    if (intent === "unknown") {
      const phraseMatch = botData.precomputedPhrases.find((phrase) =>
        normalizedInput.includes(phrase.normalized)
      );
      if (phraseMatch) {
        intent = botData.keywordMap[phraseMatch.original];
      }
    }
    // ETAP 4: Pojedyncze słowa z keywordMap
    if (intent === "unknown") {
      const words = normalizedInput.split(SPLIT_REGEX);
      for (const word of words) {
        // Bezpośredni, błyskawiczny dostęp O(1) do znormalizowanej mapy
        if (botData.normalizedKeywordMap[word]) {
          intent = botData.normalizedKeywordMap[word];
          break;
        }
      }
    }

    return getRandom(botData.responses[intent]);
  }

  function getRandom(arr) {
    return Array.isArray(arr)
      ? arr[Math.floor(Math.random() * arr.length)]
      : arr;
  }

  // Return API dla external control
  return {
    open: openChat,
    close: closeChat
  };
}
