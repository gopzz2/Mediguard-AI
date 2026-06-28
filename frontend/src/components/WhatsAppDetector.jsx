import { useState } from "react";
import VoiceInput from "./VoiceInput";
const BACKEND = "https://mediguard-ai-dp8p.onrender.com";

const verdictConfig = {
  REAL:           { cls:"real",          icon:"✅", color:"var(--accent2)", label:"Real / Verified Information" },
  FAKE:           { cls:"fake",          icon:"🚫", color:"var(--danger)",  label:"Fake Information" },
  MISLEADING:     { cls:"misleading",    icon:"⚠️", color:"var(--warn)",   label:"Misleading Content" },
  PARTIALLY_TRUE: { cls:"partially_true",icon:"🔶", color:"var(--warn)",   label:"Partially True" },
};
const dangerBadge = { Safe:"badge-green", Moderate:"badge-yellow", Dangerous:"badge-red", "Extremely Dangerous":"badge-red" };

const EXAMPLES = [
  "Drinking hot water with turmeric every morning permanently cures all types of cancer",
  "Onion kept in the room absorbs coronavirus and protects the whole family",
  "Lemon juice mixed with baking soda is 10000x stronger than chemotherapy",
  "5G towers are spreading COVID-19 through radiation",
];

export default function WhatsAppDetector({ language = "English" }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");

  const check = async (msg) => {
    const text = msg || message;
    if (!text.trim()) return;
    if (msg) setMessage(msg);
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch(`${BACKEND}/api/whatsapp-check`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:text}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch(e) { setError(e.message||"Check failed."); }
    setLoading(false);
  };

  const vc = result ? verdictConfig[result.verdict]||verdictConfig.MISLEADING : null;

  return (
    <div>
      <div className="card">
        <h2 className="card-title">📱 WhatsApp Fake Health Forward Detector</h2>
        <p className="card-sub">Paste any health message received on WhatsApp or social media. AI detects if it is REAL or FAKE using WHO & CDC knowledge.</p>

        <div className="input-group">
          <textarea rows={5} placeholder="Paste the WhatsApp health message here..." value={message} onChange={e=>setMessage(e.target.value)} />
          <VoiceInput language={language} onTranscript={(t) => setMessage(t)}/>
          <div>
            <button className="btn btn-primary" onClick={()=>check()} disabled={loading||!message.trim()}>
              {loading ? <><span className="spinner"/> Checking...</> : <><span>🔎</span> Check This Message</>}
            </button>
          </div>
        </div>

        {/* Example messages */}
        <p className="section-label" style={{marginTop:18}}>Try These Common Fake Forwards</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} className="btn-ghost btn" style={{justifyContent:"flex-start",textAlign:"left",fontSize:12,padding:"8px 14px"}} onClick={()=>check(ex)}>
              📩 {ex.length>80?ex.slice(0,80)+"...":ex}
            </button>
          ))}
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}
      </div>

      {result && vc && (
        <div className="result-section">
          <div className="response-time">⚡ Response time: {result.responseTime}ms — Real-Time Detection</div>

          {/* Message preview */}
          <div className="wa-message-preview">
            📩 "{message.length>200?message.slice(0,200)+"...":message}"
          </div>

          {/* Verdict */}
          <div className={`verdict-box ${vc.cls}`}>
            <span className="verdict-icon">{vc.icon}</span>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:6}}>
                <span className="verdict-label" style={{color:vc.color}}>{result.verdict.replace("_"," ")}</span>
                <span className="verdict-sublabel">{vc.label}</span>
                {result.commonInIndia && <span className="badge badge-yellow">⚠️ Common in India</span>}
              </div>
              <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                <span className={`badge ${dangerBadge[result.dangerLevel]||"badge-gray"}`}>Danger: {result.dangerLevel}</span>
              </div>
              <p className="verdict-explain">{result.explanation}</p>
            </div>
          </div>

          {/* Confidence */}
          <div className="card" style={{padding:"14px 18px"}}>
            <p className="section-label" style={{margin:0,marginBottom:8}}>Detection Confidence (XAI)</p>
            <div className="confidence-bar-wrap">
              <div className="confidence-label"><span>AI Confidence</span><span style={{color:"var(--accent)",fontWeight:700}}>{result.confidence}%</span></div>
              <div className="confidence-track"><div className="confidence-fill" style={{width:`${result.confidence}%`}}/></div>
            </div>
          </div>

          {/* What is true */}
          {result.corrections?.length>0 && <>
            <p className="section-label">✅ What is Actually True</p>
            <div className="card" style={{padding:"14px 18px"}}>
              <ul className="info-list check">{result.corrections.map((c,i)=><li key={i}>{c}</li>)}</ul>
            </div>
          </>}

          {/* Sources */}
          {result.sources?.length>0 && <>
            <p className="section-label">Knowledge Sources</p>
            <div className="tag-list" style={{marginBottom:14}}>
              {result.sources.map((s,i)=><span className="source-pill" key={i}>📚 {s}</span>)}
            </div>
          </>}

          {/* Share Advice */}
          {result.shareAdvice && (
            <div className="card" style={{background:"rgba(0,212,255,0.04)",border:"1px solid rgba(0,212,255,0.2)"}}>
              <p style={{fontSize:12,color:"var(--accent)",fontWeight:700,marginBottom:6}}>💬 What to Tell People Who Shared This</p>
              <p style={{fontSize:13,color:"var(--text-muted)",lineHeight:1.7}}>{result.shareAdvice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
