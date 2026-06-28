import { useState } from "react";
const BACKEND = "https://mediguard-ai-dp8p.onrender.com";

const safetyConfig = {
  Safe:            { cls:"safe",            icon:"✅", color:"var(--accent2)" },
  Caution:         { cls:"caution",         icon:"⚠️", color:"var(--warn)" },
  Dangerous:       { cls:"dangerous",       icon:"🚫", color:"var(--danger)" },
  Contraindicated: { cls:"contraindicated", icon:"☠️", color:"var(--danger)" },
};
const severityBadge = {
  None:            "badge-green",
  Minor:           "badge-blue",
  Moderate:        "badge-yellow",
  Major:           "badge-red",
  Contraindicated: "badge-red",
};

export default function DrugInteraction({ language = "English" }) {
  const [medicines, setMedicines] = useState([]);
  const [inputVal, setInputVal]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");

  const addMedicine = () => {
    const val = inputVal.trim();
    if (val && !medicines.includes(val)) {
      setMedicines([...medicines, val]);
      setInputVal("");
    }
  };

  const removeMedicine = (m) => setMedicines(medicines.filter(x=>x!==m));

  const check = async () => {
    if (medicines.length < 2) { setError("Please add at least 2 medicines."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch(`${BACKEND}/api/drug-interaction`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({medicines}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch(e) { setError(e.message||"Check failed."); }
    setLoading(false);
  };

  const sc = result ? safetyConfig[result.overallSafety]||safetyConfig.Caution : null;

  return (
    <div>
      <div className="card">
        <h2 className="card-title">💊 Drug Interaction Checker</h2>
        <p className="card-sub">Enter 2 or more medicines to check if they are safe to take together. Uses FDA & PubMed pharmacology data.</p>

        {/* Medicine Tag Input */}
        <div className="input-group">
          <div className="medicine-tags">
            {medicines.map(m=>(
              <span className="med-tag" key={m}>
                💊 {m}
                <span className="med-tag-remove" onClick={()=>removeMedicine(m)}>✕</span>
              </span>
            ))}
            <input
              className="med-input"
              placeholder={medicines.length===0?"Type medicine name and press Enter or +":`Add more medicines...`}
              value={inputVal}
              onChange={e=>setInputVal(e.target.value)}
              onKeyDown={e=>(e.key==="Enter"||e.key==="+")&&(e.preventDefault(),addMedicine())}
            />
          </div>
          <p style={{fontSize:11,color:"var(--text-muted)"}}>Press Enter or + to add each medicine</p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {inputVal.trim()&&<button className="btn btn-ghost" onClick={addMedicine}>+ Add Medicine</button>}
            <button className="btn btn-primary" onClick={check} disabled={loading||medicines.length<2}>
              {loading ? <><span className="spinner"/> Checking...</> : <><span>🔬</span> Check Interactions</>}
            </button>
            {medicines.length>0&&<button className="btn btn-ghost" onClick={()=>{setMedicines([]);setResult(null);}}>Clear All</button>}
          </div>
        </div>

        {/* Quick examples */}
        <p className="section-label" style={{marginTop:18}}>Quick Test Examples</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["Aspirin","Warfarin"],["Paracetamol","Alcohol"],["Metformin","Alcohol"],["Ibuprofen","Naproxen"]].map((pair,i)=>(
            <button key={i} className="btn btn-ghost" style={{fontSize:12,padding:"6px 12px"}}
              onClick={()=>{setMedicines(pair);setResult(null);}}>
              💊 {pair.join(" + ")}
            </button>
          ))}
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}
      </div>

      {result && sc && (
        <div className="result-section">
          <div className="response-time">⚡ Response time: {result.responseTime}ms</div>

          {/* Overall Safety */}
          <div className={`safety-box ${sc.cls}`}>
            <span className="safety-icon">{sc.icon}</span>
            <div>
              <div className="safety-label" style={{color:sc.color}}>Overall: {result.overallSafety}</div>
              <p style={{fontSize:12,color:"var(--text-muted)",marginTop:4}}>
                Checking: {medicines.join(" + ")}
              </p>
            </div>
            {result.consultDoctor&&<span className="badge badge-red" style={{marginLeft:"auto"}}>⚕ See Doctor</span>}
          </div>

          {/* Interaction Score */}
          <div className="card" style={{padding:"14px 18px"}}>
            <p className="section-label" style={{margin:0,marginBottom:8}}>Interaction Risk Score</p>
            <div className="confidence-bar-wrap">
              <div className="confidence-label"><span>Risk Level</span><span style={{color: result.interactionScore>60?"var(--danger)":result.interactionScore>30?"var(--warn)":"var(--accent2)",fontWeight:700}}>{result.interactionScore}%</span></div>
              <div className="confidence-track">
                <div className="confidence-fill" style={{width:`${result.interactionScore}%`,background:result.interactionScore>60?"linear-gradient(90deg,var(--warn),var(--danger))":undefined}}/>
              </div>
            </div>
          </div>

          {/* Individual Interactions */}
          {result.interactions?.length>0 && <>
            <p className="section-label">Drug Pair Interactions</p>
            {result.interactions.map((item,i)=>(
              <div className="interaction-card" key={i}>
                <div className="interaction-header">
                  <span className="drug-pair">
                    💊 {item.drug1} <span className="drug-arrow">⟷</span> 💊 {item.drug2}
                  </span>
                  <span className={`badge ${severityBadge[item.severity]||"badge-gray"}`}>{item.severity}</span>
                </div>
                <p style={{fontSize:13,color:"var(--text)",marginBottom:6}}><strong>Effect:</strong> {item.effect}</p>
                <p style={{fontSize:12,color:"var(--text-muted)"}}><strong>Why:</strong> {item.mechanism}</p>
              </div>
            ))}
          </>}

          {/* Recommendations */}
          {result.recommendations?.length>0 && <>
            <p className="section-label">Recommendations</p>
            <div className="card" style={{padding:"14px 18px"}}>
              <ul className="info-list warn">{result.recommendations.map((r,i)=><li key={i}>{r}</li>)}</ul>
            </div>
          </>}

          {/* Alternatives */}
          {result.alternatives?.length>0 && <>
            <p className="section-label">Safer Alternatives</p>
            <div className="card" style={{padding:"14px 18px"}}>
              <ul className="info-list check">{result.alternatives.map((a,i)=><li key={i}>{a}</li>)}</ul>
            </div>
          </>}

          {/* Sources */}
          {result.sources?.length>0 && <>
            <p className="section-label">Sources</p>
            <div className="tag-list" style={{marginBottom:14}}>
              {result.sources.map((s,i)=><span className="source-pill" key={i}>📚 {s}</span>)}
            </div>
          </>}

          <div className="disclaimer">⚠️ Always consult your doctor or pharmacist before combining medicines. This is AI-generated information only.</div>
        </div>
      )}
    </div>
  );
}
