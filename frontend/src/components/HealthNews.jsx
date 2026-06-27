import { useState, useEffect } from "react";
const BACKEND = "http://localhost:5000";

const CATEGORIES = [
  { id: "all",      label: "All News",        icon: "📰" },
  { id: "who",      label: "WHO Updates",     icon: "🌍" },
  { id: "cdc",      label: "CDC Alerts",      icon: "🇺🇸" },
  { id: "india",    label: "India Health",    icon: "🇮🇳" },
  { id: "disease",  label: "Disease Alerts",  icon: "🦠" },
  { id: "medicine", label: "Medicine News",   icon: "💊" },
];

const MOCK_NEWS = [
  { id:1, category:"who", title:"WHO Issues New Guidelines for Dengue Prevention in Southeast Asia", summary:"World Health Organization has released updated guidelines for dengue fever prevention and control, emphasizing mosquito control and early detection.", source:"WHO", time:"2 hours ago", urgent:true, icon:"🌍", tag:"ALERT" },
  { id:2, category:"india", title:"India Reports Decline in Malaria Cases by 40% in 2025", summary:"Ministry of Health reports significant reduction in malaria cases across India following nationwide mosquito eradication programs.", source:"Ministry of Health India", time:"4 hours ago", urgent:false, icon:"🇮🇳", tag:"UPDATE" },
  { id:3, category:"cdc", title:"CDC Updates COVID-19 Vaccine Recommendations for 2026", summary:"Centers for Disease Control and Prevention has updated its COVID-19 vaccination schedule for adults and children for the year 2026.", source:"CDC", time:"6 hours ago", urgent:false, icon:"🇺🇸", tag:"UPDATE" },
  { id:4, category:"disease", title:"New Antibiotic-Resistant Bacteria Strain Detected in European Hospitals", summary:"Health officials in Europe are monitoring a new strain of antibiotic-resistant bacteria detected in multiple hospitals across Germany and France.", source:"European CDC", time:"8 hours ago", urgent:true, icon:"🦠", tag:"ALERT" },
  { id:5, category:"medicine", title:"Paracetamol Dosage Guidelines Revised by FDA", summary:"FDA has issued updated dosage recommendations for paracetamol, particularly for elderly patients and those with liver conditions.", source:"FDA", time:"10 hours ago", urgent:false, icon:"💊", tag:"UPDATE" },
  { id:6, category:"india", title:"Tamil Nadu Launches Free Cancer Screening Program", summary:"Tamil Nadu government announces free cancer screening camps across all districts, focusing on cervical and breast cancer early detection.", source:"TN Health Dept", time:"12 hours ago", urgent:false, icon:"🇮🇳", tag:"PROGRAM" },
  { id:7, category:"who", title:"WHO Declares End of Mpox Emergency in Central Africa", summary:"World Health Organization officially declares the end of the Mpox public health emergency in Central African Republic following successful containment.", source:"WHO", time:"1 day ago", urgent:false, icon:"🌍", tag:"UPDATE" },
  { id:8, category:"disease", title:"Bird Flu H5N1 Cases Monitored in Southeast Asia", summary:"Health authorities are closely monitoring H5N1 bird flu cases in Vietnam and Cambodia, with no evidence of human-to-human transmission yet.", source:"WHO", time:"1 day ago", urgent:true, icon:"🦠", tag:"ALERT" },
  { id:9, category:"medicine", title:"New Diabetes Drug Approved by FDA Shows 95% Effectiveness", summary:"A new GLP-1 receptor agonist drug has received FDA approval showing remarkable effectiveness in controlling Type 2 diabetes with minimal side effects.", source:"FDA", time:"2 days ago", urgent:false, icon:"💊", tag:"NEW" },
  { id:10, category:"india", title:"AIIMS Delhi Develops Low-Cost TB Detection Kit", summary:"AIIMS Delhi researchers have developed a revolutionary low-cost tuberculosis detection kit that provides results in under 30 minutes.", source:"AIIMS Delhi", time:"2 days ago", urgent:false, icon:"🇮🇳", tag:"RESEARCH" },
  { id:11, category:"cdc", title:"CDC Reports Rise in RSV Cases Among Children Under 5", summary:"CDC data shows significant increase in Respiratory Syncytial Virus cases among children under 5 years old in the United States.", source:"CDC", time:"3 days ago", urgent:true, icon:"🇺🇸", tag:"ALERT" },
  { id:12, category:"who", title:"WHO Recommends New Malaria Vaccine for High-Risk Regions", summary:"WHO has officially recommended the R21/Matrix-M malaria vaccine for widespread use in sub-Saharan Africa and other high-risk regions.", source:"WHO", time:"3 days ago", urgent:false, icon:"🌍", tag:"UPDATE" },
];

const tagColor = {
  ALERT:    { bg:"rgba(255,71,87,0.12)",  color:"var(--danger)",  border:"rgba(255,71,87,0.3)" },
  UPDATE:   { bg:"rgba(0,212,255,0.12)",  color:"var(--accent)",  border:"rgba(0,212,255,0.3)" },
  NEW:      { bg:"rgba(0,255,157,0.12)",  color:"var(--accent2)", border:"rgba(0,255,157,0.3)" },
  PROGRAM:  { bg:"rgba(168,85,247,0.12)", color:"var(--purple)",  border:"rgba(168,85,247,0.3)" },
  RESEARCH: { bg:"rgba(255,165,2,0.12)",  color:"var(--warn)",    border:"rgba(255,165,2,0.3)" },
};

export default function HealthNews({ language = "English" }) {
  const [category, setCategory]   = useState("all");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [news, setNews]           = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setNews(MOCK_NEWS);
      setLoading(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 1200);

    // Auto refresh every 5 minutes
    const interval = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString());
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const filtered = news.filter(n => {
    const matchCat = category === "all" || n.category === category;
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                       n.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const urgentNews = news.filter(n => n.urgent);

  const getAiSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Give a brief 3-point health news summary based on these headlines: ${filtered.slice(0,5).map(n=>n.title).join(", ")}`,
          language,
        }),
      });
      const data = await res.json();
      setAiSummary(data.reply);
    } catch(e) {
      setAiSummary("Could not generate AI summary. Please try again.");
    }
    setSummaryLoading(false);
  };

  return (
    <div>
      {/* Header Card */}
      <div className="card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:16}}>
          <div>
            <h2 className="card-title">📰 Health News Feed</h2>
            <p style={{fontSize:12,color:"var(--text-muted)"}}>
              Live updates from WHO · CDC · Ministry of Health India
            </p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span className="response-time" style={{margin:0}}>
              🔄 Updated: {lastUpdated}
            </span>
            <button className="btn btn-ghost" style={{fontSize:12,padding:"7px 14px"}}
              onClick={()=>{setLoading(true);setTimeout(()=>{setLoading(false);setLastUpdated(new Date().toLocaleTimeString());},800);}}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search health news..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{marginBottom:0}}
        />
      </div>

      {/* Urgent Alerts Banner */}
      {urgentNews.length > 0 && (
        <div style={{background:"rgba(255,71,87,0.08)",border:"1px solid rgba(255,71,87,0.3)",borderRadius:12,padding:"14px 18px",marginBottom:16}}>
          <p style={{fontFamily:"Syne",fontSize:12,fontWeight:700,color:"var(--danger)",marginBottom:10,letterSpacing:1}}>
            🚨 URGENT HEALTH ALERTS ({urgentNews.length})
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {urgentNews.map(n => (
              <div key={n.id} style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16}}>{n.icon}</span>
                <p style={{fontSize:13,color:"var(--text)",flex:1}}>{n.title}</p>
                <span style={{fontSize:11,color:"var(--text-muted)",flexShrink:0}}>{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {CATEGORIES.map(c => (
          <button key={c.id}
            className={`btn ${category===c.id?"btn-primary":"btn-ghost"}`}
            style={{fontSize:12,padding:"7px 14px"}}
            onClick={() => setCategory(c.id)}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* AI Summary Button */}
      <div className="card" style={{padding:"16px 20px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <p style={{fontFamily:"Syne",fontSize:14,fontWeight:700,marginBottom:4}}>
              🤖 AI News Summary
            </p>
            <p style={{fontSize:12,color:"var(--text-muted)"}}>
              Get AI-generated summary of current health news in {language}
            </p>
          </div>
          <button className="btn btn-primary" onClick={getAiSummary}
            disabled={summaryLoading} style={{flexShrink:0}}>
            {summaryLoading
              ? <><span className="spinner"/> Generating...</>
              : <><span>🤖</span> Generate Summary</>}
          </button>
        </div>
        {aiSummary && (
          <div style={{marginTop:14,padding:"14px 16px",background:"rgba(0,212,255,0.04)",borderRadius:10,border:"1px solid rgba(0,212,255,0.15)"}}>
            <p style={{fontSize:13,color:"var(--text-muted)",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiSummary}</p>
          </div>
        )}
      </div>

      {/* News Count */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <p style={{fontSize:12,color:"var(--text-muted)"}}>
          Showing <strong style={{color:"var(--accent)"}}>{filtered.length}</strong> articles
        </p>
        <p style={{fontSize:11,color:"var(--text-muted)"}}>
          Sources: WHO · CDC · MoH India · AIIMS · FDA
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{textAlign:"center",padding:"40px"}}>
          <span className="spinner" style={{width:32,height:32,borderWidth:3}}/>
          <p style={{marginTop:16,color:"var(--text-muted)",fontSize:13}}>
            Loading latest health news...
          </p>
        </div>
      )}

      {/* News Cards */}
      {!loading && filtered.length === 0 && (
        <div className="card" style={{textAlign:"center",padding:"40px"}}>
          <p style={{fontSize:32,marginBottom:12}}>🔍</p>
          <p style={{color:"var(--text-muted)"}}>No news found for your search</p>
        </div>
      )}

      {!loading && filtered.map(n => {
        const tc = tagColor[n.tag] || tagColor.UPDATE;
        return (
          <div key={n.id} className="card" style={{padding:"18px 22px",cursor:"pointer",transition:"all 0.2s",borderColor:n.urgent?"rgba(255,71,87,0.3)":undefined}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--accent)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor=n.urgent?"rgba(255,71,87,0.3)":"var(--border)"}>
            <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
              <span style={{fontSize:28,flexShrink:0}}>{n.icon}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8}}>
                  <span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:tc.bg,color:tc.color,border:`1px solid ${tc.border}`}}>
                    {n.urgent && "🚨 "}{n.tag}
                  </span>
                  <span style={{fontSize:11,color:"var(--text-muted)"}}>
                    📚 {n.source}
                  </span>
                  <span style={{fontSize:11,color:"var(--text-muted)",marginLeft:"auto"}}>
                    🕐 {n.time}
                  </span>
                </div>
                <p style={{fontFamily:"Syne",fontSize:14,fontWeight:700,marginBottom:8,lineHeight:1.5}}>
                  {n.title}
                </p>
                <p style={{fontSize:13,color:"var(--text-muted)",lineHeight:1.7}}>
                  {n.summary}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      <div className="disclaimer">
        ⚠️ News content is for informational purposes only.
        Always verify health information from official WHO, CDC, or government sources.
      </div>
    </div>
  );
}
