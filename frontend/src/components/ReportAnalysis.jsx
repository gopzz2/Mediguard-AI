import { useState, useRef } from "react";
const BACKEND = "http://localhost:5000";

const REPORT_TYPES = [
  { id:"Blood Test",     icon:"🩸", desc:"CBC, HbA1c, Lipid profile, Liver function" },
  { id:"ECG Report",     icon:"❤️", desc:"Heart rhythm, ST changes, QRS complex" },
  { id:"X-Ray Report",   icon:"🫁", desc:"Chest, Bone, Spine X-ray findings" },
  { id:"Urine Test",     icon:"🧪", desc:"Routine urine examination" },
  { id:"Thyroid Test",   icon:"🦋", desc:"TSH, T3, T4 levels" },
  { id:"Diabetes Report",icon:"💉", desc:"Fasting glucose, HbA1c, PPBS" },
];

const statusColor = {
  Normal:   { bg:"rgba(0,255,157,0.08)",  border:"rgba(0,255,157,0.3)",  color:"var(--accent2)", icon:"✅" },
  Low:      { bg:"rgba(0,212,255,0.08)",  border:"rgba(0,212,255,0.3)",  color:"var(--accent)",  icon:"⬇️" },
  High:     { bg:"rgba(255,165,2,0.08)",  border:"rgba(255,165,2,0.3)",  color:"var(--warn)",    icon:"⬆️" },
  Critical: { bg:"rgba(255,71,87,0.12)",  border:"rgba(255,71,87,0.5)",  color:"var(--danger)",  icon:"🚨" },
};

const healthColor = {
  "Normal":           "var(--accent2)",
  "Mild Concern":     "var(--accent)",
  "Moderate Concern": "var(--warn)",
  "Critical":         "var(--danger)",
};

const EXAMPLES = {
  "Blood Test": `Hemoglobin: 9.2 g/dL (Normal: 12-17)
WBC: 11,500 /uL (Normal: 4000-11000)
Platelets: 145,000 /uL (Normal: 150,000-400,000)
Blood Sugar Fasting: 142 mg/dL (Normal: 70-100)
HbA1c: 7.8% (Normal: < 5.7%)
Cholesterol Total: 245 mg/dL (Normal: < 200)
HDL: 38 mg/dL (Normal: > 40)
LDL: 168 mg/dL (Normal: < 100)
Creatinine: 1.4 mg/dL (Normal: 0.6-1.2)
SGPT/ALT: 52 U/L (Normal: 7-40)`,

  "Thyroid Test": `TSH: 6.8 mIU/L (Normal: 0.4-4.0)
T3 Total: 0.8 ng/mL (Normal: 0.8-2.0)
T4 Total: 4.2 ug/dL (Normal: 5.1-14.1)
Free T3: 2.1 pg/mL (Normal: 2.3-4.2)
Free T4: 0.7 ng/dL (Normal: 0.8-1.8)`,

  "Diabetes Report": `Fasting Blood Sugar: 168 mg/dL (Normal: 70-100)
Post Prandial: 245 mg/dL (Normal: < 140)
HbA1c: 8.2% (Normal: < 5.7%)
Insulin Fasting: 18 uIU/mL (Normal: 2-20)`,

  "Urine Test": `Color: Yellow (Normal: Yellow)
Clarity: Turbid (Normal: Clear)
pH: 8.5 (Normal: 4.5-8.0)
Protein: ++ (Normal: Negative)
Glucose: + (Normal: Negative)
Ketones: Negative (Normal: Negative)
RBC: 5-8/hpf (Normal: 0-2/hpf)
WBC: 10-15/hpf (Normal: 0-5/hpf)`,

  "ECG Report": `Heart Rate: 110 bpm (Normal: 60-100)
PR Interval: 220ms (Normal: 120-200ms)
QRS Duration: 130ms (Normal: 80-120ms)
QT Interval: 480ms (Normal: 350-440ms)
ST Segment: Elevated in leads II, III, aVF
T Wave: Inverted in V1-V4
Rhythm: Sinus Tachycardia`,

  "X-Ray Report": `Lung Fields: Bilateral infiltrates present
Cardiomegaly: Mild enlargement noted
Pleural Effusion: Small right sided effusion
Costophrenic Angles: Blunted on right side
Mediastinum: Slightly widened
Bones: No fracture seen
Diaphragm: Right dome elevated`,
};

export default function ReportAnalysis({ language = "English" }) {
  const [reportType, setReportType] = useState("Blood Test");
  const [reportText, setReportText] = useState("");
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState("");
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setReportText(ev.target.result);
    reader.readAsText(file);
  };

  const analyse = async () => {
    if (!reportText.trim()) { setError("Please enter or upload report data."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${BACKEND}/api/report-analysis`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ reportText, reportType, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch(e) { setError(e.message || "Analysis failed."); }
    setLoading(false);
  };

  const abnormal  = result?.findings?.filter(f => f.status !== "Normal") || [];
  const critical  = result?.findings?.filter(f => f.status === "Critical") || [];

  return (
    <div>
      {/* Emergency Banner */}
      {result?.isEmergency && (
        <div style={{background:"rgba(255,71,87,0.15)",border:"2px solid var(--danger)",borderRadius:12,padding:"16px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:14,animation:"pulse-border 1s infinite"}}>
          <span style={{fontSize:32}}>🚨</span>
          <div>
            <p style={{fontFamily:"Syne",fontSize:16,fontWeight:800,color:"var(--danger)",marginBottom:4}}>
              CRITICAL VALUES DETECTED!
            </p>
            <p style={{fontSize:13,color:"var(--text-muted)"}}>
              Some report values are critically abnormal. Please consult a doctor IMMEDIATELY or call{" "}
              <strong style={{color:"var(--danger)"}}>108</strong>.
            </p>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">📋 Medical Report Analyser</h2>
        <p className="card-sub">
          Upload or paste your Blood Test, ECG, X-Ray or any medical report.
          AI analyses all values and explains results in simple language.
        </p>

        {/* Report Type Selection */}
        <span className="section-label">Select Report Type</span>
        <div className="report-type-grid">
          {REPORT_TYPES.map(r => (
            <button
              key={r.id}
              className={`report-type-btn ${reportType === r.id ? "active" : ""}`}
              onClick={() => { setReportType(r.id); setReportText(""); setResult(null); }}
            >
              <span style={{fontSize:20}}>{r.icon}</span>
              <span style={{fontFamily:"Syne",fontSize:12,fontWeight:700}}>{r.id}</span>
              <span style={{fontSize:10,color:"var(--text-muted)",marginTop:2,textAlign:"center"}}>{r.desc}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}>
          <button className="btn btn-ghost" onClick={() => fileRef.current.click()}>
            📁 Upload Report File (.txt)
          </button>
          <button className="btn btn-ghost"
            onClick={() => { setReportText(EXAMPLES[reportType] || ""); setResult(null); }}>
            📋 Load Example
          </button>
          <input ref={fileRef} type="file" accept=".txt,.csv"
            style={{display:"none"}} onChange={handleFile}/>
        </div>

        {/* Text Area */}
        <textarea
          rows={9}
          placeholder={`Paste your ${reportType} values here...\n\nExample:\nHemoglobin: 9.2 g/dL (Normal: 12-17)\nBlood Sugar: 142 mg/dL (Normal: 70-100)\n\nOr click "Load Example" to see sample data`}
          value={reportText}
          onChange={e => setReportText(e.target.value)}
          style={{fontFamily:"monospace",fontSize:13}}
        />

        <button className="btn btn-primary" onClick={analyse}
          disabled={loading || !reportText.trim()}>
          {loading
            ? <><span className="spinner"/> Analysing Report...</>
            : <><span>🔬</span> Analyse Report</>}
        </button>

        {error && <div className="error-box">⚠️ {error}</div>}
      </div>

      {result && (
        <div className="result-section">
          <div className="response-time">⚡ {result.responseTime}ms</div>

          {/* Overview Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12,marginBottom:16}}>
            <div className="card" style={{padding:"14px",textAlign:"center"}}>
              <p style={{fontSize:11,color:"var(--text-muted)",marginBottom:6}}>Overall Health</p>
              <p style={{fontFamily:"Syne",fontSize:14,fontWeight:800,color:healthColor[result.overallHealth]}}>
                {result.overallHealth}
              </p>
            </div>
            <div className="card" style={{padding:"14px",textAlign:"center"}}>
              <p style={{fontSize:11,color:"var(--text-muted)",marginBottom:6}}>Total Parameters</p>
              <p style={{fontFamily:"Syne",fontSize:24,fontWeight:800,color:"var(--accent)"}}>
                {result.findings?.length || 0}
              </p>
            </div>
            <div className="card" style={{padding:"14px",textAlign:"center"}}>
              <p style={{fontSize:11,color:"var(--text-muted)",marginBottom:6}}>Abnormal</p>
              <p style={{fontFamily:"Syne",fontSize:24,fontWeight:800,color:"var(--warn)"}}>
                {abnormal.length}
              </p>
            </div>
            <div className="card" style={{padding:"14px",textAlign:"center"}}>
              <p style={{fontSize:11,color:"var(--text-muted)",marginBottom:6}}>Critical</p>
              <p style={{fontFamily:"Syne",fontSize:24,fontWeight:800,color:"var(--danger)"}}>
                {critical.length}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="card" style={{padding:"16px 20px"}}>
            <span className="section-label" style={{margin:0,marginBottom:8}}>📋 Report Summary</span>
            <p style={{fontSize:13,color:"var(--text-muted)",lineHeight:1.8}}>{result.summary}</p>
          </div>

          {/* Critical Values */}
          {critical.length > 0 && <>
            <span className="section-label">🚨 Critical Values — Immediate Attention Needed</span>
            {critical.map((f,i) => (
              <div key={i} style={{background:statusColor.Critical.bg,border:`1px solid ${statusColor.Critical.border}`,borderRadius:10,padding:"14px 18px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:6}}>
                  <span style={{fontFamily:"Syne",fontSize:14,fontWeight:700}}>
                    {statusColor.Critical.icon} {f.parameter}
                  </span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span className="badge badge-red">{f.value}</span>
                    <span style={{fontSize:11,color:"var(--text-muted)"}}>Normal: {f.normalRange}</span>
                  </div>
                </div>
                <p style={{fontSize:13,color:"var(--text-muted)"}}>{f.interpretation}</p>
              </div>
            ))}
          </>}

          {/* All Findings */}
          <span className="section-label">📊 All Parameters Analysis</span>
          {result.findings?.map((f,i) => {
            const sc = statusColor[f.status] || statusColor.Normal;
            return (
              <div key={i} style={{background:sc.bg,border:`1px solid ${sc.border}`,borderRadius:10,padding:"12px 16px",marginBottom:8,display:"flex",alignItems:"flex-start",gap:12}}>
                <span style={{fontSize:18,flexShrink:0,marginTop:2}}>{sc.icon}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6,marginBottom:4}}>
                    <span style={{fontFamily:"Syne",fontSize:13,fontWeight:700}}>{f.parameter}</span>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={{fontFamily:"Syne",fontSize:13,fontWeight:800,color:sc.color}}>{f.value}</span>
                      <span style={{fontSize:11,color:"var(--text-muted)"}}>Normal: {f.normalRange}</span>
                      <span className={`badge ${f.status==="Normal"?"badge-green":f.status==="Critical"?"badge-red":"badge-yellow"}`}>
                        {f.status}
                      </span>
                    </div>
                  </div>
                  <p style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.6}}>{f.interpretation}</p>
                </div>
              </div>
            );
          })}

          {/* Possible Conditions */}
          {result.possibleConditions?.length > 0 && <>
            <span className="section-label">🔍 Possible Conditions Based on Report</span>
            <div className="tag-list">
              {result.possibleConditions.map((c,i) => (
                <span className="badge badge-yellow" key={i}
                  style={{fontSize:12,padding:"6px 14px"}}>{c}</span>
              ))}
            </div>
          </>}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && <>
            <span className="section-label">✅ Recommendations</span>
            <div className="card" style={{padding:"14px 18px"}}>
              <ul className="info-list check">
                {result.recommendations.map((r,i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </>}

          {/* Urgent Action */}
          {result.urgentAction && (
            <div style={{background:"rgba(255,71,87,0.08)",border:"1px solid rgba(255,71,87,0.3)",borderRadius:10,padding:"14px 18px",marginBottom:14}}>
              <p style={{fontSize:12,color:"var(--danger)",fontWeight:700,marginBottom:4}}>
                ⚡ Urgent Action Required
              </p>
              <p style={{fontSize:13,color:"var(--text-muted)"}}>{result.urgentAction}</p>
            </div>
          )}

          {/* Follow Up */}
          {result.followUp && (
            <div className="card" style={{padding:"14px 18px",background:"rgba(0,212,255,0.04)"}}>
              <p style={{fontSize:12,color:"var(--accent)",fontWeight:700,marginBottom:4}}>📅 Follow-Up</p>
              <p style={{fontSize:13,color:"var(--text-muted)"}}>{result.followUp}</p>
            </div>
          )}

          {/* Sources */}
          {result.sources?.length > 0 && (
            <div style={{marginBottom:14}}>
              {result.sources.map((s,i) => (
                <span className="source-pill" key={i}>📚 {s}</span>
              ))}
            </div>
          )}

          <div className="disclaimer">
            ⚠️ This AI analysis is for informational purposes only.
            Always consult a licensed doctor for medical diagnosis and treatment.
          </div>
        </div>
      )}
    </div>
  );
}