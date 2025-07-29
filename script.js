console.log('Script.js loading...');

function setupScript() {
    console.log('Script.js setup function called');
    
    // DOM Elements
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const messagesContainer = document.getElementById("messages");
    const welcomeContainer = document.getElementById("welcome-container");
    const fileInput = document.getElementById("file-input");
    const filePreview = document.getElementById("file-preview");
    const examplePrompts = document.querySelectorAll(".example-prompt");
    const loginButton = document.getElementById("login-button");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebar = document.querySelector(".sidebar");

    // State
    let uploadedFiles = [];
    let conversationStarted = false;

    // Theme Toggle
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            body.classList.toggle("dark-theme");
            body.classList.toggle("light-theme");

            // Save theme preference
            const isDarkTheme = body.classList.contains("dark-theme");
            localStorage.setItem("darkTheme", isDarkTheme);
        });
    }

    // Load saved theme
    if (localStorage.getItem("darkTheme") === "true") {
        body.classList.add("dark-theme");
        body.classList.remove("light-theme");
    }

    // Mobile sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
        if (
            window.innerWidth <= 768 &&
            sidebar.classList.contains("open") &&
            !sidebar.contains(e.target) &&
            e.target !== sidebarToggle
        ) {
            sidebar.classList.remove("open");
        }
    });

    // Setup login button
    function setupLoginButton() {
        console.log('Setting up login button...');
        if (loginButton) {
            console.log('Setting up login button click handler');
            loginButton.addEventListener("click", () => {
                console.log("Login button clicked!");
                if (window.showAuthModal) {
                    console.log("showAuthModal available, calling it");
                    window.showAuthModal();
                } else {
                    console.error("showAuthModal not available");
                    alert("Login modal not ready yet");
                }
            });
        } else {
            console.error("Login button not found!");
        }
    }

    // Wait for auth functions to be available
    function waitForAuthFunctions() {
        if (window.showAuthModal) {
            console.log('Auth functions available, setting up login button');
            setupLoginButton();
        } else {
            console.log('Auth functions not ready yet, waiting...');
            setTimeout(waitForAuthFunctions, 100);
        }
    }

    // Start waiting for auth functions
    waitForAuthFunctions();

    // Auto-resize textarea
    if (userInput) {
        userInput.addEventListener("input", function () {
            sendButton.disabled = this.value.trim() === "" && uploadedFiles.length === 0;
            this.style.height = "auto";
            this.style.height = Math.min(this.scrollHeight, 200) + "px";
        });
    }

    // File Upload
    if (fileInput) {
        fileInput.addEventListener("change", handleFileUpload);
    }

    function handleFileUpload(e) {
        const files = e.target.files;
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                uploadedFiles.push(file);
                createFilePreview(file);
            }
            sendButton.disabled = false;
        }
    }

    function createFilePreview(file) {
        const fileItem = document.createElement("div");
        fileItem.className = "file-item";
        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-file";
        removeBtn.innerHTML = "×";
        removeBtn.setAttribute("aria-label", "Remove file");
        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = uploadedFiles.indexOf(file);
            if (idx > -1) uploadedFiles.splice(idx, 1);
            fileItem.remove();
            if (userInput.value.trim() === "" && uploadedFiles.length === 0) {
                sendButton.disabled = true;
            }
        });

        if (file.type.startsWith("image/")) {
            const img = document.createElement("img");
            img.alt = file.name;
            const reader = new FileReader();
            reader.onload = (e) => (img.src = e.target.result);
            reader.readAsDataURL(file);
            fileItem.appendChild(img);
        } else {
            const fileIcon = document.createElement("div");
            fileIcon.className = "file-icon";
            fileIcon.textContent = file.name.split(".").pop().toUpperCase();
            fileItem.appendChild(fileIcon);
        }

        fileItem.appendChild(removeBtn);
        filePreview.appendChild(fileItem);
    }

    // Example Prompts
    examplePrompts.forEach((prompt) => {
        prompt.addEventListener("click", function () {
            userInput.value = this.textContent.trim();
            userInput.style.height = "auto";
            userInput.style.height = Math.min(userInput.scrollHeight, 200) + "px";
            sendButton.disabled = false;
            userInput.focus();
        });
    });

    // Send Message
    if (sendButton) {
        sendButton.addEventListener("click", sendMessage);
    }
    if (userInput) {
        userInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!sendButton.disabled) sendMessage();
            }
        });
    }

    // Send Message function
    async function sendMessage() {
        const message = userInput.value.trim();
        if (message === "" && uploadedFiles.length === 0) return;

        console.log("sendMessage called, currentUser:", window.currentUser);
        
        if (!window.currentUser) {
            console.log("No user logged in, showing auth modal");
            if (window.showToast) {
                window.showToast("Please log in to send messages", "error");
            } else {
                alert("Please log in to send messages");
            }
            if (window.showAuthModal) {
                window.showAuthModal();
            } else {
                console.log("showAuthModal not available yet");
            }
            return;
        }

        console.log("User is logged in, proceeding with message");

        if (!conversationStarted) {
            welcomeContainer.style.display = "none";
            conversationStarted = true;
        }

        // Show user message
        window.addMessageToUI(message, "user", uploadedFiles);
        window.saveMessage(message, "user");

        // Reset input & files
        userInput.value = "";
        userInput.style.height = "auto";
        uploadedFiles = [];
        filePreview.innerHTML = "";
        sendButton.disabled = true;

        // Show thinking indicator
        showThinking();

        try {
            const response = await fetch("http://127.0.0.1:8000/ask/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: message })
            });
            const data = await response.json();

            // Remove thinking indicator
            const thinking = document.getElementById("thinking-indicator");
            if (thinking) thinking.remove();
            
            // Display AI response with source information
            let aiResponse = data.answer || data.content || "No answer returned.";
            
            // Add source information to the response
            if (data.source) {
                aiResponse = `**Source:** ${data.source}\n\n**Answer:**\n${aiResponse}`;
            }
            
            window.addMessageToUI(aiResponse, "ai");
            window.saveMessage(aiResponse, "ai");
        } catch (err) {
            console.error("API error:", err);
            const thinking = document.getElementById("thinking-indicator");
            if (thinking) thinking.remove();
            const fallback = "Sorry, something went wrong.";
            window.addMessageToUI(fallback, "ai");
            window.saveMessage(fallback, "ai");
        }
    }

    // UI Helpers
    window.addMessageToUI = (content, sender, files = []) => {
        const messageContainer = document.createElement("div");
        messageContainer.className = `message-container ${sender}`;
        const avatar = document.createElement("div");
        avatar.className = `message-avatar ${sender}`;
        avatar.textContent =
            sender === "user"
                ? window.currentUser
                    ? window.currentUser.displayName?.charAt(0).toUpperCase() || "U"
                    : "U"
                : "AI";
        const messageContent = document.createElement("div");
        messageContent.className = "message-content";
        const messageText = document.createElement("div");
        messageText.className = "message-text";
        if (content) messageText.innerHTML = `<p>${formatMessage(content)}</p>`;
        if (files.length > 0) {
            const fileContainer = document.createElement("div");
            fileContainer.className = "message-files";
            files.forEach((file) => {
                if (file.type.startsWith("image/")) {
                    const img = document.createElement("img");
                    img.style.maxWidth = "100%";
                    img.style.maxHeight = "300px";
                    img.style.borderRadius = "8px";
                    img.style.marginTop = "12px";
                    img.alt = file.name || "Uploaded image";
                    const reader = new FileReader();
                    reader.onload = (e) => (img.src = e.target.result);
                    reader.readAsDataURL(file);
                    fileContainer.appendChild(img);
                } else {
                    const fileInfo = document.createElement("div");
                    fileInfo.style.padding = "12px";
                    fileInfo.style.backgroundColor = "var(--bg-tertiary)";
                    fileInfo.style.borderRadius = "8px";
                    fileInfo.style.marginTop = "12px";
                    fileInfo.style.display = "flex";
                    fileInfo.style.alignItems = "center";
                    fileInfo.style.gap = "8px";
                    const fileIcon = document.createElement("div");
                    fileIcon.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                             viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>`;
                    const fileName = document.createElement("span");
                    fileName.textContent = file.name;
                    fileInfo.appendChild(fileIcon);
                    fileInfo.appendChild(fileName);
                    fileContainer.appendChild(fileInfo);
                }
            });
            messageText.appendChild(fileContainer);
        }
        messageContent.appendChild(messageText);
        messageContainer.appendChild(avatar);
        messageContainer.appendChild(messageContent);
        messagesContainer.appendChild(messageContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    function showThinking() {
        const messageContainer = document.createElement("div");
        messageContainer.className = "message-container ai thinking-container";
        messageContainer.id = "thinking-indicator";
        const avatar = document.createElement("div");
        avatar.className = "message-avatar ai";
        avatar.textContent = "AI";
        const messageContent = document.createElement("div");
        messageContent.className = "message-content";
        const thinking = document.createElement("div");
        thinking.className = "thinking";
        thinking.innerHTML = `
            Thinking
            <div class="thinking-dots">
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
            </div>`;
        messageContent.appendChild(thinking);
        messageContainer.appendChild(avatar);
        messageContainer.appendChild(messageContent);
        messagesContainer.appendChild(messageContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function formatMessage(message) {
        // Special handling for document-style content
        if (message.includes("Support Ticket Subject") || message.includes("Functional Responsible")) {
            return formatDocumentContent(message);
        }
        
        // Handle Source and Answer formatting
        if (message.includes("**Source:**") && message.includes("**Answer:**")) {
            return formatSourceAndAnswer(message);
        }
        
        // Handle Gemini responses (when source is already determined)
        if (message.includes("Microsoft Business Central") || message.includes("Business Central") || message.includes("comprehensive")) {
            return formatGeminiContent(message);
        }
        
        // Regular formatting for other content
        message = message.replace(
            /```(\w+)?\n([\s\S]*?)```/g,
            (m, lang, code) => `<pre><code>${escapeHTML(code)}</code></pre>`
        );
        message = message.replace(/`([^`]+)`/g, "<code>$1</code>");
        message = message.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");
        message = message.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");
        message = message.replace(/\n/g, "<br>");
        return message;
    }

    function formatGeminiContent(content) {
        // Format Gemini content with proper markdown
        let formattedContent = content;
        
        // Convert markdown to HTML
        formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        formattedContent = formattedContent.replace(/\*(.*?)\*/g, "<em>$1</em>");
        formattedContent = formattedContent.replace(/\n\n/g, "</p><p>");
        formattedContent = formattedContent.replace(/\n/g, "<br>");
        
        return `<div class="gemini-content"><p>${formattedContent}</p></div>`;
    }

    function formatSourceAndAnswer(message) {
        // Split the message into Source and Answer parts
        const sourceMatch = message.match(/\*\*Source:\*\* (.*?)(?=\n\n\*\*Answer:\*\*)/);
        const answerMatch = message.match(/\*\*Answer:\*\*\n(.*)/);
        
        if (sourceMatch && answerMatch) {
            const source = sourceMatch[1].trim();
            const answer = answerMatch[1].trim();
            
            let formattedMessage = '<div class="source-answer-container">';
            
            // Format Source
            formattedMessage += `<div class="source-section">
                <span class="source-label">Source:</span>
                <span class="source-value">${escapeHTML(source)}</span>
            </div>`;
            
            // Format Answer
            formattedMessage += `<div class="answer-section">
                <span class="answer-label">Answer:</span>
                <div class="answer-content">${formatAnswerContent(answer)}</div>
            </div>`;
            
            formattedMessage += '</div>';
            return formattedMessage;
        }
        
        // Fallback to regular formatting
        return message.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>").replace(/\n/g, "<br>");
    }

    function formatAnswerContent(answer) {
        // Check if it's document content and format accordingly
        if (answer.includes("Support Ticket Subject") || answer.includes("Functional Responsible")) {
            return formatDocumentContent(answer);
        }
        
        // Regular text formatting
        return escapeHTML(answer).replace(/\n/g, "<br>");
    }

    function formatDocumentContent(content) {
        // Split content into lines
        const lines = content.split('\n');
        let formattedContent = '<div class="document-content">';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Check if this line looks like a label (ends with colon or is in caps)
            const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
            const isLabel = line.endsWith(':') || 
                           (line === line.toUpperCase() && line.length > 3) ||
                           line.includes('Responsible') ||
                           line.includes('Subject') ||
                           line.includes('Request') ||
                           line.includes('Date');
            
            if (isLabel && nextLine && !nextLine.endsWith(':') && nextLine !== nextLine.toUpperCase()) {
                // This is a label-value pair
                formattedContent += `<div class="document-field">
                    <span class="document-label">${escapeHTML(line)}</span>
                    <span class="document-value">${escapeHTML(nextLine)}</span>
                </div>`;
                i++; // Skip the next line since we've used it
            } else if (line.startsWith('Instructions') || line.startsWith('Problem') || line.startsWith('Licensing') || line.startsWith('Permissions')) {
                // Section headers
                formattedContent += `<div class="document-section">
                    <h4>${escapeHTML(line)}</h4>
                </div>`;
            } else if (line.length > 50) {
                // Long text (instructions, descriptions)
                formattedContent += `<div class="document-text">
                    <p>${escapeHTML(line)}</p>
                </div>`;
            } else {
                // Regular line
                formattedContent += `<div class="document-line">
                    ${escapeHTML(line)}
                </div>`;
            }
        }
        
        formattedContent += '</div>';
        return formattedContent;
    }

    function escapeHTML(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // New Chat Button
    const newChatBtn = document.querySelector(".new-chat-btn");
    if (newChatBtn) {
        newChatBtn.addEventListener("click", () => {
            if (!window.currentUser) {
                window.showToast("Please log in to start a new chat", "error");
                window.showAuthModal();
                return;
            }
            window.createNewConversation();
        });
    }

    console.log('Script.js setup complete');
}

// Check if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', setupScript);
} else {
    // DOM is already loaded, run setup immediately
    console.log('DOM already loaded, running script setup immediately');
    setupScript();
}

console.log('Script.js loaded successfully');
