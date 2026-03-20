<div align="center">
  <h1>👾 THIRD_PLACE.SYS 👾</h1>
  <p><strong>Your personal spot scout & virtual cafe simulator.</strong></p>
</div>

---

## ☕ What is it?
**Third Place Finder** is a unique web application built for students, remote workers, and deep-focus seekers. It serves a dual purpose:
1. **The Spot Scout (Map):** Guides you to your ideal physical "Third Place" (café, library, or co-working space in Seattle) via a 5-step conversational AI onboarding flow.
2. **The Virtual Cafe (Mixer):** For when you can't leave home. Directly embedded into the app is a full-featured ambient sound mixer to synthesize the perfect background noise for studying.

The entire project is wrapped in a stunning, cozy **Pastel Pixel-Art & Lo-Fi sunset aesthetic**. 

## ✨ Features
- **Conversational Onboarding:** A retro chat interface that discovers your vibe (Noise tolerance, Group Size, Outlets, Caffeine needs). 
- **Virtual Cafe Ambient Mixer:** A side-panel filled with pixel-art sliders controlling looping HTML5 audio for:
  - 🌧️ Rain & Thunder
  - 🗣️ Cafe Chatter
  - 🔥 Crackling Fireplace
  - 🏙️ Street Ambience
- **Lo-Fi Music Player:** Built-in chilling lo-fi jazz beats to act as a bed track over your ambient noise.
- **Leaflet Map Integration:** Plots your targeted locations natively using OpenStreetMap & CartoDB tiles with a custom retro CSS overlay.
- **Ultra Lightweight:** The entire application runs natively in the browser using CDNs. No installation delays!

## ⚙️ How It Works (Under the Hood)
The core logic of the application lives in `app.js` and is broken down into three main systems:

### 1. The Conversational State Machine
The retro chat interface isn't connecting to a real AI backend yet—it's a deterministic state machine!
- A `questions` array holds the rigidly defined 5 onboarding steps (Noise, Group, Time, Outlets, Caffeine).
- `handleUserResponse()` captures your clicked answer, saves it to a global `userPrefs` object, and increments the `currentStep`.
- A dynamic `setTimeout`-based typing indicator function simulates AI "processing" time to make the retro bot feel alive and engaging.

### 2. Map & Mock Backend Integration
When the final chat onboarding question completes (`finishOnboarding()`):
- A fake network latency period simulates querying an external geographic dataset.
- The `renderMapPins()` function uses Leaflet's `L.divIcon` to replace standard map dots with custom HTML pixel-art markers (a chunky 'X') at specific lat/lng coordinates.
- The map mathematically bounds and scales itself (`map.fitBounds`) to ensure all 3 result pins are instantly visible in the viewport.

### 3. The Virtual Cafe Audio Engine
The right-hand panel orchestrates multiple overlapping HTML5 `<audio>` elements simultaneously:
- Each ambient slider (`<input type="range">`) is bound to an event listener initialized in `initVirtualCafe()`.
- When you drag a slider, it immediately maps your range value (`0` to `1`) to that specific track's `.volume` property.
- A smart toggle algorithm ensures tracks are paused when volume is at `0` to save on CPU resources, and dynamically `play()` when dragging up, cleanly dodging rigid browser autoplay-blocking policies.

## 🛠️ Tech Stack
This project was architected for maximum speed and absolute zero setup friction.
- **HTML5 & Vanilla JavaScript** (Zero complex component lifecycles)
- **Tailwind CSS** (Loaded via CDN for rapid atomic styling)
- **Leaflet.js** (For the interactive map and retro custom pins)
- **CSS Animations & Glassmorph/Pixel Tooling** (Scanlines, chunky drop shadows, CRT filters)

## 🚀 How to Run locally
Because the app relies completely on Content Delivery Networks (CDNs) and native web APIs, there is **zero installation required**.
No `npm install`, no backend setup, no Node.js needed.

1. Clone or download this repository.
2. Navigate to the `frontend/` folder.
3. Double click on `index.html` to open it in your default web browser!

*(Note: Audio tracks may require you to interact with the webpage first—like clicking a slider or the play button—due to modern browser Autoplay policies).*

## 🎨 Inspiration & Design
Our design was heavily inspired by the cozy productivity tool *"Virtual Cafe by Flocus"* and the pastel pixel-art charm of retro indie games like *"Sweets Kitty"*. We merged these ideas to create an atmosphere that feels simultaneously nostalgic, warm, and highly functional. 

**Color Palette:**
- 🌌 Deep Midnight Purple (`#1e1e2e`)
- 🌸 Pastel Neon Pink (`#ffb6c1`)
- 🌙 Cozy Sunset Yellow (`#f9e2af`)
- 🍵 Mint Accent (`#a2e4b8`)

---
*Created during the Emerald Forge Hackathon 2025. Seattle, WA.*
