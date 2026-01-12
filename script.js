import * as webllm from "https://esm.run/@mlc-ai/web-llm";

// 1. CONFIGURATION
const modelId = "Llama-3.2-1B-Instruct-q4f32_1-MLC"; // 1B is faster/lighter than 3B
const appConfig = { 
    useIndexedDBCache: true // Caches the model so 2nd visit is INSTANT
};

// !!! YOUR SECRET SAUCE !!!
// This is the System Prompt that makes the bot "addictive" or unique.
const systemPrompt = `
You are a witty, slightly sarcastic, and extremely engaging AI companion. 
You don't give boring robotic answers. You challenge the user, ask follow-up questions, 
and keep the conversation flowing. You are brutally honest but charismatic.
`;

let engine;

async function main() {
    const initProgressCallback = (report) => {
        const pBar = document.getElementById("p-bar");
        const pFill = document.getElementById("p-fill");
        const status = document.getElementById("status");
        
        pBar.style.display = "block";
        status.innerText = report.text;
        
        // Update progress bar visuals
        if (report.progress) {
            pFill.style.width = (report.progress * 100) + "%";
        }
    };

    const chat = new webllm.ChatModule();
    engine = chat;

    // Load the model
    await chat.reload(modelId, appConfig, initProgressCallback);

    // Enable UI
    document.getElementById("status").innerText = "Ready! (Model cached for next time)";
    document.getElementById("p-bar").style.display = "none";
    document.getElementById("user-input").disabled = false;
    document.getElementById("send-btn").disabled = false;
    document.getElementById("user-input").focus();
}

// Handle sending messages
async function onSend() {
    const input = document.getElementById("user-input");
    const text = input.value.trim();
    if (!text) return;

    // UI Updates
    const chatContainer = document.getElementById("chat-container");
    chatContainer.innerHTML += `<div class="message user-msg">${text}</div>`;
    input.value = "";
    
    // Create placeholder for bot response
    const botMsgDiv = document.createElement("div");
    botMsgDiv.className = "message bot-msg";
    botMsgDiv.innerText = "...";
    chatContainer.appendChild(botMsgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Generate Response
    const response = await engine.generate(text, {
        systemPrompt: systemPrompt,
        streamCallback: (chunk) => {
            botMsgDiv.innerText = chunk; // Live typing effect
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    });
}

// Event Listeners
document.getElementById("send-btn").addEventListener("click", onSend);
document.getElementById("user-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") onSend();
});

// Start
main();