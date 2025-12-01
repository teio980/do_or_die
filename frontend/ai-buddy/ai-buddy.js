// ----------------- Personality -----------------
let personality = localStorage.getItem("aiPersonality") || "nice";

function setPersonality(type) {
  personality = type;
  localStorage.setItem("aiPersonality", type);
  alert("AI personality has been switched!");
}

function getAvatar() {
  return personality === "nice"
    ? "../../images/ai-buddy-picture/angel.jpg"
    : "../../images/ai-buddy-picture/mowan.jpg";
}

// ----------------- Chat History -----------------
function saveChatToLocal(userMsg, botMsg) {
  let chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");

  if (userMsg) chatHistory.push({ type: "user", content: userMsg });
  if (botMsg) chatHistory.push({ type: "bot", content: botMsg });

  // Limit chat history to last 50 messages
  if (chatHistory.length > 50) chatHistory = chatHistory.slice(-50);

  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

function loadChatFromLocal() {
  const chatBox = document.getElementById("chatContainer");
  const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");

  chatHistory.forEach(msg => {
    const div = document.createElement("div");
    div.className = msg.type === "user" ? "msg user-msg" : "msg bot-msg";

    if (msg.type === "bot") {
      const avatar = document.createElement("img");
      avatar.src = getAvatar();
      avatar.alt = "AI Avatar";
      div.appendChild(avatar);
    }

    const text = document.createElement("div");
    text.textContent = msg.content;
    div.appendChild(text);

    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

// ----------------- Load Chat on Page Load -----------------
window.addEventListener("DOMContentLoaded", loadChatFromLocal);

// ----------------- Send Message -----------------
async function sendMessage() {
  const inputEl = document.getElementById("userInput");
  const chatBox = document.getElementById("chatContainer");
  const message = inputEl.value.trim();
  if (!message) return;

  // show user message
  const userMsg = document.createElement("div");
  userMsg.className = "msg user-msg";
  userMsg.textContent = message;
  chatBox.appendChild(userMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
  inputEl.value = "";

  try {
    // use fetch to send message to backend
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, personality }),
    });
    const data = await res.json();
    const reply = data.reply || "AI is resting 😴";

    // show bot message
    const botMsg = document.createElement("div");
    botMsg.className = "msg bot-msg";

    const avatar = document.createElement("img");
    avatar.src = getAvatar();
    avatar.alt = "AI Avatar";

    const text = document.createElement("div");
    text.textContent = reply;

    botMsg.appendChild(avatar);
    botMsg.appendChild(text);
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    // save to localStorage
    saveChatToLocal(message, reply);

  } catch (err) {
    const botMsg = document.createElement("div");
    botMsg.className = "msg bot-msg";
    botMsg.textContent = "Server error 😭";
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    // save user message only
    saveChatToLocal(message, null);
  }
}

// ----------------- Clear Chat History -----------------
function clearChat() {
  const confirmClear = confirm("Are you sure you want to clear the chat history?");

  if (!confirmClear) return;

  localStorage.removeItem("chatHistory");
  document.getElementById("chatContainer").innerHTML = "";
}


// ----------------- Enter/Shift+Enter -----------------
const inputEl = document.getElementById("userInput");
inputEl.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    if (event.shiftKey) {
      inputEl.value += "\n";
    } else {
      event.preventDefault();
      sendMessage();
    }
  }
});
