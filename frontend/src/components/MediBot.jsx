import { useState, useRef, useEffect } from "react";
import VoiceInput from "./VoiceInput";
const BACKEND = "https://mediguard-ai-dp8p.onrender.com";

const QUICK = [
  "What are symptoms of dengue fever?",
  "Is paracetamol safe during pregnancy?",
  "What foods to avoid for diabetics?",
  "How to treat mild fever at home?",
  "What are signs of heart attack?",
];

export default function MediBot({ language }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `👋 Hi! I'm MediBot, your AI medical assistant. Ask me anything about health, medicines, or symptoms. I'll respond in ${language}!` }
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Update greeting when language changes
  useEffect(() => {
    setMessages([{ role: "assistant", content: `👋 Hi! I'm MediBot, your AI medical assistant. Ask me anything about health, medicines, or symptoms. I'll respond in ${language}!` }]);
  }, [language]);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput("");

    const userMsg = { role: "user", content: msg };
    const history = messages.filter(m => m.role !== "assistant" || messages.indexOf(m) > 0);
    setMessages(prev => [...prev, userMsg, { role: "assistant", content: "...", loading: true }]);
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND}/api/chatbot`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: history.map(m => ({ role: m.role, content: m.content })), language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(prev => [...prev.filter(m => !m.loading), { role: "assistant", content: data.reply, responseTime: data.responseTime }]);
    } catch (e) {
      setMessages(prev => [...prev.filter(m => !m.loading), { role: "assistant", content: `⚠️ Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <span style={{ fontSize: 28 }}>🤖</span>
          <div>
            <h2 className="card-title" style={{ marginBottom: 0 }}>MediBot — AI Medical Assistant</h2>
            <p style={{ fontSize: 11, color: "var(--accent2)" }}>● Online · Powered by Groq LLaMA 3.3 · Responds in {language}</p>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            {m.role === "assistant" && <span className="chat-avatar">🤖</span>}
            <div className="chat-content">
              {m.loading ? (
                <div className="chat-typing"><span /><span /><span /></div>
              ) : (
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{m.content}</p>
              )}
              {m.responseTime && <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>⚡ {m.responseTime}ms</p>}
            </div>
            {m.role === "user" && <span className="chat-avatar user-avatar">👤</span>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase", fontFamily: "Syne", fontWeight: 700 }}>Quick Questions</p>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {QUICK.map((q, i) => (
            <button key={i} className="btn btn-ghost" style={{ fontSize: 11, padding: "5px 12px" }} onClick={() => send(q)}>{q}</button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <input
          type="text"
          className="chat-input"
          placeholder={`Ask MediBot anything in ${language}...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          disabled={loading}
        />
        <VoiceInput language={language} onTranscript={(t) => setInput(t)}/>
        <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()} style={{ flexShrink: 0 }}>
          {loading ? <span className="spinner" /> : "Send →"}
        </button>
        <button className="btn btn-ghost" onClick={() => setMessages([{ role: "assistant", content: `👋 Hi! I'm MediBot. Ask me anything about health in ${language}!` }])} style={{ flexShrink: 0 }}>
          🗑
        </button>
      </div>
    </div>
  );
}
