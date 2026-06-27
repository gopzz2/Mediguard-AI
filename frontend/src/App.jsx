// import { useState } from "react";
// import SymptomAnalyser from "./components/SymptomAnalyser";
// import FactChecker from "./components/FactChecker";
// import UrlChecker from "./components/UrlChecker";
// import WhatsAppDetector from "./components/WhatsAppDetector";
// import DrugInteraction from "./components/DrugInteraction";
// import MedicineScanner from "./components/MedicineScanner";
// import HealthReport from "./components/HealthReport";
// import MediBot from "./components/MediBot";
// import "./App.css";

// const LANGUAGES = ["English","Tamil","Hindi","Telugu","Malayalam","Kannada","Bengali","Marathi","Gujarati","Punjabi","Urdu","French","Spanish","Arabic","Chinese","Japanese","German"];

// const tabs = [
//   { id:"symptom",  label:"Symptom Analyser",  icon:"🩺" },
//   { id:"fact",     label:"Fact Checker",       icon:"🔍" },
//   { id:"url",      label:"URL & Tablet",       icon:"🔗" },
//   { id:"whatsapp", label:"WhatsApp Detector",  icon:"📱" },
//   { id:"drug",     label:"Drug Interaction",   icon:"💊" },
//   { id:"scanner",  label:"Medicine Scanner",   icon:"📷" },
//   { id:"report",   label:"Health Report",      icon:"📄" },
//   { id:"chatbot",  label:"MediBot AI",         icon:"🤖" },
// ];

// export default function App() {
//   const [activeTab, setActiveTab] = useState("symptom");
//   const [language, setLanguage]   = useState("English");
//   const [langOpen, setLangOpen]   = useState(false);

//   return (
//     <div className="app">
//       <div className="bg-grid"/><div className="bg-glow"/>
//       <header className="header">
//         <div className="header-inner">
//           <div className="logo">
//             <span className="logo-icon">⚕</span>
//             <div>
//               <h1 className="logo-title">MediGuard AI</h1>
//               <p className="logo-sub">AI-Powered Medical Misinformation Detection System</p>
//             </div>
//           </div>
//           <div style={{display:"flex",gap:10,alignItems:"center"}}>
//             <div style={{position:"relative"}}>
//               <button className="lang-btn" onClick={()=>setLangOpen(o=>!o)}>🌐 {language} ▾</button>
//               {langOpen&&(
//                 <div className="lang-dropdown">
//                   {LANGUAGES.map(l=>(
//                     <button key={l} className={`lang-option${language===l?" active":""}`} onClick={()=>{setLanguage(l);setLangOpen(false);}}>
//                       {l}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//             <span className="header-badge"><span className="dot"/> Groq · LLaMA 3.3 70B</span>
//           </div>
//         </div>
//       </header>

//       <nav className="tab-nav">
//         <div className="tab-nav-inner">
//           {tabs.map(t=>(
//             <button key={t.id} className={`tab-btn${activeTab===t.id?" active":""}`} onClick={()=>setActiveTab(t.id)}>
//               <span className="tab-icon">{t.icon}</span>
//               <span className="tab-label">{t.label}</span>
//             </button>
//           ))}
//         </div>
//       </nav>

//       {language!=="English"&&(
//         <div style={{background:"rgba(0,212,255,0.06)",borderBottom:"1px solid rgba(0,212,255,0.15)",padding:"6px 32px",fontSize:12,color:"var(--accent)",textAlign:"center"}}>
//           🌐 AI responses will be in <strong>{language}</strong>
//         </div>
//       )}

//       <main className="main">
//         {activeTab==="symptom"  && <SymptomAnalyser language={language}/>}
//         {activeTab==="fact"     && <FactChecker language={language}/>}
//         {activeTab==="url"      && <UrlChecker language={language}/>}
//         {activeTab==="whatsapp" && <WhatsAppDetector language={language}/>}
//         {activeTab==="drug"     && <DrugInteraction language={language}/>}
//         {activeTab==="scanner"  && <MedicineScanner language={language}/>}
//         {activeTab==="report"   && <HealthReport language={language}/>}
//         {activeTab==="chatbot"  && <MediBot language={language}/>}
//       </main>

//       <footer className="footer">
//         <p>⚠️ MediGuard AI is for informational purposes only. Always consult a licensed physician.</p>
//         <p style={{marginTop:4,fontSize:11}}>Sources: PubMed · WHO · CDC · FDA · MedlinePlus</p>
//       </footer>
//     </div>
//   );
// }
import { useState } from "react";
import SymptomAnalyser from "./components/SymptomAnalyser";
import FactChecker from "./components/FactChecker";
import UrlChecker from "./components/UrlChecker";
import WhatsAppDetector from "./components/WhatsAppDetector";
import DrugInteraction from "./components/DrugInteraction";
import MedicineScanner from "./components/MedicineScanner";
import HealthNews from "./components/HealthNews";
import HospitalMap from "./components/HospitalMap";
// import UserAuth, { HistoryPanel } from "./components/UserAuth";
import UserAuth from "./components/UserAuth";
import { HistoryPanel } from "./components/UserAuth";
import HealthReport from "./components/HealthReport";
import MediBot from "./components/MediBot";
import ReportAnalysis from "./components/ReportAnalysis";
import "./App.css";

const LANGUAGES = ["English","Tamil","Hindi","Telugu","Malayalam","Kannada","Bengali","Marathi","Gujarati","Punjabi","Urdu","French","Spanish","Arabic","Chinese","Japanese","German"];

const tabs = [
  { id:"symptom",  label:"Symptom Analyser",  icon:"🩺" },
  { id:"fact",     label:"Fact Checker",       icon:"🔍" },
  { id:"url",      label:"URL & Tablet",       icon:"🔗" },
  { id:"whatsapp", label:"WhatsApp Detector",  icon:"📱" },
  { id:"drug",     label:"Drug Interaction",   icon:"💊" },
  { id:"scanner",  label:"Medicine Scanner",   icon:"📷" },
  { id:"news",     label:"Health News",    icon:"📰" },
  { id:"hospital", label:"Hospital Map",   icon:"🗺️" },
  { id:"profile",  label:"My Profile",     icon:"👤" },
  { id:"report",   label:"Health Report",      icon:"📄" },
  { id:"analysis", label:"Report Analysis",    icon:"📋" },
  { id:"chatbot",  label:"MediBot AI",         icon:"🤖" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("symptom");
  const [language, setLanguage]   = useState("English");
  const [langOpen, setLangOpen]   = useState(false);
  const [user, setUser] = useState(()=>{
  const saved = localStorage.getItem("mediguard_user");
  return saved ? JSON.parse(saved) : null;
});

  return (
    <div className="app">
      <div className="bg-grid"/><div className="bg-glow"/>

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⚕</span>
            <div>
              <h1 className="logo-title">MediGuard AI</h1>
              <p className="logo-sub">AI-Powered Medical Misinformation Detection System</p>
            </div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{position:"relative"}}>
              <button className="lang-btn" onClick={()=>setLangOpen(o=>!o)}>
                🌐 {language} ▾
              </button>
              {langOpen && (
                <div className="lang-dropdown">
                  {LANGUAGES.map(l=>(
                    <button key={l}
                      className={`lang-option${language===l?" active":""}`}
                      onClick={()=>{setLanguage(l);setLangOpen(false);}}>
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="header-badge">
              <span className="dot"/> Groq · LLaMA 3.3 70B
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="tab-nav">
        <div className="tab-nav-inner">
          {tabs.map(t=>(
            <button key={t.id}
              className={`tab-btn${activeTab===t.id?" active":""}`}
              onClick={()=>setActiveTab(t.id)}>
              <span className="tab-icon">{t.icon}</span>
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Language banner */}
      {language!=="English" && (
        <div style={{background:"rgba(0,212,255,0.06)",borderBottom:"1px solid rgba(0,212,255,0.15)",padding:"6px 32px",fontSize:12,color:"var(--accent)",textAlign:"center"}}>
          🌐 AI responses will be in <strong>{language}</strong>
        </div>
      )}

      {/* Main Content */}
      <main className="main">
        {activeTab==="symptom"  && <SymptomAnalyser language={language}/>}
        {activeTab==="fact"     && <FactChecker language={language}/>}
        {activeTab==="url"      && <UrlChecker language={language}/>}
        {activeTab==="whatsapp" && <WhatsAppDetector language={language}/>}
        {activeTab==="drug"     && <DrugInteraction language={language}/>}
        {activeTab==="scanner"  && <MedicineScanner language={language}/>}
        {activeTab==="report"   && <HealthReport language={language}/>}
        {activeTab==="analysis" && <ReportAnalysis language={language}/>}
        {activeTab==="chatbot"  && <MediBot language={language}/>}
        {activeTab==="news"     && <HealthNews language={language}/>}
        {activeTab==="hospital" && <HospitalMap language={language}/>}
        {activeTab==="profile"  && (
               user
                    ? <HistoryPanel user={user} onLogout={()=>setUser(null)}/>
                    : <UserAuth onLogin={u=>setUser(u)}/>
                    )}
      </main>

      <footer className="footer">
        <p>⚠️ MediGuard AI is for informational purposes only. Always consult a licensed physician.</p>
        <p style={{marginTop:4,fontSize:11}}>
          Sources: PubMed · WHO · CDC · FDA · MedlinePlus · MediGuard Medical Database
        </p>
      </footer>
    </div>
  );
}