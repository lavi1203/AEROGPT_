import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Trash2 } from "lucide-react";



export default function AeroBot() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("aerobot_chat");
    if (saved) return JSON.parse(saved);

    return [
      {
        role: "bot",
        content:
          "Greetings! I am AeroBot, your ISRO SC expert tutor. How can I assist you with your aerospace or engineering preparation today?"
      }
    ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedTopics = [
    "Explain Chandrayaan-3",
    "Tsiolkovsky rocket equation",
    "Derive Escape velocity",
    "What is Hamming distance?",
    "NASA Voyager facts",
    "Dijkstra algorithm complexity"
  ];

  // Save chat in localStorage
  useEffect(() => {
    localStorage.setItem("aerobot_chat", JSON.stringify(messages));
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // BACKEND CALL
    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.slice(1) })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server error");
      }

      setMessages([...newMessages, { role: "bot", content: data.response }]);
    } catch (err) {
      console.error(err);

      setMessages([
        ...newMessages,
        {
          role: "bot",
          content:
            "⚠️ AeroBot backend not reachable.\n\nOffline mode active.\nTry asking about Chandrayaan-3, escape velocity, rocket equation, Voyager, etc."
        }
      ]);
    }

    setLoading(false);
  };

  const clearChat = () => {
    const reset = [
      {
        role: "bot",
        content:
          "Greetings! I am AeroBot, your ISRO SC expert tutor. How can I assist you today?"
      }
    ];

    setMessages(reset);
    localStorage.removeItem("aerobot_chat");
  };

  return (
    <div className="aerobot-page">
      {/* LEFT SIDEBAR */}
      <div className="aerobot-sidebar glass-panel">
        <h3 className="orbitron aerobot-title">
          <MessageSquare size={20} color="var(--accent-amber)" />
          AeroBot
        </h3>

        <p className="aerobot-sub">
          Ask for step-by-step derivations, concepts, or mission facts.
        </p>

        <h4 className="aerobot-suggest-heading">SUGGESTED TOPICS</h4>

        <div className="aerobot-suggest-list">
          {suggestedTopics.map((topic, idx) => (
            <button
              key={idx}
              className="aerobot-topic-btn"
              onClick={() => handleSend(topic)}
            >
              {topic}
            </button>
          ))}
        </div>

        <button className="aerobot-clear-btn" onClick={clearChat}>
          <Trash2 size={16} />
          Clear Chat
        </button>
      </div>

      {/* RIGHT CHAT AREA */}
      <div className="aerobot-chat glass-panel">
        <div className="aerobot-messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`aerobot-msg ${m.role}`}>
              <div className="aerobot-msg-icon">
                {m.role === "bot" ? (
                  <Bot size={18} color="var(--accent-blue)" />
                ) : (
                  <User size={18} />
                )}
              </div>

              <div className="aerobot-msg-text">{m.content}</div>
            </div>
          ))}

          {loading && (
            <div className="aerobot-msg bot">
              <div className="aerobot-msg-icon">
                <Bot size={18} color="var(--accent-blue)" />
              </div>
              <div className="aerobot-msg-text thinking">Thinking...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BAR */}
        <div className="aerobot-inputbar">
          <input
            type="text"
            className="aerobot-input"
            placeholder="Message AeroBot..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            disabled={loading}
          />

          <button
            className="aerobot-send-btn"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}