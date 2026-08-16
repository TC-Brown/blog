// --- THE BROWN FAMILY | CHAT ROOM ENGINE ---

// --- PREDEFINED FAMILY MEMBERS (Matching blog.css classes) ---
const FAMILY_MEMBERS = [
    { name: "T.C. Brown", badge: "tbrown" },
    { name: "A. Brown", badge: "abrown" },
    { name: "Z. Brown", badge: "zbrown" },
    { name: "B. Brown", badge: "bbrown" },
    { name: "J.A. Brown", badge: "jabrown" },
    { name: "C.A. Brown", badge: "cabrown" },
    { name: "D.A. Brown", badge: "dabrown" }
];

// Emojis for the quick tray
const EMOJIS = ["😀", "😂", "🤣", "😍", "👍", "🙌", "🎉", "🔥", "💻", "⌨️", "🎮", "🍕", "🍰", "🌱", "🍅", "🌸", "💬", "🚀", "❤️", "✨", "🌟"];

// --- INITIAL CHAT LOGS SEED DATA ---
const INITIAL_CHAT_LOGS = {
    general: [
        { sender: "T.C. Brown", badge: "tbrown", text: "Hey everyone! Welcome to the new Chat Room for our blog site.", time: "10:12 AM" },
        { sender: "Z. Brown", badge: "zbrown", text: "This looks awesome! Love the glassmorphic design. Matches the blog homepage perfectly.", time: "10:14 AM" },
        { sender: "A. Brown", badge: "abrown", text: "Agreed. Nice to have a central room to chat about our projects.", time: "10:15 AM" }
    ],
    "tech-talk": [
        { sender: "J.A. Brown", badge: "jabrown", text: "Has anyone checked out the responsive fixes on the Mini Brands layout?", time: "Yesterday, 4:32 PM" },
        { sender: "T.C. Brown", badge: "tbrown", text: "Yeah, I audited it last week. Standardized the CSS grids so they stack beautifully on mobile viewport sizes.", time: "Yesterday, 4:35 PM" },
        { sender: "D.A. Brown", badge: "dabrown", text: "Awesome! Flexbox and CSS custom properties are a lifesaver.", time: "Yesterday, 5:02 PM" }
    ],
    "family-news": [
        { sender: "B. Brown", badge: "bbrown", text: "Hi all! I will be updating the recipes database in the Cookbook page soon.", time: "9:20 AM" },
        { sender: "C.A. Brown", badge: "cabrown", text: "Can we please add the Sourdough Toast recipe? It's my absolute favorite!", time: "9:25 AM" },
        { sender: "B. Brown", badge: "bbrown", text: "Definitely. I'll include the steps and ingredient lists for that one.", time: "9:30 AM" }
    ],
    "gaming-guild": [
        { sender: "Z. Brown", badge: "zbrown", text: "Is anyone up for testing the PokeDex GBA screen game later today?", time: "10:01 AM" },
        { sender: "J.A. Brown", badge: "jabrown", text: "Sure, let's run through the tab layouts and make sure the screen sizing doesn't shift when switching types.", time: "10:05 AM" }
    ]
};

// Simulated messages bank for bots
const BOT_PHRASES = {
    general: [
        "Did anyone check out the new Welcome Letter layout on the blog page?",
        "We should plan a family dinner night soon! Maybe next weekend?",
        "Hope everyone has a wonderful week! Let me know if we need to adjust navbar paths.",
        "Just read the Hebrews 12:1 scripture on the index page again. Very inspiring."
    ],
    "tech-talk": [
        "Just pushed a fix for the mobile drawer slide-out animation. Works smooth now.",
        "Currently experimenting with the Web Audio API synthesis. You can generate retro arcade noises with pure JS code!",
        "Is anyone still using Sass, or is vanilla CSS with variables and selectors enough now?",
        "Looking into adding some quick utility classes to the blog styling directory."
    ],
    "family-news": [
        "Check out the plant logs in The Garden page when you get a chance! Tomatoes are doing great.",
        "I just made the Tahini Chickpea Bowl from our cookbook templates. Highly recommended!",
        "Should we take some new profile photos for our individual pages in the templates folder?",
        "We need to write down the agenda for our next garden planting schedule."
    ],
    "gaming-guild": [
        "Just beat my high score in our custom 3D FPS template arcade!",
        "Hollow Knight Silksong is the ultimate myth at this point... any year now, right?",
        "What are your thoughts on the Select modal sound effects in the Pokedex screen?",
        "Has anyone completed the retro Gen 3 Pokedex entry checklist yet?"
    ]
};

// --- CHAT SYSTEM STATE ---
let state = {
    currentUser: { name: "GuestUser", badge: "guest-user" },
    activeChannel: "general",
    messages: {},
    onlineUsers: []
};

// Audio Context for sound synthesis (lazy-loaded on user action)
let audioCtx = null;

// --- INITIALIZE APPLICATION ---
function init() {
    // 1. Load User Profile
    loadUser();

    // 2. Load Messages (localStorage or seed default logs)
    loadMessages();

    // 3. Establish simulated online users
    updateOnlineMembers();

    // 4. Bind DOM and Interactive Event Listeners
    bindEvents();

    // 5. Render Active Channel Feed and Setup Timers
    switchChannel(state.activeChannel);
    setupBotSimulation();
}

// --- USER PROFILE SAVING/LOADING ---
function loadUser() {
    const savedUser = localStorage.getItem("chat_current_user");
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
    } else {
        // Generate random username digits
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        state.currentUser = { name: `Guest_${randomNum}`, badge: "guest-user" };
        saveUser();
    }
}

function saveUser() {
    localStorage.setItem("chat_current_user", JSON.stringify(state.currentUser));
}

// --- MESSAGES STORAGE MANAGEMENT ---
function loadMessages() {
    const savedMsg = localStorage.getItem("chat_logs");
    if (savedMsg) {
        state.messages = JSON.parse(savedMsg);
    } else {
        state.messages = INITIAL_CHAT_LOGS;
        saveMessages();
    }
}

function saveMessages() {
    localStorage.setItem("chat_logs", JSON.stringify(state.messages));
}

// --- ACTIVE CHANNELS & MEMBERS MANAGEMENT ---
function switchChannel(channelId) {
    state.activeChannel = channelId;
    
    // Update active channel buttons
    document.querySelectorAll(".channel-btn").forEach(btn => {
        if (btn.getAttribute("data-channel") === channelId) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Update Headings
    const channelMeta = {
        general: { title: "# general", desc: "Open discussions for anything related to the blog, coding, or projects." },
        "tech-talk": { title: "# tech-talk", desc: "Share programming ideas, CSS tricks, code layout snippets, and development notes." },
        "family-news": { title: "# family-news", desc: "Updates about events, cookbooks, planting seeds, and family announcements." },
        "gaming-guild": { title: "# gaming-guild", desc: "Lounge to chat about video games, coordinate testing, and discuss arcade designs." }
    };

    const meta = channelMeta[channelId] || { title: `# ${channelId}`, desc: "" };
    document.getElementById("chat-room-title").textContent = meta.title;
    document.getElementById("chat-room-desc").textContent = meta.desc;

    // Render feed
    renderMessages();
    updateOnlineMembers();
}

function updateOnlineMembers() {
    const listEl = document.getElementById("members-list");
    listEl.innerHTML = "";

    // Establish who is online. Always include current user and 3-4 other random family members.
    // Shuffle members and take a subset
    const shuffled = [...FAMILY_MEMBERS].sort(() => 0.5 - Math.random());
    const onlineCount = 3 + Math.floor(Math.random() * 3); // 3 to 5 online
    const activeBots = shuffled.slice(0, onlineCount).filter(member => member.badge !== state.currentUser.badge);

    state.onlineUsers = [state.currentUser, ...activeBots];

    // Render list
    state.onlineUsers.forEach(user => {
        const item = document.createElement("div");
        item.className = "member-item";

        // Generate initials
        const initials = user.name.split(" ").map(w => w[0]).join("");

        item.innerHTML = `
            <div class="member-avatar ${user.badge}">${initials}</div>
            <span class="member-name" style="font-weight: 500;">${user.name}</span>
            <div class="member-status"></div>
        `;

        listEl.appendChild(item);
    });
}

// --- RENDER MESSAGE FEED ---
function renderMessages() {
    const container = document.getElementById("chat-messages");
    container.innerHTML = "";

    const activeList = state.messages[state.activeChannel] || [];

    if (activeList.length === 0) {
        container.innerHTML = `<div class="system-notification">Welcome to the start of #${state.activeChannel}!</div>`;
        return;
    }

    activeList.forEach(msg => {
        const isSelf = msg.badge === state.currentUser.badge && msg.sender === state.currentUser.name;
        const card = document.createElement("div");
        card.className = `chat-message ${isSelf ? 'self' : ''}`;

        const initials = msg.sender.split(" ").map(w => w[0]).join("");

        card.innerHTML = `
            <div class="message-avatar ${msg.badge}">${initials}</div>
            <div class="message-bubble-wrapper">
                <div class="message-info">
                    <span class="message-sender">${msg.sender}</span>
                    <span class="message-time">${msg.time}</span>
                </div>
                <div class="message-bubble">${escapeHTML(msg.text)}</div>
            </div>
        `;

        container.appendChild(card);
    });

    // Auto scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// --- SUBMIT MESSAGE ---
function postMessage(text, isSelf = true, botSender = null) {
    if (!text.trim()) return;

    // Build message package
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let msgPackage;
    if (isSelf) {
        msgPackage = {
            sender: state.currentUser.name,
            badge: state.currentUser.badge,
            text: text,
            time: timeStr
        };
    } else {
        msgPackage = {
            sender: botSender.name,
            badge: botSender.badge,
            text: text,
            time: timeStr
        };
    }

    if (!state.messages[state.activeChannel]) {
        state.messages[state.activeChannel] = [];
    }

    state.messages[state.activeChannel].push(msgPackage);
    saveMessages();
    renderMessages();

    // Sound alert when message is received (from bots/others)
    if (!isSelf) {
        playPopSound();
    }
}

// --- WEB AUDIO API: SYNTHESIZED SOUND NOTIFICATION ---
function playPopSound() {
    try {
        // Initialize AudioContext on first user interaction
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = "sine";
        
        // Classic pop/bubble sound: fast frequency ramp up
        const now = audioCtx.currentTime;
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now);
        osc.stop(now + 0.12);
    } catch (e) {
        console.warn("Web Audio API sound synthesis failed or was blocked by browser autoplay policy.", e);
    }
}

// --- CHAT MEMBER RESPONSE SIMULATOR ---
function setupBotSimulation() {
    // 1. Reply to user messages
    // We can monitor when user submits a message, then trigger a simulated family member reply after a short delay.
    
    // 2. Periodic spontaneous chat messages (to simulate active channel)
    setInterval(() => {
        // 30% chance to trigger a random message from online users who are NOT the current user
        if (Math.random() > 0.7 && state.onlineUsers.length > 1) {
            triggerSimulatedBotMessage();
        }
    }, 40000); // Check every 40s
}

function triggerSimulatedBotMessage() {
    // Filter out current user from online list to get potential bot senders
    const bots = state.onlineUsers.filter(u => u.badge !== state.currentUser.badge);
    if (bots.length === 0) return;

    // Pick a random bot
    const bot = bots[Math.floor(Math.random() * bots.length)];

    // Get channel specific bot comments
    const phrases = BOT_PHRASES[state.activeChannel] || ["Nice layout!", "Looks clean.", "Cool."];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    // Post comment
    postMessage(phrase, false, bot);
}

// --- EVENT BINDINGS ---
function bindEvents() {
    // 1. Mobile Menu navbar drawer toggler
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            navMenu.classList.toggle("open");
            navToggle.classList.toggle("open");
        });
        
        document.addEventListener("click", (e) => {
            if (navMenu.classList.contains("open") && !navMenu.contains(e.target) && e.target !== navToggle && !navToggle.contains(e.target)) {
                navMenu.classList.remove("open");
                navToggle.classList.remove("open");
            }
        });
    }

    // 2. Channel navigation clicks
    document.querySelectorAll(".channel-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const channel = btn.getAttribute("data-channel");
            switchChannel(channel);
            
            // Close channel sidebar if open on mobile
            document.getElementById("chat-sidebar").classList.remove("open");
        });
    });

    // 3. Mobile channels sidebar toggle button
    const sidebarToggle = document.getElementById("chat-sidebar-toggle");
    const sidebar = document.getElementById("chat-sidebar");

    sidebarToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        sidebar.classList.toggle("open");
    });

    // Close sidebar drawer if clicking outside of it
    document.addEventListener("click", (e) => {
        if (sidebar.classList.contains("open") && !sidebar.contains(e.target) && e.target !== sidebarToggle && !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove("open");
        }
    });

    // 4. Message submit event
    const form = document.getElementById("chat-form");
    const input = document.getElementById("message-input");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value;
        if (text.trim().length > 0) {
            postMessage(text, true);
            input.value = "";
            input.style.height = "24px"; // reset text height

            // Initialize sound context on first user send action
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Trigger bot reply simulation after 2 to 4 seconds
            setTimeout(() => {
                triggerSimulatedBotMessage();
            }, 2000 + Math.random() * 2000);
        }
    });

    // Handle shift+enter to insert line breaks and autogrow input area
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            form.requestSubmit();
        }
    });

    input.addEventListener("input", () => {
        input.style.height = "auto";
        input.style.height = (input.scrollHeight - 6) + "px";
    });

    // 5. Emoji Picker Popover toggles
    const emojiBtn = document.getElementById("btn-emoji-trigger");
    const emojiTray = document.getElementById("emoji-tray");

    emojiBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        emojiTray.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
        if (emojiTray.classList.contains("active") && !emojiTray.contains(e.target) && e.target !== emojiBtn) {
            emojiTray.classList.remove("active");
        }
    });

    // Load emojis grid
    const emojiGrid = document.getElementById("emoji-grid");
    emojiGrid.innerHTML = "";
    EMOJIS.forEach(emoji => {
        const item = document.createElement("div");
        item.className = "emoji-item";
        item.textContent = emoji;
        item.addEventListener("click", () => {
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const text = input.value;
            input.value = text.substring(0, start) + emoji + text.substring(end);
            input.focus();
            
            // Put cursor right after emoji
            input.selectionStart = input.selectionEnd = start + emoji.length;
            emojiTray.classList.remove("active");
        });
        emojiGrid.appendChild(item);
    });

    // 6. Settings Modal trigger
    const settingsBtn = document.getElementById("btn-settings-trigger");
    const settingsModal = document.getElementById("settings-modal");
    const closeBtn = document.getElementById("btn-close-settings");
    const cancelBtn = document.getElementById("btn-cancel-settings");
    const saveBtn = document.getElementById("btn-save-settings");

    const openSettings = () => {
        document.getElementById("settings-username").value = state.currentUser.name;
        
        // Highlight active badge selector
        document.querySelectorAll(".badge-option").forEach(opt => {
            if (opt.getAttribute("data-badge") === state.currentUser.badge) {
                opt.classList.add("selected");
            } else {
                opt.classList.remove("selected");
            }
        });

        settingsModal.classList.add("active");
    };

    const closeSettings = () => {
        settingsModal.classList.remove("active");
    };

    settingsBtn.addEventListener("click", openSettings);
    closeBtn.addEventListener("click", closeSettings);
    cancelBtn.addEventListener("click", closeSettings);

    // Badge selection highlights
    document.querySelectorAll(".badge-option").forEach(opt => {
        opt.addEventListener("click", () => {
            document.querySelectorAll(".badge-option").forEach(o => o.classList.remove("selected"));
            opt.classList.add("selected");
        });
    });

    saveBtn.addEventListener("click", () => {
        const name = document.getElementById("settings-username").value.trim();
        const selectedBadge = document.querySelector(".badge-option.selected").getAttribute("data-badge");

        if (name) {
            state.currentUser.name = name;
            state.currentUser.badge = selectedBadge;
            saveUser();
            
            // Refresh displays
            renderCurrentUserWidget();
            updateOnlineMembers();
            renderMessages();
            closeSettings();
        }
    });
}

function renderCurrentUserWidget() {
    const avatarEl = document.getElementById("widget-avatar");
    const nameEl = document.getElementById("widget-username");

    // Initials
    const initials = state.currentUser.name.split(" ").map(w => w[0]).join("");
    avatarEl.textContent = initials;
    nameEl.textContent = state.currentUser.name;

    // Reset badge classes on avatar widget
    avatarEl.className = "widget-user-avatar";
    avatarEl.classList.add(state.currentUser.badge);
}

// Helper to escape HTML tags
function escapeHTML(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Start application
window.addEventListener("DOMContentLoaded", () => {
    init();
    renderCurrentUserWidget();
});
