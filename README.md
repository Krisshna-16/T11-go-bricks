# GO-BRICS AI Customer Support Chatbot — Shungite Shield

A fully functional, live, and testable AI chatbot web application for the **Shungite Shield** EMF Protection brand. Built for **GO-BRICS Business Lab (Task T11)** using React, TypeScript, Tailwind CSS, and the Anthropic Claude API.

This chatbot handles general customer queries, product FAQs, and B2B/wholesale lead capture.

---

## 🎨 Branded Design System & Aesthetics
- **Color Scheme**: Deep Black (`#0A0A0A`), bright neon green (`#00FF41`) user bubbles and status cues, and dark charcoal (`#1A1A1A`) bot bubbles and information cards.
- **Typography**: Inter (Body & UI text) imported directly from Google Fonts.
- **Tone & Layout**: Cyberpunk/matrix-influenced premium design with custom pulsing animations, hexagon initial avatars, and modern glassmorphic buttons. Fully responsive and optimized for mobile screens (e.g. 375px phone views).

---

## 📱 App Structure & Views

The application is structured into two clean views that can be toggled via the header:

### VIEW 1 — CHAT INTERFACE (Default View)
- **Header Bar**:
  - Left: Animated pulsing green indicator showing "Online" + "Shungite Shield Support".
  - Center: Core guide prompt + GO-BRICS task subtitle.
  - Right: "Setup Guide" toggle button.
- **Scrollable Chat Container**:
  - User messages: Right-aligned, green background (`#00FF41`), white text.
  - Bot messages: Left-aligned, dark charcoal background (`#1A1A1A`), white text.
  - Bot Avatar: Clean inline SVG hexagon containing "SS" initials in green.
  - Automatic scrolling: Automatically snaps/scrolls smoothly to the bottom of the conversation when new messages are added or when the bot is thinking.
  - Timestamp: Displayed on each message in a clean format (e.g., "10:14 PM").
- **Quick Reply Chips**:
  - Below the welcome message, 6 quick replies are shown on initial load:
    - `"What is Shungite?"` | `"Product Prices"` | `"Shipping Info"` | `"EMF Protection"` | `"B2B Enquiry"` | `"Water Purification"`
  - Tapping any chip immediately triggers the message delivery.
  - Chips automatically disappear once the user sends their first custom message.
- **Thinking Indicator**:
  - Displays three animated bouncing green dots inside a bot bubble while the Claude API is processing a response.
- **Input Bar**:
  - Clean text input with a green send arrow button.
  - Disabled during loading to prevent race conditions.
  - Pressing `Enter` or clicking the send button submits the text.

### VIEW 2 — SETUP GUIDE
- **Section 1 — What This Chatbot Does**: High-level system overview along with a checklist of key chatbot features.
- **Section 2 — Trained Response Topics**: A grid showing the 10 topic areas that the system prompt teaches the bot to handle (Product Info, Pricing, Shipping, EMF Protection, Water Purification, Grounding, Molecular Science, Sourcing/Authenticity, B2B wholesale Pipeline, Support/Returns).
- **Section 3 — How to Use**: A numbered, step-by-step walkthrough detailing how a user interacts with the system.
- **Section 4 — Technical Details**: A tabular specification chart showing parameters such as model (`claude-sonnet-4-20250514`), average latency, history context memory, task metadata, and grading status.

---

## 🔬 Claude API Integration & System Prompt

Every conversation message invokes the Anthropic Messages API:
- **Endpoint**: `https://api.anthropic.com/v1/messages`
- **Model**: `claude-sonnet-4-20250514`
- **Max Tokens**: 1000
- **Passthrough**: Utilizes the built-in Antigravity API key proxy (no manual API key entry required).
- **Context Preservation**: Sends the full cumulative conversation history map `[{ role: "user" | "assistant", content: "..." }]` on every call.
- **System Prompt**: Trains the AI model on:
  - Product offerings (Starter Pack at ₹799, Home Protection Set at ₹1,899, Wellness Studio Pack at ₹4,499).
  - Shipping timelines and terms (Free shipping above ₹999, ships from Mumbai warehouse, 3-7 business days delivery).
  - Shungite science (Petrovsky Type II Shungite, Zazhoginskoye deposit, fullerenes, carbon content minimum 30%, electrical conductivity).
  - B2B lead capture criteria (collecting company name, contact person, phone, city, and business type).
  - Response guidelines (keeping replies between 3-5 sentences, warm tone, ending with a follow-up query or Call-to-Action).
- **Error Handling**: Gracefully presents *"Sorry, I'm having trouble connecting. Please try again."* in the chat container if a network error occurs.

---

## 🛠️ Technology Stack
- **Framework**: React 19 (TypeScript template)
- **Dev Tooling**: Vite
- **Styling**: Tailwind CSS
- **API Access**: Fetch-based interaction with Anthropic endpoint

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```
The compiled static build files will be generated in the `./dist` folder.
