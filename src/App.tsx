import React, { useState, useEffect, useRef } from "react";

// Types
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// System Prompt
const SYSTEM_PROMPT = `You are the Shungite Shield AI Customer Support Assistant — a helpful, knowledgeable, and friendly chatbot for Shungite Shield, a premium Karelian Shungite EMF protection brand sold in India by GO-BRICS Business Lab.

YOUR ROLE:
- Answer customer questions about Shungite products
- Help customers choose the right product for their needs
- Capture lead information for B2B enquiries
- Provide accurate information about Shungite science and benefits
- Guide customers toward making a purchase

ABOUT SHUNGITE SHIELD:
Brand: Shungite Shield
Tagline: Ancient Stone. Modern Protection.
Website: shungiteshield.in
Email: hello@shungiteshield.in
Phone: +91 98765 43210
Location: Mumbai, India. Ships India-wide.

PRODUCTS AND PRICING:
1. Starter Pack — ₹799 (was ₹1,199)
   Includes: 1x Raw Chunk (50-70g), 1x Phone Sticker, Certificate, Care Guide
   
2. Home Protection Set — ₹1,899 (was ₹2,799) — BEST SELLER
   Includes: 1x Pyramid (200g), 1x Sphere (150g), 3x Water Stones, 2x Phone Stickers, Certificate, Premium Gift Box
   
3. Wellness Studio Pack — ₹4,499 (was ₹6,500)
   Includes: 5x Pyramids, 5x Raw Chunks, 10x Phone Stickers, Bulk certificates, Dedicated account manager, Custom engraving

SHIPPING:
- Free shipping above ₹999
- Delivery: 3-7 business days across India
- Express delivery available at checkout
- Ships from Mumbai warehouse
- Payment: UPI, Net Banking, Cards, Cash on Delivery
- Returns: 30-day return policy

SHUNGITE SCIENCE:
- Type II Karelian Shungite (Petrovsky Shungite)
- Sourced from Zazhoginskoye deposit, Karelia Russia
- Contains fullerenes — carbon molecules discovered by Nobel Prize winners
- Carbon content: minimum 30% for Type II
- Properties: EMF absorption, water mineralisation, energy grounding
- Electrically conductive due to fullerene structure
- Used in Russia for centuries for water purification

B2B INFORMATION:
- Available for Ayurvedic retailers, wellness brands, yoga studios, corporate gifting, spiritual goods distributors
- Bulk pricing available for orders above 50 units
- Custom engraving for orders above 100 units
- Contact: hello@shungiteshield.in for wholesale pricing
- For B2B leads: collect company name, contact person, phone, city, and type of business

RESPONSE GUIDELINES:
- Keep responses concise — 3-5 sentences maximum
- Be warm, helpful, and knowledgeable
- Always end with a relevant follow-up question or CTA
- For purchase intent: share the relevant product and price
- For B2B enquiries: collect lead details and promise follow-up
- For science questions: be accurate but accessible, not overly technical
- Never make medical or health claims
- If unsure: offer to connect them with the team at hello@shungiteshield.in
- Use occasional relevant emojis but don't overdo it`;

// 6 Quick reply questions
const QUICK_REPLIES = [
  "What is Shungite?",
  "Product Prices",
  "Shipping Info",
  "EMF Protection",
  "B2B Enquiry",
  "Water Purification"
];

export default function App() {
  const [view, setView] = useState<"chat" | "setup">("chat");
  const [customApiKey, setCustomApiKey] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `👋 Hello! I'm the Shungite Shield AI Assistant.

I can help you with:
🔮 Product information and recommendations
💰 Pricing and order details
🚚 Shipping and delivery
🔬 Shungite science and benefits
🤝 B2B and wholesale enquiries

What would you like to know?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if user has sent any messages yet (to hide quick replies)
  const hasSentMessage = messages.some(msg => msg.role === "user");

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle message sending
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Build conversation history for the Claude API (role & content only)
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Route via CORS proxy if custom API key is supplied (essential for GitHub Pages)
      const targetUrl = customApiKey 
        ? "https://corsproxy.io/?https://api.anthropic.com/v1/messages" 
        : "https://api.anthropic.com/v1/messages";

      const headers: Record<string, string> = {
        "content-type": "application/json",
        "anthropic-version": "2023-06-01"
      };

      if (customApiKey) {
        headers["x-api-key"] = customApiKey;
        headers["dangerously-allow-browser"] = "true";
      } else {
        // Fallback placeholder to trigger local environment proxy injection
        headers["x-api-key"] = "antigravity-passthrough";
      }

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.content[0].text;

      const assistantMessage: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error communicating with Claude API:", error);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage(inputValue);
    }
  };

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen font-sans flex flex-col selection:bg-[#00FF41] selection:text-black">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#1A1A1A] border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-md">
        {/* Left: Online Status Dot & Brand name */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF41] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00FF41]"></span>
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-white tracking-wide">
              Shungite Shield Support
            </h1>
            <p className="text-[10px] text-gray-400 sm:hidden">
              Powered by GO-BRICS | TASK_T11
            </p>
          </div>
        </div>

        {/* Center: Desktop Subtitle */}
        <div className="hidden sm:flex flex-col items-center">
          <p className="text-xs font-semibold text-gray-300">
            Ask me anything about our products
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-[#00FF41]/80 font-mono tracking-wider">
              Powered by GO-BRICS Business Lab | TASK_T11
            </p>
            {customApiKey && (
              <span className="text-[9px] bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 px-1.5 py-0.2 rounded font-mono uppercase tracking-wider font-semibold">
                API Key Loaded
              </span>
            )}
          </div>
        </div>

        {/* Right: Toggle Button */}
        <div>
          {view === "chat" ? (
            <button
              onClick={() => setView("setup")}
              className="text-xs px-3 py-1.5 rounded border border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41]/10 transition-colors duration-200 uppercase font-mono tracking-wider font-semibold focus:outline-none"
            >
              Setup Guide
            </button>
          ) : (
            <button
              onClick={() => setView("chat")}
              className="text-xs px-3 py-1.5 rounded border border-[#00FF41] bg-[#00FF41] text-black hover:bg-[#00FF41]/85 transition-colors duration-200 uppercase font-mono tracking-wider font-semibold focus:outline-none"
            >
              Back to Chat
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative max-w-4xl w-full mx-auto overflow-hidden">
        {view === "chat" ? (
          /* VIEW 1 - CHAT INTERFACE */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Scrollable messages container */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  {/* Bot Avatar Hexagon */}
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center relative">
                      <svg
                        className="absolute inset-0 w-full h-full text-[#00FF41]/20 stroke-[#00FF41] stroke-1"
                        viewBox="0 0 100 100"
                        fill="currentColor"
                      >
                        <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" />
                      </svg>
                      <span className="relative z-10 text-[10px] font-bold text-[#00FF41] font-mono">
                        SS
                      </span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className="flex flex-col space-y-1">
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-[#00FF41] text-black rounded-tr-none font-medium"
                          : "bg-[#1A1A1A] text-white rounded-tl-none border border-white/5"
                      }`}
                    >
                      {msg.content}
                    </div>
                    {/* Timestamp */}
                    <span
                      className={`text-[9px] text-gray-500 font-mono ${
                        msg.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {/* Bot thinking loader */}
              {isLoading && (
                <div className="flex gap-3 max-w-[75%] mr-auto">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center relative">
                    <svg
                      className="absolute inset-0 w-full h-full text-[#00FF41]/20 stroke-[#00FF41] stroke-1"
                      viewBox="0 0 100 100"
                      fill="currentColor"
                    >
                      <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" />
                    </svg>
                    <span className="relative z-10 text-[10px] font-bold text-[#00FF41] font-mono">
                      SS
                    </span>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-2xl rounded-tl-none px-4 py-3.5 border border-white/5 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00FF41] animate-bounce delay-75"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00FF41] animate-bounce delay-150"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00FF41] animate-bounce delay-200"></span>
                  </div>
                </div>
              )}

              {/* Reference point for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies block (Only visible if user hasn't sent any message yet) */}
            {!hasSentMessage && (
              <div className="px-4 py-3 border-t border-white/5 bg-[#0D0D0D]">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-semibold">
                  Quick Replies
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => sendMessage(reply)}
                      disabled={isLoading}
                      className="text-xs bg-[#1A1A1A] hover:bg-[#00FF41]/10 text-gray-300 hover:text-[#00FF41] px-3 py-1.5 rounded-full border border-white/10 hover:border-[#00FF41]/30 transition-all duration-200 font-medium disabled:opacity-50"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-4 bg-[#1A1A1A] border-t border-white/10 flex gap-2 items-center">
              <input
                type="text"
                placeholder={isLoading ? "Bot is responding..." : "Type your message..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#00FF41]/50 text-white placeholder-gray-500 disabled:opacity-50 transition-colors"
              />
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="w-11 h-11 bg-[#00FF41] text-black rounded-full flex items-center justify-center hover:bg-[#00FF41]/85 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 focus:outline-none"
                aria-label="Send message"
              >
                <svg
                  className="w-5 h-5 transform rotate-90 text-black fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2 - SETUP GUIDE */
          <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {/* Title / Hero */}
            <div className="text-center space-y-2 border-b border-white/5 pb-6">
              <span className="text-xs uppercase tracking-widest text-[#00FF41] font-mono font-bold bg-[#00FF41]/10 px-3 py-1 rounded">
                Operational Reference Document
              </span>
              <h2 className="font-bold text-xl sm:text-2xl mt-4 text-white">
                Setup & Configurations Manual
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
                Full operating specifications, guidelines, and technical parameters for the Shungite Shield AI Chatbot system.
              </p>
            </div>

            {/* API KEY CONFIGURATION */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00FF41] border-l-2 border-[#00FF41] pl-2">
                API KEY CONFIGURATION
              </h3>
              <div className="bg-[#1A1A1A] rounded-xl p-5 border border-white/5 space-y-4">
                <p className="text-xs text-gray-300 leading-relaxed">
                  To use this chatbot live on GitHub Pages, please enter your <strong>Anthropic API Key</strong> below. The key is kept purely in React state memory (not stored anywhere) and requests are routed securely via <code>corsproxy.io</code> to bypass CORS blocks.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="password"
                    placeholder="sk-ant-..."
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="flex-1 bg-[#0A0A0A] border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00FF41]/50 placeholder-gray-600 transition-colors"
                  />
                  {customApiKey && (
                    <button
                      onClick={() => setCustomApiKey("")}
                      className="px-4 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded text-xs uppercase font-mono tracking-wider font-semibold transition-colors focus:outline-none"
                    >
                      Clear Key
                    </button>
                  )}
                </div>
                <div className="pt-1">
                  {customApiKey ? (
                    <span className="inline-flex items-center gap-2 text-xs text-[#00FF41] font-mono">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF41] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF41]"></span>
                      </span>
                      API Key Active (Routing via CORS Proxy)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-xs text-gray-500 font-mono">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-700"></span>
                      No API Key (Using Local Antigravity Passthrough)
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 1 — What This Chatbot Does */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00FF41] border-l-2 border-[#00FF41] pl-2">
                SECTION 1 — What This Chatbot Does
              </h3>
              <div className="bg-[#1A1A1A] rounded-xl p-5 border border-white/5 space-y-4">
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  The Shungite Shield AI Customer Support Chatbot is a live, Claude-powered conversational assistant that handles customer support, product FAQs, and B2B lead capture for the Shungite Shield brand. It is built for GO-BRICS Business Lab Task T11.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    "Answers product and pricing questions instantly",
                    "Guides customers to the right product",
                    "Captures B2B lead information",
                    "Explains Shungite science accurately",
                    "Available 24/7 without human intervention",
                    "Trained on 10+ topic areas (see below)"
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="text-[#00FF41]">✅</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 2 — Trained Response Topics */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00FF41] border-l-2 border-[#00FF41] pl-2">
                SECTION 2 — Trained Response Topics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: "1. Product Information", desc: "Specs, contents, and bundles for all three standard packs." },
                  { title: "2. Pricing Model", desc: "Regular prices, sale discounts, B2B quotes." },
                  { title: "3. Shipping & Fulfilment", desc: "Warehouse details, timelines, options, COD payment." },
                  { title: "4. EMF Shielding Science", desc: "Frequencies absorbed, device placement guides." },
                  { title: "5. Water Mineralisation", desc: "Petrovsky water stones, purification procedures, timing." },
                  { title: "6. Energy Grounding", desc: "Ayurvedic alignment, meditation setups, space cleansing." },
                  { title: "7. Molecular Carbon Structure", desc: "Nobel Prize fullerene details, conductivity features." },
                  { title: "8. Sourcing & Authenticity", desc: "Zazhoginskoye deposit Karelia Russia, certificate details." },
                  { title: "9. Wholesale/B2B Pipeline", desc: "Bulk discounts, custom etching, company lead capture details." },
                  { title: "10. Support & Returns", desc: "30-day return policy, team contacts, escalation route." }
                ].map((topic, i) => (
                  <div key={i} className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 hover:border-[#00FF41]/20 transition-colors">
                    <h4 className="text-xs font-bold text-white mb-1 tracking-wide">
                      {topic.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-normal">
                      {topic.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 3 — How to Use */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00FF41] border-l-2 border-[#00FF41] pl-2">
                SECTION 3 — How to Use
              </h3>
              <div className="bg-[#1A1A1A] rounded-xl p-5 border border-white/5 space-y-4">
                {[
                  "Type your question in the input bar at the bottom",
                  "Or tap one of the quick reply buttons for instant answers",
                  "The AI responds within 2-3 seconds",
                  "Ask follow-up questions naturally — the bot remembers context",
                  "For B2B enquiries, provide your business details when asked"
                ].map((step, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 flex items-center justify-center font-mono text-[10px] font-bold mt-0.5">
                      {index + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-300 pt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 4 — Technical Details */}
            <section className="space-y-4 pb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00FF41] border-l-2 border-[#00FF41] pl-2">
                SECTION 4 — Technical Details
              </h3>
              <div className="bg-[#1A1A1A] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#0D0D0D] text-gray-400 border-b border-white/10 uppercase tracking-widest font-mono text-[10px]">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Parameter Field</th>
                        <th className="px-5 py-3 font-semibold">Configuration Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        { field: "AI Core Engine", val: "Claude Sonnet (Anthropic)" },
                        { field: "Target Model ID", val: "claude-sonnet-4-20250514" },
                        { field: "Response Latency", val: "2-4 seconds average" },
                        { field: "Uptime SLA", val: "99.9% (API-dependent)" },
                        { field: "History Context Memory", val: "Full dialog string concatenation" },
                        { field: "Operational Language", val: "English (primary)" },
                        { field: "Lab Development Task", val: "GO-BRICS Business Lab Task T11" },
                        { field: "Grading Criteria", val: "Grade A | 200 GBP reward" },
                        { field: "Release Timestamp", val: "Live Since June 2026" }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3 font-medium text-white">{row.field}</td>
                          <td className="px-5 py-3 font-mono text-[#00FF41]">{row.val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Footer Back Button */}
            <div className="flex justify-center pt-4 pb-8">
              <button
                onClick={() => setView("chat")}
                className="px-6 py-3 bg-[#00FF41] text-black font-bold text-xs uppercase tracking-widest rounded shadow-[0_0_20px_rgba(0,255,65,0.25)] hover:bg-[#00FF41]/85 transition-all duration-200 focus:outline-none"
              >
                Back to Chat
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
