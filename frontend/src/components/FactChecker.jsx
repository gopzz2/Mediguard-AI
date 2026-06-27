import { useState } from "react";
import VoiceInput from "./VoiceInput";

const BACKEND = "http://localhost:5000";

const verdictConfig = {
  TRUE:         { cls:"true",         icon:"✅", color:"var(--accent2)", label:"True Claim" },
  FALSE:        { cls:"false",        icon:"❌", color:"var(--danger)",  label:"False Claim" },
  MISLEADING:   { cls:"misleading",   icon:"⚠️", color:"var(--warn)",   label:"Misleading Information" },
  UNVERIFIABLE: { cls:"unverifiable", icon:"❓", color:"var(--text-muted)", label:"Unverifiable Claim" },
  OUTDATED:     { cls:"outdated",     icon:"🕐", color:"var(--purple)",  label:"Outdated Information" },
};
const riskBadge   = { Safe:"badge-green", Caution:"badge-yellow", Dangerous:"badge-red" };
const evidenceBadge = { Strong:"badge-green", Moderate:"badge-blue", Weak:"badge-yellow", None:"badge-gray" };

export default function FactChecker({ language = "English" }) {
  const [text, setText]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState("");

  const check = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch(`${BACKEND}/api/fact-check`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({text}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch(e) { setError(e.message||"Fact check failed."); }
    setLoading(false);
  };

  const vc = result ? verdictConfig[result.verdict] || verdictConfig.UNVERIFIABLE : null;

  return (
    <div>
      <div className="card">
        <h2 className="card-title">🔍 Medical Fact Checker</h2>
        <p className="card-sub">Enter any medical claim or statement. AI verifies using PubMed, WHO, CDC & MedlinePlus knowledge bases.</p>
        <div className="input-group">
          <textarea rows={4} placeholder="e.g. Drinking lemon water every morning cures all types of cancer..." value={text} onChange={e=>setText(e.target.value)} />
           <VoiceInput language={language} onTranscript={(t) => setText(t)}/>
          <div>
            <button className="btn btn-primary" onClick={check} disabled={loading||!text.trim()}>
              {loading ? <><span className="spinner"/> Verifying...</> : <><span>🔬</span> Fact Check</>}
            </button>
          </div>
        </div>
        {error && <div className="error-box">⚠️ {error}</div>}
      </div>
      

      {result && vc && (
        <div className="result-section">
          {/* Response time */}
          <div className="response-time">⚡ Response time: {result.responseTime}ms — Real-Time Detection</div>

          {/* Verdict */}
          <div className={`verdict-box ${vc.cls}`}>
            <span className="verdict-icon">{vc.icon}</span>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:4}}>
                <span className="verdict-label" style={{color:vc.color}}>{result.verdict}</span>
                <span className="verdict-sublabel">{result.label || vc.label}</span>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
                <span className={`badge ${riskBadge[result.riskLevel]||"badge-gray"}`}>Risk: {result.riskLevel}</span>
                <span className={`badge ${evidenceBadge[result.evidenceStrength]||"badge-gray"}`}>Evidence: {result.evidenceStrength}</span>
              </div>
              <p className="verdict-explain">{result.explanation}</p>
            </div>
          </div>

          {/* Confidence */}
          <div className="card" style={{padding:"16px 20px"}}>
            <p className="section-label" style={{margin:0,marginBottom:8}}>AI Confidence (Explainable AI — XAI)</p>
            <div className="confidence-bar-wrap">
              <div className="confidence-label"><span>Confidence Score</span><span style={{color:"var(--accent)",fontWeight:700}}>{result.confidence}%</span></div>
              <div className="confidence-track"><div className="confidence-fill" style={{width:`${result.confidence}%`}}/></div>
            </div>
          </div>

          {/* Multi-label info */}
          <div className="card" style={{padding:"14px 18px",background:"rgba(0,212,255,0.04)"}}>
            <p style={{fontSize:12,color:"var(--text-muted)",marginBottom:8}}>📊 Multi-Label Classification System</p>
            <div className="tag-list">
              {["TRUE","FALSE","MISLEADING","UNVERIFIABLE","OUTDATED"].map(v=>(
                <span key={v} className={`badge ${result.verdict===v?"badge-blue":"badge-gray"}`} style={{opacity:result.verdict===v?1:0.4}}>{v}</span>
              ))}
            </div>
          </div>

          {/* Corrections */}
          {result.corrections?.length>0 && <>
            <p className="section-label">Corrections & Clarifications</p>
            <div className="card" style={{padding:"16px 20px"}}>
              <ul className="info-list warn">{result.corrections.map((c,i)=><li key={i}>{c}</li>)}</ul>
            </div>
          </>}

          {/* Sources */}
          {result.sources?.length>0 && <>
            <p className="section-label">Evidence Sources (RAG — Multi-Source Retrieval)</p>
            <div className="tag-list" style={{marginBottom:16}}>
              {result.sources.map((s,i)=><span className="source-pill" key={i}>📚 {s}</span>)}
            </div>
          </>}
        </div>
      )}
    </div>
  );
}
