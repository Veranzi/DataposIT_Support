// Function to handle sending a question
async function askQuestion(question) {
    try {
        const response = await fetch('http://localhost:8000/ask/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: question }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Handle the response data
        console.log('Answer:', data.answer);
        console.log('Source:', data.source);
        console.log('Content:', data.content); // Debugging content

        // Display the answer and source in the UI
        document.getElementById("answer").textContent = data.answer;
        document.getElementById("source").textContent = data.source;
        document.getElementById("content").textContent = data.content || "No content found.";  // Display the content

    } catch (error) {
        console.error('There was an error fetching the data:', error);
    }
}

// Function to enable/disable the send button based on input
function toggleSendButton() {
    const messageInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");

    // Enable the send button only if the message input is not empty
    if (messageInput.value.trim() !== "") {
        sendButton.disabled = false;
    } else {
        sendButton.disabled = true;
    }
}

// Event listener for enabling/disabling send button on input
document.getElementById("user-input").addEventListener("input", toggleSendButton);

// Event listener for the send button click event
document.getElementById("send-button").addEventListener("click", async () => {
    const question = document.getElementById("user-input").value;
    if (question) {
        // Call askQuestion with the message input value
        await askQuestion(question);
        // Optionally, clear the input field after sending the question
        document.getElementById("user-input").value = "";
        toggleSendButton();  // Disable send button after sending
    }
});
