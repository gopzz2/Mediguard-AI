import { useState } from "react";
const BACKEND = "https://mediguard-ai-dp8p.onrender.com";

const riskColor = {
  Low:      "var(--accent2)",
  Moderate: "var(--warn)",
  High:     "var(--danger)",
  Critical: "var(--danger)",
};
const riskBadge = {
  Low:      "badge-green",
  Moderate: "badge-yellow",
  High:     "badge-red",
  Critical: "badge-red",
};

export default function HealthReport({ language = "English" }) {
  const [form, setForm] = useState({
    name: "", age: "", gender: "",
    symptoms: "", conditions: "",
    medicines: "", allergies: ""
  });
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState("");
  const [emailInput, setEmailInput]   = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState("");

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.name || !form.age) { setError("Name and age are required."); return; }
    setLoading(true); setError(""); setResult(null); setEmailSuccess("");
    try {
      const res = await fetch(`${BACKEND}/api/generate-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportData: form, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({ ...data, form });
    } catch (e) { setError(e.message || "Report generation failed."); }
    setLoading(false);
  };

  const downloadReport = () => {
    if (!result) return;
    const now = new Date().toLocaleString();
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MediGuard AI — Health Report — ${result.form.name}</title>
  <style>
    body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#222;background:#fff}
    .header{background:linear-gradient(135deg,#004080,#006994);color:#fff;padding:30px;border-radius:12px;margin-bottom:28px;text-align:center}
    .header h1{margin:0 0 6px;font-size:26px}
    .header p{margin:0;opacity:0.85;font-size:13px}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px}
    .info-item{background:#f0f4f8;padding:12px 16px;border-radius:8px}
    .info-item label{font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px}
    .info-item p{margin:4px 0 0;font-size:14px;font-weight:600;color:#222}
    .risk{text-align:center;padding:20px;border-radius:10px;margin-bottom:24px}
    .section{background:#f8f9fa;border-left:4px solid #006994;padding:16px 20px;border-radius:8px;margin-bottom:18px}
    .section h3{margin:0 0 10px;color:#004080;font-size:15px}
    .section ul{margin:0;padding-left:20px}
    .section li{margin-bottom:6px;font-size:13px;line-height:1.6}
    .section p{font-size:13px;line-height:1.7;margin:0}
    .disclaimer{background:#fff3cd;border:1px solid #ffc107;padding:14px 18px;border-radius:8px;font-size:12px;color:#856404;margin-top:20px}
    .footer{text-align:center;margin-top:32px;font-size:11px;color:#888;border-top:1px solid #eee;padding-top:16px}
  </style>
</head>
<body>
  <div class="header">
    <h1>⚕ MediGuard AI — Health Report</h1>
    <p>Generated on ${now} · AI-Powered Medical Information System</p>
  </div>

  <div class="info-grid">
    <div class="info-item"><label>Patient Name</label><p>${result.form.name}</p></div>
    <div class="info-item"><label>Age</label><p>${result.form.age} years</p></div>
    <div class="info-item"><label>Gender</label><p>${result.form.gender || "Not specified"}</p></div>
    <div class="info-item"><label>Report ID</label><p>MG-${Date.now()}</p></div>
  </div>

  <div class="risk" style="background:${result.riskAssessment==="Low"?"#d4edda":result.riskAssessment==="Moderate"?"#fff3cd":"#f8d7da"}">
    <div style="font-size:12px;color:#555;margin-bottom:6px">Overall Risk Assessment</div>
    <div style="font-size:32px;font-weight:800;color:${result.riskAssessment==="Low"?"#155724":result.riskAssessment==="Moderate"?"#856404":"#721c24"}">${result.riskAssessment}</div>
  </div>

  <div class="section">
    <h3>📋 Patient Summary</h3>
    <p>${result.patientSummary}</p>
  </div>

  ${result.keyFindings?.length > 0 ? `
  <div class="section">
    <h3>🔍 Key Findings</h3>
    <ul>${result.keyFindings.map(f => `<li>${f}</li>`).join("")}</ul>
  </div>` : ""}

  ${result.recommendations?.length > 0 ? `
  <div class="section">
    <h3>✅ Recommendations</h3>
    <ul>${result.recommendations.map(r => `<li>${r}</li>`).join("")}</ul>
  </div>` : ""}

  ${result.lifestyle?.length > 0 ? `
  <div class="section">
    <h3>🏃 Lifestyle Advice</h3>
    <ul>${result.lifestyle.map(l => `<li>${l}</li>`).join("")}</ul>
  </div>` : ""}

  ${result.followUp ? `
  <div class="section">
    <h3>📅 Follow-Up</h3>
    <p>${result.followUp}</p>
  </div>` : ""}

  <div class="disclaimer">
    ⚠️ ${result.disclaimer || "This report is AI-generated for informational purposes only. Always consult a licensed medical professional."}
  </div>

  <div class="footer">
    ⚕ MediGuard AI · AI-Powered Medical Misinformation Detection System · ${now}
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `MediGuard_Report_${result.form.name.replace(/\s/g,"_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendEmail = async () => {
    if (!emailInput || !result) return;
    setEmailLoading(true); setEmailSuccess("");
    try {
      const reportContent = `
PATIENT: ${result.form?.name || "N/A"}
AGE: ${result.form?.age || "N/A"}
GENDER: ${result.form?.gender || "N/A"}
RISK LEVEL: ${result.riskAssessment}

SUMMARY:
${result.patientSummary}

KEY FINDINGS:
${result.keyFindings?.map((f,i)=>`${i+1}. ${f}`).join("\n") || "None"}

RECOMMENDATIONS:
${result.recommendations?.map((r,i)=>`${i+1}. ${r}`).join("\n") || "None"}

LIFESTYLE ADVICE:
${result.lifestyle?.map((l,i)=>`${i+1}. ${l}`).join("\n") || "None"}

FOLLOW UP:
${result.followUp || "None"}

DISCLAIMER:
${result.disclaimer || "Always consult a licensed medical professional."}
      `.trim();

      const res = await fetch(`${BACKEND}/api/send-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail:       emailInput,
          patientName:   result.form?.name,
          reportContent,
          reportType:    "Health",
        }),
      });
      const data = await res.json();
      if (data.success) setEmailSuccess("✅ Report sent to " + emailInput);
      else throw new Error(data.error);
    } catch (e) {
      setEmailSuccess("❌ Failed: " + e.message);
    }
    setEmailLoading(false);
  };

  return (
    <div>
      <div className="card">
        <h2 className="card-title">📄 Health Report Generator</h2>
        <p className="card-sub">Fill in your health details. AI generates a complete health report which you can download or email.</p>

        <div className="report-form">
          <div className="input-row">
            <input type="text" placeholder="Patient Name *" value={form.name} onChange={e=>update("name",e.target.value)}/>
            <input type="text" placeholder="Age *" value={form.age} onChange={e=>update("age",e.target.value)} style={{flex:"0 0 100px"}}/>
            <select value={form.gender} onChange={e=>update("gender",e.target.value)} className="select-input">
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <textarea rows={2} placeholder="Current symptoms (e.g. fever, headache, body pain)" value={form.symptoms} onChange={e=>update("symptoms",e.target.value)}/>
          <textarea rows={2} placeholder="Known medical conditions (e.g. diabetes, hypertension)" value={form.conditions} onChange={e=>update("conditions",e.target.value)}/>
          <textarea rows={2} placeholder="Current medicines you take" value={form.medicines} onChange={e=>update("medicines",e.target.value)}/>
          <input type="text" placeholder="Allergies (if any)" value={form.allergies} onChange={e=>update("allergies",e.target.value)}/>

          <div style={{display:"flex",gap:10,marginTop:4,flexWrap:"wrap"}}>
            <button className="btn btn-primary" onClick={generate} disabled={loading||!form.name||!form.age}>
              {loading ? <><span className="spinner"/> Generating...</> : <><span>📄</span> Generate Report</>}
            </button>
            {result && (
              <button className="btn" style={{background:"linear-gradient(135deg,var(--accent2),#00bb73)",color:"#000",fontFamily:"Syne",fontWeight:700,fontSize:13}} onClick={downloadReport}>
                ⬇️ Download Report
              </button>
            )}
          </div>
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}
      </div>

      {result && (
        <div className="result-section">
          <div className="response-time">⚡ {result.responseTime}ms</div>

          {/* Risk Assessment */}
          <div style={{textAlign:"center",padding:"20px",borderRadius:12,marginBottom:16,background:`${riskColor[result.riskAssessment]}18`,border:`1px solid ${riskColor[result.riskAssessment]}44`}}>
            <p style={{fontSize:12,color:"var(--text-muted)",marginBottom:6}}>Overall Risk Assessment</p>
            <span className={`badge ${riskBadge[result.riskAssessment]}`} style={{fontSize:18,padding:"6px 20px"}}>
              {result.riskAssessment}
            </span>
          </div>

          {/* Summary */}
          <div className="card" style={{padding:"16px 20px"}}>
            <p className="section-label" style={{margin:0,marginBottom:8}}>📋 Patient Summary</p>
            <p style={{fontSize:13,color:"var(--text-muted)",lineHeight:1.8}}>{result.patientSummary}</p>
          </div>

          {/* Key Findings */}
          {result.keyFindings?.length > 0 && <>
            <p className="section-label">🔍 Key Findings</p>
            <div className="card" style={{padding:"14px 18px"}}>
              <ul className="info-list">
                {result.keyFindings.map((f,i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          </>}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && <>
            <p className="section-label">✅ Recommendations</p>
            <div className="card" style={{padding:"14px 18px"}}>
              <ul className="info-list check">
                {result.recommendations.map((r,i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </>}

          {/* Lifestyle */}
          {result.lifestyle?.length > 0 && <>
            <p className="section-label">🏃 Lifestyle Advice</p>
            <div className="card" style={{padding:"14px 18px"}}>
              <ul className="info-list check">
                {result.lifestyle.map((l,i) => <li key={i}>{l}</li>)}
              </ul>
            </div>
          </>}

          {/* Follow Up */}
          {result.followUp && (
            <div className="card" style={{padding:"14px 18px",background:"rgba(0,212,255,0.04)"}}>
              <p style={{fontSize:12,color:"var(--accent)",fontWeight:700,marginBottom:4}}>📅 Follow-Up</p>
              <p style={{fontSize:13,color:"var(--text-muted)"}}>{result.followUp}</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="disclaimer">{result.disclaimer}</div>

          {/* Download Button */}
          <button className="btn" style={{marginTop:16,width:"100%",justifyContent:"center",background:"linear-gradient(135deg,var(--accent2),#00bb73)",color:"#000",fontFamily:"Syne",fontWeight:700,fontSize:14,padding:"14px",borderRadius:10}} onClick={downloadReport}>
            ⬇️ Download Full Health Report
          </button>

          {/* Email Section */}
          <div className="card" style={{padding:"16px 20px",marginTop:12}}>
            <p style={{fontFamily:"Syne",fontSize:14,fontWeight:700,marginBottom:4}}>📧 Email This Report</p>
            <p style={{fontSize:12,color:"var(--text-muted)",marginBottom:12}}>Send this health report directly to your email</p>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <input
                type="text"
                placeholder="Enter email address (e.g. patient@gmail.com)"
                value={emailInput}
                onChange={e=>setEmailInput(e.target.value)}
                style={{flex:1,margin:0}}
              />
              <button className="btn btn-primary" onClick={sendEmail}
                disabled={emailLoading||!emailInput} style={{flexShrink:0}}>
                {emailLoading
                  ? <><span className="spinner"/> Sending...</>
                  : <>📧 Send Email</>}
              </button>
            </div>
            {emailSuccess && (
              <p style={{fontSize:13,marginTop:10,color:emailSuccess.includes("✅")?"var(--accent2)":"var(--danger)",fontWeight:600}}>
                {emailSuccess}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}