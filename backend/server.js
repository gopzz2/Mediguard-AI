const express = require("express");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
require("dotenv").config();

const app = express();

// ─── CORS FIX — Allow Vercel + localhost ─────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://mediguard-h0da7l5fb-gopika1.vercel.app",
    "https://*.vercel.app",
  ],
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

// ─── HEALTH CHECK ROUTE ───────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "ok", message: "MediGuard AI Backend Running!" }));
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// ─── EMERGENCY KEYWORDS ───────────────────────────────────────────────────────
const EMERGENCY_KEYWORDS = [
  "chest pain","heart attack","breathing difficulty","can't breathe","shortness of breath",
  "unconscious","not breathing","stroke","paralysis","severe bleeding","coughing blood",
  "vomiting blood","seizure","convulsion","anaphylaxis","allergic reaction","overdose",
  "poisoning","suicide","chest tightness","sweating chest","arm pain","jaw pain",
  "sudden headache","vision loss","sudden numbness","face drooping","slurred speech"
];

function detectEmergency(text) {
  const lower = text.toLowerCase();
  const found = EMERGENCY_KEYWORDS.filter(k => lower.includes(k));
  return { isEmergency: found.length > 0, keywords: found };
}

// ─── MEDICAL DATABASES ────────────────────────────────────────────────────────
const MEDICINE_DB = {
  "paracetamol": { generic:"Paracetamol", brand:["Dolo 650","Crocin","Calpol"], category:"Analgesic/Antipyretic", dosage:"500-1000mg every 6hrs", maxDose:"4g/day", prescription:false, fdaApproved:true },
  "aspirin":     { generic:"Aspirin",     brand:["Ecosprin","Disprin"],          category:"NSAID/Antiplatelet",   dosage:"75-325mg daily",       maxDose:"4g/day",   prescription:false, fdaApproved:true },
  "metformin":   { generic:"Metformin",   brand:["Glycomet","Glucophage"],       category:"Antidiabetic",         dosage:"500-2000mg daily",     maxDose:"2550mg/day",prescription:true, fdaApproved:true },
  "amoxicillin": { generic:"Amoxicillin", brand:["Mox","Novamox"],               category:"Antibiotic",           dosage:"250-500mg every 8hrs", maxDose:"3g/day",   prescription:true,  fdaApproved:true },
  "ibuprofen":   { generic:"Ibuprofen",   brand:["Brufen","Advil"],              category:"NSAID",                dosage:"200-400mg every 6hrs", maxDose:"1200mg/day",prescription:false, fdaApproved:true },
  "omeprazole":  { generic:"Omeprazole",  brand:["Omez","Prilosec"],             category:"Proton Pump Inhibitor",dosage:"20-40mg once daily",   maxDose:"80mg/day", prescription:false, fdaApproved:true },
  "atorvastatin":{ generic:"Atorvastatin",brand:["Lipitor","Atorva"],            category:"Statin",               dosage:"10-80mg once daily",   maxDose:"80mg/day", prescription:true,  fdaApproved:true },
  "cetirizine":  { generic:"Cetirizine",  brand:["Cetzine","Zyrtec"],            category:"Antihistamine",        dosage:"10mg once daily",      maxDose:"10mg/day", prescription:false, fdaApproved:true },
};

const DISEASE_DB = {
  "diabetes":     { fullName:"Diabetes Mellitus",      type:"Chronic",    icdCode:"E11", symptoms:["frequent urination","excessive thirst","weight loss","blurred vision","fatigue"],        treatment:["Metformin","Insulin","Diet control","Exercise"],       prevention:["Healthy diet","Regular exercise","Weight management"] },
  "hypertension": { fullName:"Hypertension (High BP)", type:"Chronic",    icdCode:"I10", symptoms:["headache","dizziness","chest pain","shortness of breath"],                               treatment:["ACE inhibitors","Beta blockers","Lifestyle changes"],   prevention:["Low salt diet","Exercise","Stress management"] },
  "dengue":       { fullName:"Dengue Fever",           type:"Infectious", icdCode:"A90", symptoms:["high fever","severe headache","eye pain","muscle pain","rash","mild bleeding"],          treatment:["Rest","Fluids","Paracetamol","NO aspirin/ibuprofen"],  prevention:["Mosquito repellent","Eliminate standing water"] },
  "tuberculosis": { fullName:"Tuberculosis (TB)",      type:"Infectious", icdCode:"A15", symptoms:["persistent cough","blood in cough","night sweats","weight loss","fever"],                treatment:["DOTS therapy","Rifampicin","Isoniazid"],               prevention:["BCG vaccine","Avoid close contact","Good ventilation"] },
  "malaria":      { fullName:"Malaria",                type:"Infectious", icdCode:"B50", symptoms:["cyclical fever","chills","sweating","headache","vomiting"],                              treatment:["Artemisinin-based therapy","Chloroquine"],             prevention:["Mosquito nets","Repellents","Prophylactic medicines"] },
};

const DRUG_INTERACTIONS_DB = {
  "aspirin+warfarin":    { severity:"Contraindicated", effect:"Severe bleeding risk — internal hemorrhage possible",  mechanism:"Both inhibit clotting pathways" },
  "aspirin+ibuprofen":   { severity:"Major",           effect:"Reduces aspirin heart protection, increases GI bleeding", mechanism:"Competitive COX-1 inhibition" },
  "metformin+alcohol":   { severity:"Major",           effect:"Lactic acidosis risk — potentially fatal",            mechanism:"Both increase lactic acid production" },
  "paracetamol+alcohol": { severity:"Major",           effect:"Severe liver damage (hepatotoxicity)",                mechanism:"Alcohol increases toxic paracetamol metabolite" },
  "ibuprofen+naproxen":  { severity:"Moderate",        effect:"Increased GI bleeding and kidney damage",            mechanism:"Additive NSAID effects" },
  "cetirizine+alcohol":  { severity:"Moderate",        effect:"Increased drowsiness",                               mechanism:"CNS depression is additive" },
};

// ─── GROQ API CALL ────────────────────────────────────────────────────────────
async function callGroq(systemPrompt, userMessage) {
  const start = Date.now();
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type":"application/json", Authorization:`Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role:"system", content:systemPrompt }, { role:"user", content:userMessage }],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Groq API error");
  return { content: data.choices[0].message.content, responseTime: Date.now() - start };
}

// ─── 1. SYMPTOM ANALYSER ─────────────────────────────────────────────────────
app.post("/api/symptom-analyse", async (req, res) => {
  const { symptoms, language = "English" } = req.body;
  if (!symptoms) return res.status(400).json({ error:"Symptoms required" });
  const emergency = detectEmergency(symptoms);
  const matchedDiseases = Object.entries(DISEASE_DB)
    .filter(([, val]) => val.symptoms.some(s => symptoms.toLowerCase().includes(s.toLowerCase())))
    .map(([key, val]) => ({ key, ...val }));
  const system = `You are a medical AI assistant trained on PubMed, WHO, CDC. If symptoms indicate emergency flag as EMERGENCY. Respond ONLY with valid JSON in ${language}:
{"possibleConditions":[{"name":"string","likelihood":"High|Moderate|Low","description":"string"}],"recommendations":["string"],"urgencyLevel":"Emergency|High|Moderate|Low","sources":["string"],"disclaimer":"string","confidenceScore":0,"emergencyAction":"string or null"}`;
  try {
    const { content, responseTime } = await callGroq(system, `Symptoms: ${symptoms}`);
    const json = JSON.parse(content);
    json.responseTime = responseTime;
    json.isEmergency = emergency.isEmergency;
    json.emergencyKeywords = emergency.keywords;
    json.databaseMatches = matchedDiseases.slice(0, 2);
    if (emergency.isEmergency) json.urgencyLevel = "Emergency";
    res.json(json);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── 2. FACT CHECKER ─────────────────────────────────────────────────────────
app.post("/api/fact-check", async (req, res) => {
  const { text, language = "English" } = req.body;
  if (!text) return res.status(400).json({ error:"Text required" });
  const system = `You are a medical fact-checking AI using PubMed, WHO, CDC, MedlinePlus. Respond ONLY with valid JSON in ${language}:
{"verdict":"TRUE|FALSE|MISLEADING|UNVERIFIABLE|OUTDATED","confidence":0,"explanation":"string","corrections":["string"],"sources":["string"],"riskLevel":"Safe|Caution|Dangerous","evidenceStrength":"Strong|Moderate|Weak|None","label":"string"}`;
  try {
    const { content, responseTime } = await callGroq(system, `Check: ${text}`);
    const json = JSON.parse(content);
    json.responseTime = responseTime;
    res.json(json);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── 3. URL CHECKER ──────────────────────────────────────────────────────────
app.post("/api/url-check", async (req, res) => {
  const { url, tabletName, language = "English" } = req.body;
  if (!url) return res.status(400).json({ error:"URL required" });
  const dbMatch = tabletName ? MEDICINE_DB[tabletName.toLowerCase().split(" ")[0]] || null : null;
  const system = `You are a medical website safety AI. Respond ONLY with valid JSON in ${language}:
{"urlSafety":"Safe|Suspicious|Dangerous|Unknown","urlAnalysis":"string","medicineInfo":{"name":"string","verified":true,"uses":["string"],"sideEffects":["string"],"warnings":["string"],"legitimacyScore":0,"fdaApproved":true},"recommendation":"string","redFlags":["string"],"sources":["string"]}`;
  try {
    const { content, responseTime } = await callGroq(system, `URL: ${url}${tabletName ? `\nMedicine: ${tabletName}` : ""}`);
    const json = JSON.parse(content);
    json.responseTime = responseTime;
    if (dbMatch) json.databaseInfo = dbMatch;
    res.json(json);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── 4. WHATSAPP DETECTOR ────────────────────────────────────────────────────
app.post("/api/whatsapp-check", async (req, res) => {
  const { message, language = "English" } = req.body;
  if (!message) return res.status(400).json({ error:"Message required" });
  const system = `You are an AI detecting fake health info on WhatsApp. Respond ONLY with valid JSON in ${language}:
{"verdict":"REAL|FAKE|MISLEADING|PARTIALLY_TRUE","confidence":0,"title":"string","explanation":"string","dangerLevel":"Safe|Moderate|Dangerous|Extremely Dangerous","corrections":["string"],"sources":["string"],"commonInIndia":true,"shareAdvice":"string"}`;
  try {
    const { content, responseTime } = await callGroq(system, `WhatsApp message: ${message}`);
    const json = JSON.parse(content);
    json.responseTime = responseTime;
    res.json(json);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── 5. DRUG INTERACTION ─────────────────────────────────────────────────────
app.post("/api/drug-interaction", async (req, res) => {
  const { medicines, language = "English" } = req.body;
  if (!medicines || medicines.length < 2) return res.status(400).json({ error:"At least 2 medicines required" });
  const dbInteractions = [];
  for (let i = 0; i < medicines.length; i++) {
    for (let j = i + 1; j < medicines.length; j++) {
      const key1 = `${medicines[i].toLowerCase()}+${medicines[j].toLowerCase()}`;
      const key2 = `${medicines[j].toLowerCase()}+${medicines[i].toLowerCase()}`;
      const found = DRUG_INTERACTIONS_DB[key1] || DRUG_INTERACTIONS_DB[key2];
      if (found) dbInteractions.push({ drug1:medicines[i], drug2:medicines[j], ...found });
    }
  }
  const system = `You are a pharmacology AI. Respond ONLY with valid JSON in ${language}:
{"overallSafety":"Safe|Caution|Dangerous|Contraindicated","interactionScore":0,"interactions":[{"drug1":"string","drug2":"string","severity":"None|Minor|Moderate|Major|Contraindicated","effect":"string","mechanism":"string"}],"recommendations":["string"],"alternatives":["string"],"sources":["string"],"consultDoctor":true}`;
  try {
    const { content, responseTime } = await callGroq(system, `Medicines: ${medicines.join(", ")}`);
    const json = JSON.parse(content);
    json.responseTime = responseTime;
    if (dbInteractions.length > 0) {
      json.databaseInteractions = dbInteractions;
      if (dbInteractions.some(i => i.severity === "Contraindicated")) json.overallSafety = "Contraindicated";
    }
    res.json(json);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── 6. MEDICINE SCANNER ─────────────────────────────────────────────────────
app.post("/api/medicine-scan", async (req, res) => {
  const { medicineName, additionalInfo, language = "English" } = req.body;
  if (!medicineName) return res.status(400).json({ error:"Medicine name required" });
  const dbMatch = MEDICINE_DB[medicineName.toLowerCase().split(" ")[0]] || null;
  const system = `You are a medicine scanning AI. Respond ONLY with valid JSON in ${language}:
{"name":"string","genericName":"string","manufacturer":"string","category":"string","uses":["string"],"dosage":"string","sideEffects":["string"],"warnings":["string"],"interactions":["string"],"storage":"string","prescription":true,"fdaApproved":true,"safetyScore":0,"expiryAdvice":"string","sources":["string"]}`;
  try {
    const { content, responseTime } = await callGroq(system, `Medicine: ${medicineName}. Extra: ${additionalInfo || "none"}`);
    const json = JSON.parse(content);
    json.responseTime = responseTime;
    if (dbMatch) json.databaseInfo = dbMatch;
    res.json(json);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── 7. HEALTH REPORT ────────────────────────────────────────────────────────
app.post("/api/generate-report", async (req, res) => {
  const { reportData, language = "English" } = req.body;
  if (!reportData) return res.status(400).json({ error:"Report data required" });
  const system = `You are a medical report generator AI. Respond ONLY with valid JSON in ${language}:
{"reportTitle":"string","patientSummary":"string","keyFindings":["string"],"riskAssessment":"Low|Moderate|High|Critical","recommendations":["string"],"lifestyle":["string"],"followUp":"string","disclaimer":"string"}`;
  try {
    const { content, responseTime } = await callGroq(system, `Generate report: ${JSON.stringify(reportData)}`);
    const json = JSON.parse(content);
    json.responseTime = responseTime;
    res.json(json);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── 8. CHATBOT ──────────────────────────────────────────────────────────────
app.post("/api/chatbot", async (req, res) => {
  const { message, history = [], language = "English" } = req.body;
  if (!message) return res.status(400).json({ error:"Message required" });
  const emergency = detectEmergency(message);
  const system = `You are MediBot, friendly AI medical assistant inside MediGuard AI. Always respond in ${language}. If emergency symptoms mentioned say call 108 immediately. Be friendly, concise. Always add disclaimer to consult doctor.`;
  const messages = [{ role:"system", content:system }, ...history.slice(-10), { role:"user", content:message }];
  try {
    const start = Date.now();
    const r = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model:MODEL, messages, temperature:0.5, max_tokens:800 }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error?.message || "Groq API error");
    res.json({ reply:data.choices[0].message.content, responseTime:Date.now()-start, isEmergency:emergency.isEmergency });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── 9. REPORT ANALYSIS ──────────────────────────────────────────────────────
app.post("/api/report-analysis", async (req, res) => {
  const { reportText, reportType, language = "English" } = req.body;
  if (!reportText) return res.status(400).json({ error:"Report text required" });
  const system = `You are a medical report analysis AI for ${reportType} reports. Analyse values and identify abnormal readings. Respond ONLY with valid JSON in ${language}:
{"reportType":"string","summary":"string","findings":[{"parameter":"string","value":"string","normalRange":"string","status":"Normal|Low|High|Critical","interpretation":"string"}],"abnormalCount":0,"criticalCount":0,"overallHealth":"Normal|Mild Concern|Moderate Concern|Critical","possibleConditions":["string"],"recommendations":["string"],"urgentAction":"string or null","followUp":"string","sources":["string"]}`;
  try {
    const { content, responseTime } = await callGroq(system, `Analyse ${reportType}:\n${reportText}`);
    const json = JSON.parse(content);
    json.responseTime = responseTime;
    json.isEmergency = json.criticalCount > 0;
    res.json(json);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── 10. EMAIL REPORT ────────────────────────────────────────────────────────
app.post("/api/send-report", async (req, res) => {
  const { toEmail, patientName, reportContent, reportType } = req.body;
  if (!toEmail || !reportContent) return res.status(400).json({ error:"Email and report required" });
  try {
    const nodemailer  = require("nodemailer");
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: { user:process.env.EMAIL_USER, pass:process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from:    `MediGuard AI <${process.env.EMAIL_USER}>`,
      to:      toEmail,
      subject: `🏥 MediGuard AI — ${reportType || "Health"} Report for ${patientName || "Patient"}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <div style="background:linear-gradient(135deg,#004080,#006994);padding:24px;border-radius:12px;margin-bottom:20px;text-align:center">
            <h1 style="color:#fff;margin:0">⚕ MediGuard AI</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px">AI-Powered Health Report</p>
          </div>
          <div style="background:#f8f9fa;padding:20px;border-radius:10px;margin-bottom:16px">
            <p style="margin:0 0 8px;font-size:13px;color:#555">Patient: <strong>${patientName || "N/A"}</strong></p>
            <p style="margin:0 0 16px;font-size:13px;color:#555">Generated: <strong>${new Date().toLocaleString()}</strong></p>
            <hr style="border:none;border-top:1px solid #dee2e6;margin:16px 0"/>
            <pre style="font-size:13px;color:#333;line-height:1.8;white-space:pre-wrap;font-family:Arial">${reportContent}</pre>
          </div>
          <div style="background:#fff3cd;padding:12px 16px;border-radius:8px;font-size:12px;color:#856404">
            ⚠️ This report is AI-generated for informational purposes only. Always consult a licensed medical professional.
          </div>
          <p style="text-align:center;font-size:11px;color:#999;margin-top:16px">Sent by MediGuard AI · Powered by Groq LLaMA 3.3 70B</p>
        </div>
      `,
    });
    res.json({ success:true, message:"Report sent successfully!" });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// ─── 11. DATABASE SEARCH ─────────────────────────────────────────────────────
app.get("/api/database/medicine/:name", (req, res) => {
  const result = MEDICINE_DB[req.params.name.toLowerCase()];
  result ? res.json({ found:true, data:result }) : res.json({ found:false, message:"Not in local database" });
});

app.get("/api/database/disease/:name", (req, res) => {
  const result = DISEASE_DB[req.params.name.toLowerCase()];
  result ? res.json({ found:true, data:result }) : res.json({ found:false, message:"Not in local database" });
});

// ─── KEEP ALIVE — Prevent Render from sleeping ────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ MediGuard AI v4 running on port ${PORT}`);

  // Ping every 14 minutes to prevent Render sleep
  if (process.env.RENDER_EXTERNAL_URL) {
    setInterval(() => {
      fetch(`${process.env.RENDER_EXTERNAL_URL}/health`)
        .then(() => console.log("✅ Keep alive ping sent"))
        .catch(() => console.log("Keep alive ping failed"));
    }, 840000);
  }
});