// Full auth functionality
console.log('Auth.js loading...');

function setupAuth() {
    console.log('Auth.js setup function called');
    
    // DOM Elements for Auth
    const authContainer = document.getElementById("auth-container");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const closeModalBtn = document.querySelector(".close-modal");
    const logoutButton = document.getElementById("logout-button");
    const userDisplayName = document.getElementById("user-display-name");
    const userAvatar = document.getElementById("user-avatar");
    const conversationsList = document.getElementById("conversations-list");
    const loginText = document.getElementById("login-text");
    const signupText = document.getElementById("signup-text");
    const authToggle = document.getElementById("auth-toggle");

    console.log('Auth elements found:', {
        authContainer: !!authContainer,
        loginForm: !!loginForm,
        signupForm: !!signupForm,
        closeModalBtn: !!closeModalBtn
    });

    // Get Firebase services from the global scope
    const auth = window.firebaseAuth;
    const db = window.firebaseDb;
    const {
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signOut,
        onAuthStateChanged,
        updateProfile,
        GoogleAuthProvider,
        signInWithPopup,
    } = window.firebaseAuthFunctions;

    const { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, limit, serverTimestamp, setDoc, getDoc } =
        window.firebaseDbFunctions;

    // Auth state
    let currentUser = null;
    let currentConversationId = null;

    // Toggle between login and signup forms
    if (authToggle) {
        authToggle.addEventListener("click", (e) => {
            e.preventDefault();
            loginForm.classList.toggle("hidden");
            signupForm.classList.toggle("hidden");
            loginText.classList.toggle("hidden");
            signupText.classList.toggle("hidden");
        });
    }

    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            hideAuthModal();
        });
    }

    // Email Sign Up
    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = signupForm["signup-email"].value;
            const password = signupForm["signup-password"].value;
            const name = signupForm["signup-name"].value;

            // Create user
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Update profile
                    return updateProfile(userCredential.user, {
                        displayName: name,
                    }).then(() => userCredential.user);
                })
                .then((user) => {
                    // Add user to Firestore
                    return setDoc(doc(db, "users", user.uid), {
                        uid: user.uid,
                        email: user.email,
                        displayName: name,
                        createdAt: serverTimestamp(),
                    });
                })
                .then(() => {
                    signupForm.reset();
                    showToast("Account created successfully!");
                    hideAuthModal();
                })
                .catch((error) => {
                    showToast(`Error: ${error.message}`, "error");
                });
        });
    }

    // Email Login
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = loginForm["login-email"].value;
            const password = loginForm["login-password"].value;

            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    loginForm.reset();
                    hideAuthModal();
                    showToast("Logged in successfully!");
                })
                .catch((error) => {
                    showToast(`Error: ${error.message}`, "error");
                });
        });
    }

    // Google Sign In
    window.signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                const userRef = doc(db, "users", user.uid);
                getDoc(userRef).then((docSnap) => {
                    if (!docSnap.exists()) {
                        setDoc(userRef, {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            createdAt: serverTimestamp(),
                        });
                    }
                });
                hideAuthModal();
                showToast("Logged in with Google successfully!");
            })
            .catch((error) => {
                showToast(`Error: ${error.message}`, "error");
            });
    };

    // Logout
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            signOut(auth)
                .then(() => {
                    showToast("Logged out successfully!");
                })
                .catch((error) => {
                    showToast(`Error: ${error.message}`, "error");
                });
        });
    }

    // Auth state changes
    onAuthStateChanged(auth, (user) => {
        console.log("Auth state changed, user:", user);
        if (user) {
            // User is signed in
            currentUser = user;
            window.currentUser = user; // Make available globally
            console.log("User logged in:", user.email);
            updateUIForAuthenticatedUser(user);
            loadConversations();
            createNewConversation(); // Start with a new conversation
        } else {
            // User is signed out
            currentUser = null;
            window.currentUser = null;
            console.log("User logged out");
            updateUIForUnauthenticatedUser();
            clearConversations();
        }
    });

    // Update UI for authenticated user
    function updateUIForAuthenticatedUser(user) {
        // Update user info in sidebar
        if (userDisplayName) userDisplayName.textContent = user.displayName || user.email;
        if (userAvatar) {
            if (user.photoURL) {
                userAvatar.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName || "User"}" />`;
            } else {
                userAvatar.textContent = (user.displayName || user.email).charAt(0).toUpperCase();
            }
        }

        // Show authenticated elements
        document.querySelectorAll(".auth-required").forEach((el) => el.classList.remove("hidden"));
        document.querySelectorAll(".auth-hidden").forEach((el) => el.classList.add("hidden"));

        // Show the new chat button
        const newChatBtn = document.querySelector(".new-chat-btn");
        if (newChatBtn) newChatBtn.classList.remove("hidden");

        // Remove empty state if present
        const emptyState = conversationsList.querySelector(".empty-state");
        if (emptyState) emptyState.remove();
    }

    // Update UI for unauthenticated user
    function updateUIForUnauthenticatedUser() {
        // Reset user info in sidebar
        if (userDisplayName) userDisplayName.textContent = "Guest";
        if (userAvatar) userAvatar.textContent = "G";

        // Hide authenticated elements
        document.querySelectorAll(".auth-required").forEach((el) => el.classList.add("hidden"));
        document.querySelectorAll(".auth-hidden").forEach((el) => el.classList.remove("hidden"));

        // Hide the new chat button
        const newChatBtn = document.querySelector(".new-chat-btn");
        if (newChatBtn) newChatBtn.classList.add("hidden");

        // Add empty state if not present
        if (!conversationsList.querySelector(".empty-state")) {
            const emptyState = document.createElement("div");
            emptyState.className = "empty-state";
            emptyState.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <p>No conversations yet</p>
            `;
            conversationsList.appendChild(emptyState);
        }
    }

    // Modal functions
    window.showAuthModal = () => {
        console.log("showAuthModal called");
        if (authContainer) {
            authContainer.classList.remove("hidden");
            console.log("Modal should now be visible");
        } else {
            console.error("authContainer not found!");
        }
    };

    window.hideAuthModal = () => {
        console.log("hideAuthModal called");
        if (authContainer) authContainer.classList.add("hidden");
    };

    // Close modal when clicking outside
    if (authContainer) {
        authContainer.addEventListener("click", (e) => {
            if (e.target === authContainer) {
                window.hideAuthModal();
            }
        });
    }

    // Toast notification
    window.showToast = (message, type = "success") => {
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("show");
        }, 100);

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    };

    // Load user's conversations
    function loadConversations() {
        if (!currentUser || !conversationsList) return;

        // Clear existing conversations
        conversationsList.innerHTML = "";

        // Get user's conversations from Firestore
        const q = query(
            collection(db, "conversations"),
            where("userId", "==", currentUser.uid),
            orderBy("updatedAt", "desc"),
            limit(10),
        );

        getDocs(q)
            .then((snapshot) => {
                if (snapshot.empty) {
                    // No conversations yet
                    const emptyState = document.createElement("div");
                    emptyState.className = "empty-state";
                    emptyState.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <p>No conversations yet</p>
                    `;
                    conversationsList.appendChild(emptyState);
                    return;
                }

                snapshot.forEach((doc) => {
                    const conversation = doc.data();
                    const conversationItem = createConversationItem(doc.id, conversation);
                    conversationsList.appendChild(conversationItem);
                });
            })
            .catch((error) => {
                console.error("Error loading conversations:", error);
            });
    }

    // Create a conversation item for the sidebar
    function createConversationItem(id, conversation) {
        const item = document.createElement("div");
        item.className = "history-item";
        item.dataset.id = id;

        // Get first message or use default title
        const title = conversation.title || "New conversation";

        item.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>${title}</span>
        `;

        // Load conversation when clicked
        item.addEventListener("click", () => {
            loadConversation(id);

            // Update active state
            document.querySelectorAll(".history-item").forEach((el) => el.classList.remove("active"));
            item.classList.add("active");
        });

        return item;
    }

    // Create a new conversation
    window.createNewConversation = () => {
        if (!currentUser) return;

        // Create a new conversation document
        addDoc(collection(db, "conversations"), {
            userId: currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            title: "New conversation",
        })
            .then((docRef) => {
                currentConversationId = docRef.id;
                window.currentConversationId = currentConversationId;

                // Add to sidebar
                loadConversations();

                // Clear messages
                const messagesContainer = document.getElementById("messages");
                if (messagesContainer) messagesContainer.innerHTML = "";

                // Show welcome container
                const welcomeContainer = document.getElementById("welcome-container");
                if (welcomeContainer) welcomeContainer.style.display = "block";
            })
            .catch((error) => {
                console.error("Error creating new conversation:", error);
            });
    };

    // Load a conversation
    function loadConversation(conversationId) {
        if (!currentUser) return;

        currentConversationId = conversationId;
        window.currentConversationId = conversationId;

        // Get messages for this conversation
        const q = query(collection(db, "conversations", conversationId, "messages"), orderBy("timestamp"));

        getDocs(q)
            .then((snapshot) => {
                const messagesContainer = document.getElementById("messages");
                if (!messagesContainer) return;

                // Clear existing messages
                messagesContainer.innerHTML = "";

                // Hide welcome container
                const welcomeContainer = document.getElementById("welcome-container");
                if (welcomeContainer) welcomeContainer.style.display = "none";

                if (snapshot.empty) {
                    // No messages yet
                    return;
                }

                // Add messages to UI
                snapshot.forEach((doc) => {
                    const message = doc.data();
                    window.addMessageToUI(message.content, message.sender, []);
                });
            })
            .catch((error) => {
                console.error("Error loading conversation:", error);
            });
    }

    // Save a message to the current conversation
    window.saveMessage = (content, sender, files = []) => {
        if (!currentUser || !currentConversationId) return;

        // Add message to the conversation
        addDoc(collection(db, "conversations", currentConversationId, "messages"), {
            content: content,
            sender: sender,
            timestamp: serverTimestamp(),
        })
            .then(() => {
                // Update conversation timestamp
                const conversationRef = doc(db, "conversations", currentConversationId);

                // Update with new timestamp and title if it's a user message
                const updateData = {
                    updatedAt: serverTimestamp(),
                };

                // Update title with first user message if it has content
                if (sender === "user" && content) {
                    updateData.title = content.substring(0, 30) + (content.length > 30 ? "..." : "");
                }

                return updateDoc(conversationRef, updateData);
            })
            .catch((error) => {
                console.error("Error saving message:", error);
            });
    };

    // Clear conversations list
    function clearConversations() {
        if (conversationsList) {
            conversationsList.innerHTML = "";
            const emptyState = document.createElement("div");
            emptyState.className = "empty-state";
            emptyState.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <p>No conversations yet</p>
            `;
            conversationsList.appendChild(emptyState);
        }
        currentConversationId = null;
        window.currentConversationId = null;
    }

    // Signal that auth functions are ready
    console.log('Auth functions set up successfully');
    console.log('showAuthModal available:', typeof window.showAuthModal);
    console.log('Auth.js loaded successfully');
}

// Check if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', setupAuth);
} else {
    // DOM is already loaded, run setup immediately
    console.log('DOM already loaded, running auth setup immediately');
    setupAuth();
}
