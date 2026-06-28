
import { useState, useRef } from "react";

export default function VoiceInput({ onTranscript, language = "English" }) {
  const [listening, setListening]   = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError]           = useState("");
  const recognitionRef = useRef(null);

  const langMap = {
    "English":"en-US", "Tamil":"ta-IN", "Hindi":"hi-IN",
    "Telugu":"te-IN", "Malayalam":"ml-IN", "Kannada":"kn-IN",
    "Bengali":"bn-IN", "Marathi":"mr-IN", "Gujarati":"gu-IN",
    "Punjabi":"pa-IN", "Urdu":"ur-IN", "French":"fr-FR",
    "Spanish":"es-ES", "Arabic":"ar-SA", "Chinese":"zh-CN",
    "Japanese":"ja-JP", "German":"de-DE",
  };

  const startListening = () => {
    setError("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice not supported! Use Google Chrome.");
      return;
    }
    const recognition           = new SpeechRecognition();
    recognition.lang            = langMap[language] || "en-US";
    recognition.continuous      = false;
    recognition.interimResults  = true;

    recognition.onstart  = () => setListening(true);
    recognition.onend    = () => setListening(false);
    recognition.onerror  = (e) => {
      setError(`Error: ${e.error}`);
      setListening(false);
    };
    recognition.onresult = (e) => {
      const text = Array.from(e.results)
        .map(r => r[0].transcript).join("");
      setTranscript(text);
      if (e.results[e.results.length - 1].isFinal) {
        onTranscript && onTranscript(text);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <button
          className="btn"
          onClick={listening ? stopListening : startListening}
          style={{
            background: listening ? "var(--danger)" : "rgba(0,212,255,0.1)",
            color:      listening ? "#fff" : "var(--accent)",
            border:     `1px solid ${listening
              ? "var(--danger)"
              : "rgba(0,212,255,0.3)"}`,
            padding:   "10px 18px",
            flexShrink: 0,
          }}>
          {listening ? "⏹ Stop" : "🎤 Speak"}
        </button>

        {transcript && (
          <p style={{ fontSize:13, color:"var(--text-muted)",
            flex:1, fontStyle:"italic" }}>
            "{transcript}"
          </p>
        )}

        {transcript && (
          <button className="btn btn-ghost"
            style={{ fontSize:11, padding:"6px 12px", flexShrink:0 }}
            onClick={() => {
              setTranscript("");
              onTranscript && onTranscript("");
            }}>
            ✕ Clear
          </button>
        )}
      </div>

      {listening && (
        <div style={{ display:"flex", alignItems:"center", gap:8,
          marginTop:8, padding:"8px 12px",
          background:"rgba(255,71,87,0.06)", borderRadius:8,
          border:"1px solid rgba(255,71,87,0.2)" }}>
          <span style={{ width:8, height:8, borderRadius:"50%",
            background:"var(--danger)",
            animation:"pulse 1s infinite",
            display:"inline-block" }}/>
          <p style={{ fontSize:12, color:"var(--danger)" }}>
            Listening in {language}... Speak now!
          </p>
        </div>
      )}

      {error && (
        <div className="error-box" style={{ marginTop:8 }}>
          ⚠️ {error} — Use Google Chrome!
        </div>
      )}
    </div>
  );
}