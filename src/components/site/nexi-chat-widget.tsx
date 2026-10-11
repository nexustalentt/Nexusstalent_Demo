import { useState, useRef, useEffect, type FormEvent } from "react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  isHtml?: boolean;
}

const INITIAL_GREETING: ChatMessage = {
  id: "initial-greeting",
  sender: "bot",
  text: "Hi there! 👋 I'm Nexi, the Nexus Talent assistant. Need help with our products, numbers, or services?",
};

export function NexiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll when messages update or typing indicator appears
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Expose global control functions on window for existing buttons & external scripts
  useEffect(() => {
    (window as any).openNexiChat = () => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 150);
    };

    (window as any).closeNexiChat = () => {
      setIsOpen(false);
    };

    (window as any).toggleNexiChat = () => {
      setIsOpen((prev) => {
        const next = !prev;
        if (next) setTimeout(() => inputRef.current?.focus(), 150);
        return next;
      });
    };

    return () => {
      delete (window as any).openNexiChat;
      delete (window as any).closeNexiChat;
      delete (window as any).toggleNexiChat;
    };
  }, []);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query || isTyping) return;

    // 1. Add user message
    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // 2. Wait 1.5 seconds (1500ms) with typing indicator visible
    setTimeout(() => {
      setIsTyping(false);
      const lower = query.toLowerCase();
      let botResponse = "";

      if (lower.includes("product")) {
        botResponse =
          "We specialize in high-impact digital and engineering products! Here is what we're currently building and shipping:<br/><br/>" +
          "🚀 <strong>Zozii Desktop AI Assistant</strong> — Native desktop intelligence powered by Electron 32 and C++/Win32.<br/><br/>" +
          "📸 <strong>Screenshot Saver</strong> — Ultra-fast screenshot capture and cataloging tool for productive teams.";
      } else if (lower.includes("number") || lower.includes("experience")) {
        botResponse =
          "Here is what our track record looks like at Nexus Talent:<br/><br/>" +
          "✨ <strong>15+</strong> Years of Industry Experience<br/>" +
          "👥 <strong>12,000+</strong> Professionals Placed Globally<br/>" +
          "🏢 <strong>500+</strong> Enterprise Clients<br/>" +
          "📈 <strong>1,200+</strong> Successful Projects Delivered";
      } else {
        botResponse =
          "I'm currently in demo mode, but our team at Nexus Talent is ready to help! You can explore our services or reach out directly.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: "bot-" + Date.now(),
          sender: "bot",
          text: botResponse,
          isHtml: true,
        },
      ]);
    }, 1500);
  };

  return (
    <div className="nexi-widget-container" id="nexiWidgetContainer">
      {/* 64px Circular Floating Action Button */}
      <button
        type="button"
        id="nexiToggleBtn"
        className={`nexi-fab ${isOpen ? "nexi-active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close Nexi AI Chat" : "Chat with Nexi AI Assistant"}
      >
        {/* Pulsing Green Online Status Dot */}
        <span className="nexi-fab-status-dot" aria-hidden="true">
          <span className="nexi-fab-status-ping" />
          <span className="nexi-fab-status-core" />
        </span>

        {/* Chat Icon */}
        <svg
          className="nexi-fab-icon nexi-icon-chat"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>

        {/* Close Icon (Visible when open) */}
        <svg
          className="nexi-fab-icon nexi-icon-close"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Dark Theme Chat Window */}
      <div
        id="nexiChatWindow"
        className={`nexi-chat-window ${isOpen ? "nexi-active" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Nexi AI Chat Window"
      >
        {/* Window Header */}
        <div className="nexi-header">
          <div className="nexi-header-info">
            <div className="nexi-avatar" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <rect x="4" y="8" width="16" height="12" rx="4" />
                <line x1="9" y1="13" x2="9" y2="15" />
                <line x1="15" y1="13" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <h3 className="nexi-header-title">Nexi</h3>
              <div className="nexi-header-status">
                <span className="nexi-header-status-dot" />
                <span>Online</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            id="nexiCloseBtn"
            className="nexi-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close Nexi Chat"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages Body */}
        <div className="nexi-messages" id="nexiMessages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`nexi-message ${
                msg.sender === "user" ? "nexi-message-user" : "nexi-message-bot"
              }`}
            >
              {msg.isHtml ? (
                <div
                  className="nexi-bubble"
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
              ) : (
                <div className="nexi-bubble">{msg.text}</div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="nexi-typing-indicator" id="nexiTypingIndicator">
              <span className="nexi-typing-dot" />
              <span className="nexi-typing-dot" />
              <span className="nexi-typing-dot" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form className="nexi-input-area" id="nexiForm" onSubmit={handleSendMessage}>
          <input
            ref={inputRef}
            type="text"
            id="nexiInput"
            className="nexi-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
            required
          />
          <button
            type="submit"
            id="nexiSendBtn"
            className="nexi-send-btn"
            aria-label="Send message"
            disabled={isTyping || !inputValue.trim()}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
