import { useState, useEffect } from "react";

// ─── LOGIN / REGISTER COMPONENT ───────────────────────────────────────────────
function UserAuth({ onLogin }) {
  const [mode, setMode]         = useState("login");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = () => {
    if (!email || !password) { setError("Email and password required!"); return; }
    if (mode === "register" && !name) { setError("Name required!"); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      const userData = {
        name: name || email.split("@")[0],
        email,
        loginTime: new Date().toLocaleString()
      };
      localStorage.setItem("mediguard_user", JSON.stringify(userData));
      onLogin && onLogin(userData);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="card" style={{maxWidth:420,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <span style={{fontSize:52}}>⚕</span>
        <h2 className="card-title" style={{textAlign:"center",marginTop:10}}>
          {mode==="login" ? "Login to MediGuard AI" : "Create Account"}
        </h2>
        <p style={{fontSize:13,color:"var(--text-muted)"}}>
          Save your health history and reports
        </p>
      </div>

      <div className="input-group">
        {mode==="register" && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e=>setName(e.target.value)}
          />
        )}
        <input
          type="text"
          placeholder="Email Address"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
        />
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{width:"100%",justifyContent:"center",padding:"13px"}}>
          {loading
            ? <><span className="spinner"/>
                {mode==="login" ? " Logging in..." : " Creating account..."}
              </>
            : mode==="login" ? "🔐 Login" : "✅ Create Account"
          }
        </button>
      </div>

      {error && <div className="error-box">⚠️ {error}</div>}

      <p style={{textAlign:"center",fontSize:13,color:"var(--text-muted)",marginTop:16}}>
        {mode==="login" ? "Don't have account? " : "Already have account? "}
        <span
          style={{color:"var(--accent)",cursor:"pointer",fontWeight:600}}
          onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}}>
          {mode==="login" ? "Sign Up" : "Login"}
        </span>
      </p>
    </div>
  );
}

// ─── HISTORY PANEL COMPONENT ──────────────────────────────────────────────────
function HistoryPanel({ user, onLogout }) {
  const [history, setHistory]   = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const saved = localStorage.getItem("mediguard_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const historyTypes = [
    { id:"all",     label:"All",      icon:"📋" },
    { id:"symptom", label:"Symptoms", icon:"🩺" },
    { id:"fact",    label:"Facts",    icon:"🔍" },
    { id:"drug",    label:"Drugs",    icon:"💊" },
    { id:"report",  label:"Reports",  icon:"📄" },
  ];

  const filtered = activeTab==="all"
    ? history
    : history.filter(h=>h.type===activeTab);

  const clearHistory = () => {
    localStorage.removeItem("mediguard_history");
    setHistory([]);
  };

  return (
    <div>
      {/* User Profile Card */}
      <div className="card" style={{padding:"18px 22px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne",fontSize:22,fontWeight:800,color:"#000",flexShrink:0}}>
              {user.name[0].toUpperCase()}
            </div>
            <div>
              <p style={{fontFamily:"Syne",fontSize:16,fontWeight:700}}>{user.name}</p>
              <p style={{fontSize:12,color:"var(--text-muted)"}}>{user.email}</p>
              <p style={{fontSize:11,color:"var(--text-muted)"}}>Logged in: {user.loginTime}</p>
            </div>
          </div>
          <button className="btn btn-ghost" style={{fontSize:12}}
            onClick={()=>{
              localStorage.removeItem("mediguard_user");
              onLogout && onLogout();
            }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:16}}>
        {[
          { label:"Total Searches",    value:history.length,                              icon:"🔍", color:"var(--accent)"  },
          { label:"Symptoms Checked",  value:history.filter(h=>h.type==="symptom").length, icon:"🩺", color:"var(--accent2)" },
          { label:"Facts Verified",    value:history.filter(h=>h.type==="fact").length,    icon:"✅", color:"var(--warn)"    },
          { label:"Reports Analysed",  value:history.filter(h=>h.type==="report").length,  icon:"📋", color:"var(--purple)"  },
        ].map((s,i)=>(
          <div key={i} className="card" style={{padding:"14px",textAlign:"center"}}>
            <p style={{fontSize:20,marginBottom:4}}>{s.icon}</p>
            <p style={{fontFamily:"Syne",fontSize:24,fontWeight:800,color:s.color}}>{s.value}</p>
            <p style={{fontSize:10,color:"var(--text-muted)"}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* History List */}
      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
          <h3 style={{fontFamily:"Syne",fontSize:16,fontWeight:700}}>📋 Search History</h3>
          {history.length > 0 && (
            <button className="btn btn-ghost" style={{fontSize:12}} onClick={clearHistory}>
              🗑 Clear All
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {historyTypes.map(t=>(
            <button key={t.id}
              className={`btn ${activeTab===t.id?"btn-primary":"btn-ghost"}`}
              style={{fontSize:11,padding:"5px 12px"}}
              onClick={()=>setActiveTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div style={{textAlign:"center",padding:"30px"}}>
            <p style={{fontSize:36,marginBottom:12}}>📭</p>
            <p style={{color:"var(--text-muted)",fontSize:13}}>
              No history yet. Start using MediGuard AI features!
            </p>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtered.map((h,i)=>(
              <div key={i} style={{padding:"12px 14px",background:"rgba(255,255,255,0.02)",border:"1px solid var(--border)",borderRadius:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:6,marginBottom:4}}>
                  <span style={{fontFamily:"Syne",fontSize:13,fontWeight:700}}>
                    {h.type==="symptom"?"🩺":
                     h.type==="fact"?"🔍":
                     h.type==="drug"?"💊":
                     h.type==="report"?"📋":"🔗"} {h.query}
                  </span>
                  <span style={{fontSize:10,color:"var(--text-muted)",flexShrink:0}}>
                    {h.time}
                  </span>
                </div>
                <p style={{fontSize:12,color:"var(--text-muted)"}}>{h.result}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────
export default UserAuth;
export { HistoryPanel };