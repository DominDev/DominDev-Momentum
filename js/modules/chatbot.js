// js/modules/chatbot.js
let botData = null;

async function loadBotData() {
  if (botData) return botData;
  try {
    const response = await fetch('data/chatbot-db.json');
    botData = await response.json();
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
    chatbotInput.focus();

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

  function getBotResponse(msg) {
    if (!botData) return "Error loading database.";

    const lower = msg.toLowerCase();

    if (botData.vulgarWords.some(w => lower.includes(w))) {
      return getRandom(botData.responses.vulgar);
    }

    for (const [term, def] of Object.entries(botData.glossary)) {
      if (lower.includes(term)) return def;
    }

    for (const [cat, words] of Object.entries(botData.keywords)) {
      if (words.some(w => lower.includes(w))) {
        return getRandom(botData.responses[cat]);
      }
    }

    return getRandom(botData.responses.unknown);
  }

  function getRandom(arr) {
    return Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : arr;
  }
}
