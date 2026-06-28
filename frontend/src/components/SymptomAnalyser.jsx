import { useState } from "react";
import VoiceInput from "./VoiceInput";
const BACKEND = "https://mediguard-ai-dp8p.onrender.com";

const urgencyConfig = {
  Emergency: { cls:"emergency", icon:"🚨", sub:"CALL 108 IMMEDIATELY!" },
  High:      { cls:"high",      icon:"⚠️", sub:"Consult a doctor today" },
  Moderate:  { cls:"moderate",  icon:"🔵", sub:"Schedule a doctor visit soon" },
  Low:       { cls:"low",       icon:"✅", sub:"Monitor symptoms, rest recommended" },
};
const likelihoodBadge = { High:"badge-red", Moderate:"badge-yellow", Low:"badge-green" };

export default function SymptomAnalyser({ language = "English" }) {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState("");

  const analyse = async () => {
    if (!symptoms.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch(`${BACKEND}/api/symptom-analyse`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ symptoms, language })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch(e) { setError(e.message || "Analysis failed."); }
    setLoading(false);
  };
  <VoiceInput
  language={language}
  onTranscript={(text) => setSymptoms(text)}
  placeholder="Speak your symptoms..."
/>

  const urgency = result ? urgencyConfig[result.urgencyLevel] || urgencyConfig.Low : null;

  return (
    <div>
      <div className="card">
        <h2 className="card-title">🩺 Symptom Analyser</h2>
        <p className="card-sub">Enter symptoms separated by + or commas. AI analyses using WHO & CDC medical knowledge.</p>
        <textarea
          rows={3}
          placeholder="e.g. fever + headache + body pain  OR  chest pain + sweating + breathing difficulty"
          value={symptoms}
          onChange={e => setSymptoms(e.target.value)}
          onKeyDown={e => e.key==="Enter" && !e.shiftKey && (e.preventDefault(), analyse())}
        />
        <div style={{display:"flex", gap:"10px", flexWrap:"wrap"}}>
          <button className="btn btn-primary" onClick={analyse} disabled={loading || !symptoms.trim()}>
            {loading ? <><span className="spinner"/> Analysing...</> : <><span>🔬</span> Analyse Symptoms</>}
          </button>
          <a className="map-btn" href="https://www.google.com/maps/search/hospitals+near+me" target="_blank" rel="noreferrer">
            <span>📍</span> Find Nearby Hospitals
          </a>
        </div>
        {error && <div className="error-box">⚠️ {error}</div>}
      </div>

      {result && (
        <div className="result-section">

          {/* EMERGENCY ALERT */}
          {result.isEmergency && (
            <div style={{background:"rgba(255,71,87,0.15)",border:"2px solid var(--danger)",borderRadius:12,padding:"18px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:16,animation:"pulse-border 1s infinite"}}>
              <span style={{fontSize:40}}>🚨</span>
              <div style={{flex:1}}>
                <p style={{fontFamily:"Syne",fontSize:18,fontWeight:800,color:"var(--danger)",marginBottom:6}}>
                  EMERGENCY SYMPTOMS DETECTED!
                </p>
                <p style={{fontSize:13,color:"var(--text-muted)",marginBottom:10}}>
                  Your symptoms indicate a possible medical emergency. Please seek immediate medical attention!
                </p>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <a href="tel:108" className="btn"
                    style={{background:"var(--danger)",color:"#fff",fontFamily:"Syne",fontWeight:700,fontSize:14,padding:"10px 20px",borderRadius:10,textDecoration:"none"}}>
                    📞 Call 108 — Ambulance
                  </a>
                  <a href="https://www.google.com/maps/search/emergency+hospital+near+me"
                    target="_blank" rel="noreferrer" className="map-btn">
                    📍 Emergency Hospital
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="response-time">⚡ {result.responseTime}ms — Real-Time Detection</div>

          {/* Urgency Bar */}
          <div className={`urgency-bar ${urgency.cls}`}>
            <span className="urgency-icon">{urgency.icon}</span>
            <div>
              <div className="urgency-text">Urgency: {result.urgencyLevel}</div>
              <div className="urgency-sub">{urgency.sub}</div>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="card" style={{padding:"16px 20px"}}>
            <p className="section-label" style={{margin:0,marginBottom:8}}>AI Confidence Score (XAI)</p>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text-muted)",marginBottom:5}}>
              <span>Confidence</span>
              <span style={{color:"var(--accent)",fontWeight:700}}>{result.confidenceScore}%</span>
            </div>
            <div className="confidence-track">
              <div className="confidence-fill" style={{width:`${result.confidenceScore}%`}}/>
            </div>
          </div>

          {/* Database Matches */}
          {result.databaseMatches?.length > 0 && (
            <div className="card" style={{padding:"14px 18px",background:"rgba(0,212,255,0.04)"}}>
              <p style={{fontSize:12,color:"var(--accent)",fontWeight:700,marginBottom:8}}>
                🗄️ Matched in MediGuard Disease Database
              </p>
              {result.databaseMatches.map((d,i) => (
                <div key={i} style={{marginBottom:8}}>
                  <span className="badge badge-blue">{d.fullName}</span>
                  <span className="badge badge-gray">{d.type}</span>
                  <span style={{fontSize:11,color:"var(--text-muted)",marginLeft:8}}>ICD: {d.icdCode}</span>
                </div>
              ))}
            </div>
          )}

          {/* Possible Conditions */}
          <p className="section-label">Possible Conditions</p>
          <div className="result-grid">
            {result.possibleConditions?.map((c,i) => (
              <div className="result-item" key={i}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontFamily:"Syne",fontSize:14,fontWeight:700}}>{c.name}</span>
                  <span className={`badge ${likelihoodBadge[c.likelihood]||"badge-gray"}`}>{c.likelihood}</span>
                </div>
                <p style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.6}}>{c.description}</p>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          {result.recommendations?.length > 0 && <>
            <p className="section-label">Recommendations</p>
            <div className="card" style={{padding:"16px 20px"}}>
              <ul className="info-list">
                {result.recommendations.map((r,i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </>}

          {/* Sources */}
          {result.sources?.length > 0 && <>
            <p className="section-label">Sources (RAG Pipeline)</p>
            <div style={{marginBottom:16}}>
              {result.sources.map((s,i) => <span className="source-pill" key={i}>📚 {s}</span>)}
            </div>
          </>}

          {/* Hospital Finder */}
          <div className="card" style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
            <div>
              <p style={{fontFamily:"Syne",fontWeight:700,fontSize:14,marginBottom:4}}>🏥 Need medical attention?</p>
              <p style={{fontSize:12,color:"var(--text-muted)"}}>Find verified hospitals near your location</p>
            </div>
            <a className="map-btn" href="https://www.google.com/maps/search/hospitals+near+me" target="_blank" rel="noreferrer">
              <span>📍</span> Hospitals Near Me
            </a>
          </div>

          {result.disclaimer && (
            <div className="disclaimer" style={{marginTop:12}}>⚠️ {result.disclaimer}</div>
          )}
        </div>
      )}
    </div>
  );
}
