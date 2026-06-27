import { useState, useRef } from "react";
const BACKEND = "http://localhost:5000";

export default function MedicineScanner({ language }) {
  const [medicineName, setMedicineName] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    // Extract name from filename as hint
    const hint = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    if (!medicineName) setMedicineName(hint);
  };

  const scan = async () => {
    if (!medicineName.trim()) { setError("Please enter or scan a medicine name."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${BACKEND}/api/medicine-scan`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineName, additionalInfo, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) { setError(e.message || "Scan failed."); }
    setLoading(false);
  };

  const scoreClass = result ? (result.safetyScore >= 70 ? "high" : result.safetyScore >= 40 ? "mid" : "low") : "mid";

  return (
    <div>
      <div className="card">
        <h2 className="card-title">📷 Medicine Scanner</h2>
        <p className="card-sub">Upload a photo of medicine box/strip OR type the medicine name. AI gives complete medicine information.</p>

        {/* Upload area */}
        <div className="upload-area" onClick={() => fileRef.current.click()}>
          {preview ? (
            <img src={preview} alt="Medicine" className="upload-preview" />
          ) : (
            <div className="upload-placeholder">
              <span style={{ fontSize: 48 }}>📷</span>
              <p style={{ marginTop: 10, fontSize: 14, color: "var(--text-muted)" }}>Click to upload medicine photo</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>JPG, PNG supported</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
        </div>

        <div className="input-group" style={{ marginTop: 14 }}>
          <input type="text" placeholder="Medicine / Tablet name (e.g. Dolo 650, Paracetamol)" value={medicineName} onChange={e => setMedicineName(e.target.value)} />
          <input type="text" placeholder="Additional info (optional — dosage, manufacturer)" value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} />
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={scan} disabled={loading || !medicineName.trim()}>
              {loading ? <><span className="spinner" /> Scanning...</> : <><span>🔬</span> Scan Medicine</>}
            </button>
            {preview && <button className="btn btn-ghost" onClick={() => { setPreview(null); setMedicineName(""); setResult(null); }}>Clear</button>}
          </div>
        </div>
        {error && <div className="error-box">⚠️ {error}</div>}
      </div>

      {result && (
        <div className="result-section">
          <div className="response-time">⚡ {result.responseTime}ms</div>

          {/* Safety Score */}
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 24px" }}>
            <div className={`score-circle ${scoreClass}`} style={{ width: 72, height: 72, fontSize: 20 }}>{result.safetyScore}%</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "Syne", fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{result.name}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Generic: {result.genericName} · {result.category}</p>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                <span className={`badge ${result.prescription ? "badge-yellow" : "badge-green"}`}>{result.prescription ? "Prescription Required" : "OTC Medicine"}</span>
                <span className={`badge ${result.fdaStatus === "Approved" ? "badge-green" : "badge-yellow"}`}>{result.fdaStatus}</span>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="result-grid">
            <div className="result-item">
              <p className="section-label" style={{ margin: 0, marginBottom: 8 }}>💊 Uses</p>
              <ul className="info-list check">{result.uses?.map((u, i) => <li key={i}>{u}</li>)}</ul>
            </div>
            <div className="result-item">
              <p className="section-label" style={{ margin: 0, marginBottom: 8 }}>⚠️ Side Effects</p>
              <ul className="info-list warn">{result.sideEffects?.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
          </div>

          {result.dosage && (
            <div className="card" style={{ padding: "14px 18px", background: "rgba(0,212,255,0.04)" }}>
              <p style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, marginBottom: 4 }}>📏 Dosage</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{result.dosage}</p>
            </div>
          )}

          {result.warnings?.length > 0 && <>
            <p className="section-label">🚫 Warnings</p>
            <div className="card" style={{ padding: "14px 18px" }}>
              <ul className="info-list danger">{result.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
            </div>
          </>}

          {result.interactions?.length > 0 && <>
            <p className="section-label">💊 Drug Interactions</p>
            <div className="card" style={{ padding: "14px 18px" }}>
              <ul className="info-list warn">{result.interactions.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          </>}

          <div className="card" style={{ padding: "14px 18px", background: "rgba(0,255,157,0.04)" }}>
            <p style={{ fontSize: 12, color: "var(--accent2)", fontWeight: 700, marginBottom: 4 }}>🏪 Storage</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{result.storage}</p>
          </div>

          {result.sources?.length > 0 && <div className="tag-list" style={{ marginBottom: 14 }}>
            {result.sources.map((s, i) => <span className="source-pill" key={i}>📚 {s}</span>)}
          </div>}
        </div>
      )}
    </div>
  );
}
