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
    chatbotTrigger.addEventListener("click", () => {
      if (chatbotWindow.classList.contains("active")) {
        closeChat();
      } else {
        openChat();
      }
    });
  }

  if (chatbotClose) chatbotClose.addEventListener("click", closeChat);

  function sendMessage() {
    const msg = chatbotInput.value.trim();
    if (!msg) return;

    addMessage(msg, true);
    chatbotInput.value = "";

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
  }

  function addMessage(text, isUser = false) {
    const div = document.createElement("div");
    div.className = `chat-message ${isUser ? "user" : "bot"}`;
    div.innerHTML = `<div class="message-content">${text}</div>`;
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "chat-message bot";
    div.id = "typing-indicator";
    div.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
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
}
