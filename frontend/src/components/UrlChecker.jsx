import { useState } from "react";
const BACKEND = "http://localhost:5000";
const safetyConfig = {
  Safe:      { cls:"safe",      icon:"🛡️", color:"var(--accent2)" },
  Suspicious:{ cls:"suspicious",icon:"⚠️", color:"var(--warn)" },
  Dangerous: { cls:"dangerous", icon:"🚫", color:"var(--danger)" },
  Unknown:   { cls:"unknown",   icon:"❓", color:"var(--text-muted)" },
};

export default function UrlChecker({ language = "English" }) {
  const [url, setUrl]             = useState("");
  const [tabletName, setTabletName] = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");

  const check = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch(`${BACKEND}/api/url-check`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({url,tabletName}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch(e) { setError(e.message||"URL check failed."); }
    setLoading(false);
  };

  const sc    = result ? safetyConfig[result.urlSafety]||safetyConfig.Unknown : null;
  const score = result?.medicineInfo?.legitimacyScore||0;
  const scoreClass = score>=70?"high":score>=40?"mid":"low";

  return (
    <div>
      <div className="card">
        <h2 className="card-title">🔗 URL & Tablet Checker</h2>
        <p className="card-sub">Check if a medical website is safe and verify medicine information using WHO, FDA & MedlinePlus.</p>
        <div className="input-group">
          <div className="input-row">
            <input type="url" placeholder="https://example-medical-site.com" value={url} onChange={e=>setUrl(e.target.value)} style={{flex:2}}/>
            <input type="text" placeholder="Tablet name (e.g. Paracetamol)" value={tabletName} onChange={e=>setTabletName(e.target.value)} style={{flex:1}}/>
          </div>
          <div>
            <button className="btn btn-primary" onClick={check} disabled={loading||!url.trim()}>
              {loading ? <><span className="spinner"/> Checking...</> : <><span>🔎</span> Check URL & Medicine</>}
            </button>
          </div>
        </div>
        {error && <div className="error-box">⚠️ {error}</div>}
      </div>

      {result && sc && (
        <div className="result-section">
          <div className="response-time">⚡ Response time: {result.responseTime}ms</div>

          {/* URL Safety */}
          <div className={`safety-box ${sc.cls}`}>
            <span className="safety-icon">{sc.icon}</span>
            <div>
              <div className="safety-label" style={{color:sc.color}}>URL is {result.urlSafety}</div>
              <p style={{fontSize:12,color:"var(--text-muted)",marginTop:4}}>{result.urlAnalysis}</p>
            </div>
          </div>

          {/* Medicine */}
          {result.medicineInfo && (
            <div className="card">
              <div className="score-wrap">
                <div className={`score-circle ${scoreClass}`}>{score}%</div>
                <div>
                  <p style={{fontFamily:"Syne",fontSize:16,fontWeight:700,marginBottom:6}}>{result.medicineInfo.name||tabletName||"Medicine"}</p>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    <span className={`badge ${result.medicineInfo.verified?"badge-green":"badge-red"}`}>{result.medicineInfo.verified?"✅ Verified":"❌ Unverified"}</span>
                    <span className={`badge ${result.medicineInfo.fdaApproved?"badge-green":"badge-yellow"}`}>{result.medicineInfo.fdaApproved?"FDA Approved":"Not FDA Listed"}</span>
                    <span className="badge badge-blue">Score: {score}%</span>
                  </div>
                </div>
              </div>
              {result.medicineInfo.uses?.length>0&&<><p className="section-label">Medical Uses</p><ul className="info-list check" style={{marginBottom:14}}>{result.medicineInfo.uses.map((u,i)=><li key={i}>{u}</li>)}</ul></>}
              {result.medicineInfo.sideEffects?.length>0&&<><p className="section-label">Side Effects</p><ul className="info-list warn" style={{marginBottom:14}}>{result.medicineInfo.sideEffects.map((s,i)=><li key={i}>{s}</li>)}</ul></>}
              {result.medicineInfo.warnings?.length>0&&<><p className="section-label">Warnings</p><ul className="info-list danger">{result.medicineInfo.warnings.map((w,i)=><li key={i}>{w}</li>)}</ul></>}
            </div>
          )}

          {result.redFlags?.length>0&&<><p className="section-label">Red Flags</p><div className="card" style={{padding:"14px 18px"}}><ul className="info-list flag">{result.redFlags.map((f,i)=><li key={i}>{f}</li>)}</ul></div></>}
          {result.sources?.length>0&&<><p className="section-label">Sources</p><div className="tag-list" style={{marginBottom:14}}>{result.sources.map((s,i)=><span className="source-pill" key={i}>📚 {s}</span>)}</div></>}
          {result.recommendation&&<div className="disclaimer">💡 {result.recommendation}</div>}
        </div>
      )}
    </div>
  );
}
