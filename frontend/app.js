// --- State & Constants ---
const questions = [
    {
        id: 'noise',
        text: "INITIATING SPOT_SCOUT V1.0...\nHOW MUCH NOISE CAN YOU TOLERATE?",
        options: ["SILENCE (LIBRARY)", "BACKGROUND CHATTER", "LIVELY/LOUD"]
    },
    {
        id: 'group_size',
        text: "ACKNOWLEDGED. ARE YOU FLYING SOLO OR BRINGING A CREW?",
        options: ["SOLO", "PAIR", "GROUP OF 3-4", "MASSIVE (5+)"]
    },
    {
        id: 'time',
        text: "INPUT TIME OF OPERATION:",
        options: ["MORNING RUSH", "AFTERNOON CHILL", "EVENING BURN", "LATE NIGHT"]
    },
    {
        id: 'outlets',
        text: "BATTERY STATUS CRITICAL?",
        options: ["MUST HAVE OUTLETS", "A FEW HOURS LEFT", "FULLY CHARGED"]
    },
    {
        id: 'caffeine',
        text: "FINAL PARAMETER: CAFFEINE REQUIREMENTS?",
        options: ["SPECIALTY COFFEE", "ANY CAFFEINE", "JUST A TABLE", "FOOD IS PRIORITY"]
    }
];

let currentStep = 0;
let userPrefs = {};
let map = null;
let markers = [];

// --- Mock Data ---
const mockVenues = [
    {
        id: 1,
        name: "ANALOG COFFEE",
        coords: [47.6163, -122.3263],
        noise: "CHATTER",
        outlets: "SOME OUTLETS",
        distance: "12 MIN WALK",
        reason: "LEGENDARY COLD BREW AND AMBIENT VINYL RECORDS PROVIDE PERFECT FOCUS NOISE."
    },
    {
        id: 2,
        name: "SEATTLE PUBLIC LIBRARY",
        coords: [47.6067, -122.3325],
        noise: "SILENCE",
        outlets: "MANY OUTLETS",
        distance: "5 MIN WALK",
        reason: "LEVEL 10 READING ROOM OFFERS STUNNING VIEWS AND GUARANTEED SILENCE."
    },
    {
        id: 3,
        name: "ARMISTICE ROASTER",
        coords: [47.6322, -122.3168],
        noise: "CHATTER",
        outlets: "MANY OUTLETS",
        distance: "18 MIN WALK",
        reason: "SPACIOUS LAYOUT WITH PLENTY OF WALL OUTLETS AND TOP-TIER ESPRESSO."
    }
];

// --- DOM Elements ---
const chatMessages = document.getElementById('chat-messages');
const quickReplies = document.getElementById('quick-replies');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const submitBtn = document.getElementById('submit-btn');
const mapOverlay = document.getElementById('map-overlay');
const resultsContainer = document.getElementById('results-container');
const resultsList = document.getElementById('results-list');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    startChat();
    initVirtualCafe();

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = chatInput.value.trim();
        if (val) handleUserResponse(val);
    });
});

// --- Virtual Cafe / Audio Logic ---
function initVirtualCafe() {
    // Sliders
    const setupAudio = (sliderId, audioId) => {
        const slider = document.getElementById(sliderId);
        const audio = document.getElementById(audioId);
        
        slider.addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value);
            audio.volume = vol;
            if (vol > 0 && audio.paused) {
                audio.play().catch(err => console.log('Audio autoplay blocked', err));
            } else if (vol === 0 && !audio.paused) {
                audio.pause();
            }
        });
    };

    setupAudio('vol-rain', 'audio-rain');
    setupAudio('vol-chatter', 'audio-chatter');
    setupAudio('vol-fire', 'audio-fire');
    setupAudio('vol-street', 'audio-street');

    // Music Player
    const musicAudio = document.getElementById('audio-music');
    const musicVol = document.getElementById('vol-music');
    const playBtn = document.getElementById('play-music-btn');

    musicAudio.volume = 0.5;
    musicVol.addEventListener('input', (e) => musicAudio.volume = parseFloat(e.target.value));

    playBtn.addEventListener('click', () => {
        if (musicAudio.paused) {
            musicAudio.play().then(() => {
                playBtn.innerText = "PAUSE";
                playBtn.classList.replace('bg-retro-btn', 'bg-[#a2e4b8]');
            }).catch(e => console.log('Playback blocked', e));
        } else {
            musicAudio.pause();
            playBtn.innerText = "PLAY";
            playBtn.classList.replace('bg-[#a2e4b8]', 'bg-retro-btn');
        }
    });
}

// --- Map Logic ---
function initMap() {
    map = L.map('map', { zoomControl: false }).setView([47.615, -122.33], 13);
    
    // Using CartoDB Dark Matter to fit the retro/dark map aesthetic better
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 20
    }).addTo(map);
}

function renderMapPins(venues) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const icon = L.divIcon({
        className: 'custom-pin',
        html: `
            <div class="cursor-pointer">
                <div class="w-8 h-8 bg-retro-window text-retro-border border-4 border-retro-border flex items-center justify-center pixel-shadow relative text-lg font-bold">
                    X
                </div>
            </div>
        `,
        iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]
    });

    const bounds = L.latLngBounds();
    venues.forEach((v, index) => {
        const marker = L.marker(v.coords, { icon }).addTo(map);
        const popupContent = `
            <div class="p-2 min-w-[150px] font-sans">
                <div class="border-b-4 border-retro-border pb-1 mb-2">
                    <h3 class="font-bold text-retro-border text-lg tracking-wider">${v.name}</h3>
                </div>
                <p class="text-sm font-bold bg-retro-border text-retro-window px-1 inline-block">${v.distance}</p>
            </div>
        `;
        marker.bindPopup(popupContent, { closeButton: false });
        markers.push(marker);
        bounds.extend(v.coords);
    });

    if (venues.length > 0) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
}

// --- Chat Logic ---
function startChat() {
    setTimeout(() => askQuestion(0), 1000);
}

function askQuestion(index) {
    if (index >= questions.length) {
        finishOnboarding();
        return;
    }
    const q = questions[index];
    showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator();
        addMessage(q.text, 'ai');
        renderOptions(q.options);
    }, 800);
}

function handleUserResponse(text) {
    quickReplies.innerHTML = '';
    chatInput.value = '';
    chatInput.disabled = true;
    submitBtn.disabled = true;
    
    addMessage(text, 'user');
    userPrefs[questions[currentStep].id] = text;
    currentStep++;
    askQuestion(currentStep);
}

function finishOnboarding() {
    showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator();
        addMessage("PROCESSING DATA...", 'ai');
        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            addMessage("MATCHES FOUND. DOWNLOADING MAP DATA...", 'ai');
            
            mapOverlay.classList.add('opacity-0', 'pointer-events-none');
            resultsContainer.classList.remove('hidden');
            
            renderMapPins(mockVenues);
            renderResultCards(mockVenues);
            
            chatInput.disabled = false;
            submitBtn.disabled = false;
            chatInput.placeholder = "COMMAND READY...";
        }, 1500);
    }, 1000);
}

// --- UI Helpers ---
function addMessage(text, sender) {
    const wrapper = document.createElement('div');
    wrapper.className = `flex w-full mb-4 message-bubble ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
    
    if (sender === 'ai') {
        wrapper.innerHTML = `
            <div class="flex items-start max-w-[85%]">
                <div class="bubble-ai p-3 inline-block">
                     <p class="text-xl leading-relaxed whitespace-pre-line">${text}</p>
                </div>
            </div>
        `;
    } else {
        wrapper.innerHTML = `
            <div class="flex items-start max-w-[85%]">
                <div class="bubble-user p-3 inline-block">
                    <p class="text-xl">${text}</p>
                </div>
            </div>
        `;
    }
    chatMessages.appendChild(wrapper);
    scrollToBottom();
}

function showTypingIndicator() {
    const wrapper = document.createElement('div');
    wrapper.id = 'typing-indicator';
    wrapper.className = `flex w-full mb-4 justify-start message-bubble`;
    wrapper.innerHTML = `
        <div class="flex items-start max-w-[80%]">
            <div class="bubble-ai p-3 px-4 flex items-center gap-1.5 inline-block">
                 <span class="text-xl animate-pulse">_</span>
            </div>
        </div>
    `;
    chatMessages.appendChild(wrapper);
    scrollToBottom();
}

function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}

function renderOptions(options) {
    quickReplies.innerHTML = '';
    options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = "px-3 py-2 bg-retro-bg hover:bg-white border-4 border-retro-border text-retro-text hover:text-retro-border text-lg font-bold transition-none pixel-btn-shadow retro-active uppercase";
        btn.innerText = opt;
        btn.onclick = () => handleUserResponse(opt);
        quickReplies.appendChild(btn);
    });
}

function renderResultCards(venues) {
    resultsList.innerHTML = '';
    venues.forEach((v, index) => {
        const card = document.createElement('div');
        card.className = "p-3 result-card cursor-pointer retro-active";
        card.tabIndex = 0;
        card.onclick = () => {
            map.flyTo(v.coords, 16, { animate: true, duration: 1 });
            markers[index].openPopup();
        };

        card.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-retro-accent border-4 border-retro-border text-retro-border flex items-center justify-center font-bold text-lg flex-shrink-0">
                    ${index + 1}
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-2 border-b-4 border-retro-border pb-1">
                        <h3 class="font-bold text-retro-border text-xl">${v.name}</h3>
                        <span class="text-xs font-bold text-retro-text bg-retro-border px-1 uppercase">${v.distance}</span>
                    </div>
                    <div class="flex flex-wrap gap-2 mb-2">
                        <span class="px-1 bg-retro-window border-2 border-retro-border text-retro-border text-xs font-bold">${v.noise}</span>
                        <span class="px-1 bg-[#a2e4b8] border-2 border-retro-border text-retro-border text-xs font-bold">${v.outlets}</span>
                    </div>
                    <div class="bg-white p-2 border-4 border-retro-border">
                        <p class="text-sm text-retro-border font-bold uppercase">${v.reason}</p>
                    </div>
                </div>
            </div>
        `;
        resultsList.appendChild(card);
    });
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
