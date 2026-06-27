// // const express = require("express");
// // const cors = require("cors");
// // const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
// // require("dotenv").config();

// // const app = express();
// // app.use(cors());
// // app.use(express.json());

// // const GROQ_API_KEY = process.env.GROQ_API_KEY;
// // const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// // const MODEL = "llama-3.3-70b-versatile";

// // async function callGroq(systemPrompt, userMessage) {
// //   const start = Date.now();
// //   const res = await fetch(GROQ_URL, {
// //     method: "POST",
// //     headers: {
// //       "Content-Type": "application/json",
// //       Authorization: `Bearer ${GROQ_API_KEY}`,
// //     },
// //     body: JSON.stringify({
// //       model: MODEL,
// //       messages: [
// //         { role: "system", content: systemPrompt },
// //         { role: "user", content: userMessage },
// //       ],
// //       temperature: 0.3,
// //       max_tokens: 1024,
// //     }),
// //   });
// //   const data = await res.json();
// //   const responseTime = Date.now() - start;
// //   if (!res.ok) throw new Error(data.error?.message || "Groq API error");
// //   return { content: data.choices[0].message.content, responseTime };
// // }

// // // ─── 1. SYMPTOM ANALYSER ──────────────────────────────────────────────────────
// // app.post("/api/symptom-analyse", async (req, res) => {
// //   const { symptoms } = req.body;
// //   if (!symptoms) return res.status(400).json({ error: "Symptoms required" });

// //   const system = `You are a medical AI assistant trained on PubMed, WHO, and CDC medical literature. 
// // Analyse the user's symptoms and respond ONLY with valid JSON:
// // {
// //   "possibleConditions": [
// //     { "name": "string", "likelihood": "High|Moderate|Low", "description": "string" }
// //   ],
// //   "recommendations": ["string"],
// //   "urgencyLevel": "Emergency|High|Moderate|Low",
// //   "sources": ["WHO Guidelines", "CDC Health Topics", "PubMed Medical Database"],
// //   "disclaimer": "string",
// //   "confidenceScore": 0-100
// // }
// // Do not include markdown or text outside the JSON.`;

// //   try {
// //     const { content, responseTime } = await callGroq(system, `Symptoms: ${symptoms}`);
// //     const json = JSON.parse(content);
// //     json.responseTime = responseTime;
// //     res.json(json);
// //   } catch (e) {
// //     res.status(500).json({ error: e.message });
// //   }
// // });

// // // ─── 2. FACT CHECKER (Multi-Label: True/False/Misleading/Unverifiable/Outdated) ─
// // app.post("/api/fact-check", async (req, res) => {
// //   const { text } = req.body;
// //   if (!text) return res.status(400).json({ error: "Text required" });

// //   const system = `You are a medical fact-checking AI using PubMed, WHO, CDC, and MedlinePlus knowledge bases.
// // Analyse the given medical claim and respond ONLY with valid JSON:
// // {
// //   "verdict": "TRUE|FALSE|MISLEADING|UNVERIFIABLE|OUTDATED",
// //   "confidence": 0-100,
// //   "explanation": "string - detailed explanation",
// //   "corrections": ["string"],
// //   "sources": ["PubMed ID or WHO/CDC doc name"],
// //   "riskLevel": "Safe|Caution|Dangerous",
// //   "evidenceStrength": "Strong|Moderate|Weak|None",
// //   "label": "True Claim|False Claim|Misleading Information|Unverifiable Claim|Outdated Information"
// // }
// // Verdict guide:
// // - TRUE: Supported by strong medical evidence
// // - FALSE: Contradicted by medical evidence  
// // - MISLEADING: Partially true but distorted/exaggerated
// // - UNVERIFIABLE: Cannot be confirmed or denied with current evidence
// // - OUTDATED: Was true before but newer guidelines changed it
// // Do not include markdown or text outside the JSON.`;

// //   try {
// //     const { content, responseTime } = await callGroq(system, `Check this medical claim: ${text}`);
// //     const json = JSON.parse(content);
// //     json.responseTime = responseTime;
// //     res.json(json);
// //   } catch (e) {
// //     res.status(500).json({ error: e.message });
// //   }
// // });

// // // ─── 3. URL & TABLET CHECKER ──────────────────────────────────────────────────
// // app.post("/api/url-check", async (req, res) => {
// //   const { url, tabletName } = req.body;
// //   if (!url) return res.status(400).json({ error: "URL required" });

// //   const system = `You are a medical website safety and medicine verification AI using WHO, CDC, FDA and MedlinePlus references.
// // Respond ONLY with valid JSON:
// // {
// //   "urlSafety": "Safe|Suspicious|Dangerous|Unknown",
// //   "urlAnalysis": "string",
// //   "medicineInfo": {
// //     "name": "string",
// //     "verified": true|false,
// //     "uses": ["string"],
// //     "sideEffects": ["string"],
// //     "warnings": ["string"],
// //     "legitimacyScore": 0-100,
// //     "fdaApproved": true|false
// //   },
// //   "recommendation": "string",
// //   "redFlags": ["string"],
// //   "sources": ["FDA Drug Database", "WHO Essential Medicines", "MedlinePlus"]
// // }
// // Do not include markdown or text outside the JSON.`;

// //   try {
// //     const { content, responseTime } = await callGroq(
// //       system,
// //       `URL: ${url}${tabletName ? `\nTablet/Medicine: ${tabletName}` : ""}`
// //     );
// //     const json = JSON.parse(content);
// //     json.responseTime = responseTime;
// //     res.json(json);
// //   } catch (e) {
// //     res.status(500).json({ error: e.message });
// //   }
// // });

// // // ─── 4. WHATSAPP FAKE HEALTH FORWARD DETECTOR ────────────────────────────────
// // app.post("/api/whatsapp-check", async (req, res) => {
// //   const { message } = req.body;
// //   if (!message) return res.status(400).json({ error: "Message required" });

// //   const system = `You are an AI that detects fake health information commonly shared on WhatsApp and social media in India and globally.
// // Use PubMed, WHO, CDC, and MedlinePlus knowledge to verify claims.
// // Respond ONLY with valid JSON:
// // {
// //   "verdict": "REAL|FAKE|MISLEADING|PARTIALLY_TRUE",
// //   "confidence": 0-100,
// //   "title": "short summary of the claim",
// //   "explanation": "string - why is it real or fake",
// //   "dangerLevel": "Safe|Moderate|Dangerous|Extremely Dangerous",
// //   "corrections": ["string - what the truth actually is"],
// //   "sources": ["string - WHO/CDC/PubMed reference"],
// //   "commonInIndia": true|false,
// //   "shareAdvice": "string - what to tell people who share this"
// // }
// // Be strict — medical misinformation on WhatsApp can kill people.
// // Do not include markdown or text outside the JSON.`;

// //   try {
// //     const { content, responseTime } = await callGroq(
// //       system,
// //       `Check this WhatsApp health message: ${message}`
// //     );
// //     const json = JSON.parse(content);
// //     json.responseTime = responseTime;
// //     res.json(json);
// //   } catch (e) {
// //     res.status(500).json({ error: e.message });
// //   }
// // });

// // // ─── 5. DRUG INTERACTION CHECKER ─────────────────────────────────────────────
// // app.post("/api/drug-interaction", async (req, res) => {
// //   const { medicines } = req.body;
// //   if (!medicines || medicines.length < 2)
// //     return res.status(400).json({ error: "At least 2 medicines required" });

// //   const system = `You are a pharmacology AI trained on FDA drug interaction databases, PubMed, and WHO medicine guidelines.
// // Analyse drug interactions and respond ONLY with valid JSON:
// // {
// //   "overallSafety": "Safe|Caution|Dangerous|Contraindicated",
// //   "interactionScore": 0-100,
// //   "interactions": [
// //     {
// //       "drug1": "string",
// //       "drug2": "string", 
// //       "severity": "None|Minor|Moderate|Major|Contraindicated",
// //       "effect": "string - what happens when combined",
// //       "mechanism": "string - why this interaction occurs"
// //     }
// //   ],
// //   "recommendations": ["string"],
// //   "alternatives": ["string - safer medicine alternatives if dangerous"],
// //   "sources": ["FDA Drug Interaction Database", "PubMed Pharmacology", "WHO Drug Information"],
// //   "consultDoctor": true|false
// // }
// // Do not include markdown or text outside the JSON.`;

// //   try {
// //     const { content, responseTime } = await callGroq(
// //       system,
// //       `Check interactions between these medicines: ${medicines.join(", ")}`
// //     );
// //     const json = JSON.parse(content);
// //     json.responseTime = responseTime;
// //     res.json(json);
// //   } catch (e) {
// //     res.status(500).json({ error: e.message });
// //   }
// // });

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => console.log(`✅ MediGuard AI v2 running on port ${PORT}`));


// const express = require("express");
// const cors = require("cors");
// const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
// require("dotenv").config();

// const app = express();
// app.use(cors());
// app.use(express.json({ limit: "20mb" }));

// const GROQ_API_KEY = process.env.GROQ_API_KEY;
// const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// const MODEL = "llama-3.3-70b-versatile";

// async function callGroq(systemPrompt, userMessage) {
//   const start = Date.now();
//   const res = await fetch(GROQ_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
//     body: JSON.stringify({
//       model: MODEL,
//       messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }],
//       temperature: 0.3, max_tokens: 1500,
//     }),
//   });
//   const data = await res.json();
//   const responseTime = Date.now() - start;
//   if (!res.ok) throw new Error(data.error?.message || "Groq API error");
//   return { content: data.choices[0].message.content, responseTime };
// }

// // 1. SYMPTOM ANALYSER
// app.post("/api/symptom-analyse", async (req, res) => {
//   const { symptoms, language = "English" } = req.body;
//   if (!symptoms) return res.status(400).json({ error: "Symptoms required" });
//   const system = `You are a medical AI assistant trained on PubMed, WHO, and CDC medical literature. Analyse symptoms and respond ONLY with valid JSON in ${language} language:
// {"possibleConditions":[{"name":"string","likelihood":"High|Moderate|Low","description":"string"}],"recommendations":["string"],"urgencyLevel":"Emergency|High|Moderate|Low","sources":["string"],"disclaimer":"string","confidenceScore":0}`;
//   try {
//     const { content, responseTime } = await callGroq(system, `Symptoms: ${symptoms}`);
//     const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// // 2. FACT CHECKER
// app.post("/api/fact-check", async (req, res) => {
//   const { text, language = "English" } = req.body;
//   if (!text) return res.status(400).json({ error: "Text required" });
//   const system = `You are a medical fact-checking AI using PubMed, WHO, CDC, MedlinePlus. Respond ONLY with valid JSON in ${language}:
// {"verdict":"TRUE|FALSE|MISLEADING|UNVERIFIABLE|OUTDATED","confidence":0,"explanation":"string","corrections":["string"],"sources":["string"],"riskLevel":"Safe|Caution|Dangerous","evidenceStrength":"Strong|Moderate|Weak|None","label":"string"}`;
//   try {
//     const { content, responseTime } = await callGroq(system, `Check: ${text}`);
//     const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// // 3. URL CHECKER
// app.post("/api/url-check", async (req, res) => {
//   const { url, tabletName, language = "English" } = req.body;
//   if (!url) return res.status(400).json({ error: "URL required" });
//   const system = `You are a medical website safety and medicine verification AI. Respond ONLY with valid JSON in ${language}:
// {"urlSafety":"Safe|Suspicious|Dangerous|Unknown","urlAnalysis":"string","medicineInfo":{"name":"string","verified":true,"uses":["string"],"sideEffects":["string"],"warnings":["string"],"legitimacyScore":0,"fdaApproved":true},"recommendation":"string","redFlags":["string"],"sources":["string"]}`;
//   try {
//     const { content, responseTime } = await callGroq(system, `URL: ${url}${tabletName ? `\nMedicine: ${tabletName}` : ""}`);
//     const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// // 4. WHATSAPP DETECTOR
// app.post("/api/whatsapp-check", async (req, res) => {
//   const { message, language = "English" } = req.body;
//   if (!message) return res.status(400).json({ error: "Message required" });
//   const system = `You are an AI detecting fake health info on WhatsApp. Respond ONLY with valid JSON in ${language}:
// {"verdict":"REAL|FAKE|MISLEADING|PARTIALLY_TRUE","confidence":0,"title":"string","explanation":"string","dangerLevel":"Safe|Moderate|Dangerous|Extremely Dangerous","corrections":["string"],"sources":["string"],"commonInIndia":true,"shareAdvice":"string"}`;
//   try {
//     const { content, responseTime } = await callGroq(system, `WhatsApp message: ${message}`);
//     const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// // 5. DRUG INTERACTION
// app.post("/api/drug-interaction", async (req, res) => {
//   const { medicines, language = "English" } = req.body;
//   if (!medicines || medicines.length < 2) return res.status(400).json({ error: "At least 2 medicines required" });
//   const system = `You are a pharmacology AI trained on FDA drug interaction databases. Respond ONLY with valid JSON in ${language}:
// {"overallSafety":"Safe|Caution|Dangerous|Contraindicated","interactionScore":0,"interactions":[{"drug1":"string","drug2":"string","severity":"None|Minor|Moderate|Major|Contraindicated","effect":"string","mechanism":"string"}],"recommendations":["string"],"alternatives":["string"],"sources":["string"],"consultDoctor":true}`;
//   try {
//     const { content, responseTime } = await callGroq(system, `Medicines: ${medicines.join(", ")}`);
//     const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// // 6. MEDICINE SCANNER
// app.post("/api/medicine-scan", async (req, res) => {
//   const { medicineName, additionalInfo, language = "English" } = req.body;
//   if (!medicineName) return res.status(400).json({ error: "Medicine name required" });
//   const system = `You are a medicine scanning AI. Given a medicine name from a photo scan, provide complete info. Respond ONLY with valid JSON in ${language}:
// {"name":"string","genericName":"string","manufacturer":"string","category":"string","uses":["string"],"dosage":"string","sideEffects":["string"],"warnings":["string"],"interactions":["string"],"storage":"string","prescription":true,"fdaStatus":"Approved|Not Listed|Controlled","safetyScore":0,"expiryAdvice":"string","sources":["string"]}`;
//   try {
//     const { content, responseTime } = await callGroq(system, `Medicine from scan: ${medicineName}. Extra info: ${additionalInfo || "none"}`);
//     const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// // 7. HEALTH REPORT GENERATOR
// app.post("/api/generate-report", async (req, res) => {
//   const { reportData, language = "English" } = req.body;
//   if (!reportData) return res.status(400).json({ error: "Report data required" });
//   const system = `You are a medical report generator AI. Generate a comprehensive health summary. Respond ONLY with valid JSON in ${language}:
// {"reportTitle":"string","patientSummary":"string","keyFindings":["string"],"riskAssessment":"Low|Moderate|High|Critical","recommendations":["string"],"lifestyle":["string"],"followUp":"string","disclaimer":"string"}`;
//   try {
//     const { content, responseTime } = await callGroq(system, `Generate report for: ${JSON.stringify(reportData)}`);
//     const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// // 8. AI MEDICAL CHATBOT
// app.post("/api/chatbot", async (req, res) => {
//   const { message, history = [], language = "English" } = req.body;
//   if (!message) return res.status(400).json({ error: "Message required" });
//   const system = `You are MediBot, a friendly AI medical assistant inside MediGuard AI. Always respond in ${language} language. Be friendly, clear, helpful. Use WHO/CDC/PubMed knowledge. Always add disclaimer to consult a doctor for serious issues. If emergency symptoms mentioned, say call ambulance immediately. Keep responses concise.`;
//   const messages = [{ role: "system", content: system }, ...history.slice(-10), { role: "user", content: message }];
//   try {
//     const start = Date.now();
//     const r = await fetch(GROQ_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
//       body: JSON.stringify({ model: MODEL, messages, temperature: 0.5, max_tokens: 800 }),
//     });
//     const data = await r.json();
//     if (!r.ok) throw new Error(data.error?.message || "Groq API error");
//     res.json({ reply: data.choices[0].message.content, responseTime: Date.now() - start });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`✅ MediGuard AI v3 running on port ${PORT}`));

const express = require("express");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

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

const MEDICINE_DB = {
  "paracetamol": { generic: "Paracetamol", brand: ["Dolo 650","Crocin","Calpol"], category: "Analgesic/Antipyretic", dosage: "500-1000mg every 6hrs", maxDose: "4g/day", prescription: false, fdaApproved: true },
  "aspirin": { generic: "Aspirin", brand: ["Ecosprin","Disprin"], category: "NSAID/Antiplatelet", dosage: "75-325mg daily", maxDose: "4g/day", prescription: false, fdaApproved: true },
  "metformin": { generic: "Metformin", brand: ["Glycomet","Glucophage"], category: "Antidiabetic", dosage: "500-2000mg daily", maxDose: "2550mg/day", prescription: true, fdaApproved: true },
  "amoxicillin": { generic: "Amoxicillin", brand: ["Mox","Novamox"], category: "Antibiotic (Penicillin)", dosage: "250-500mg every 8hrs", maxDose: "3g/day", prescription: true, fdaApproved: true },
  "ibuprofen": { generic: "Ibuprofen", brand: ["Brufen","Advil"], category: "NSAID", dosage: "200-400mg every 6hrs", maxDose: "1200mg/day OTC", prescription: false, fdaApproved: true },
  "omeprazole": { generic: "Omeprazole", brand: ["Omez","Prilosec"], category: "Proton Pump Inhibitor", dosage: "20-40mg once daily", maxDose: "80mg/day", prescription: false, fdaApproved: true },
  "atorvastatin": { generic: "Atorvastatin", brand: ["Lipitor","Atorva"], category: "Statin (Cholesterol)", dosage: "10-80mg once daily", maxDose: "80mg/day", prescription: true, fdaApproved: true },
  "cetirizine": { generic: "Cetirizine", brand: ["Cetzine","Zyrtec"], category: "Antihistamine", dosage: "10mg once daily", maxDose: "10mg/day", prescription: false, fdaApproved: true },
};

const DISEASE_DB = {
  "diabetes": { fullName: "Diabetes Mellitus", type: "Chronic", icdCode: "E11", symptoms: ["frequent urination","excessive thirst","weight loss","blurred vision","fatigue"], treatment: ["Metformin","Insulin","Diet control","Exercise"], prevention: ["Healthy diet","Regular exercise","Weight management"] },
  "hypertension": { fullName: "Hypertension (High BP)", type: "Chronic", icdCode: "I10", symptoms: ["headache","dizziness","chest pain","shortness of breath"], treatment: ["ACE inhibitors","Beta blockers","Lifestyle changes"], prevention: ["Low salt diet","Exercise","Stress management"] },
  "dengue": { fullName: "Dengue Fever", type: "Infectious", icdCode: "A90", symptoms: ["high fever","severe headache","eye pain","muscle pain","rash","mild bleeding"], treatment: ["Rest","Fluids","Paracetamol","NO aspirin/ibuprofen"], prevention: ["Mosquito repellent","Eliminate standing water","Wear full sleeves"] },
  "tuberculosis": { fullName: "Tuberculosis (TB)", type: "Infectious", icdCode: "A15", symptoms: ["persistent cough","blood in cough","night sweats","weight loss","fever"], treatment: ["DOTS therapy","Rifampicin","Isoniazid","6 month course"], prevention: ["BCG vaccine","Avoid close contact","Good ventilation"] },
  "malaria": { fullName: "Malaria", type: "Infectious", icdCode: "B50", symptoms: ["cyclical fever","chills","sweating","headache","vomiting"], treatment: ["Artemisinin-based therapy","Chloroquine","Hospitalization if severe"], prevention: ["Mosquito nets","Repellents","Prophylactic medicines"] },
};

const DRUG_INTERACTIONS_DB = {
  "aspirin+warfarin": { severity: "Contraindicated", effect: "Severe bleeding risk", mechanism: "Both inhibit clotting pathways" },
  "aspirin+ibuprofen": { severity: "Major", effect: "Reduces aspirin heart protection, increases GI bleeding", mechanism: "Competitive COX-1 inhibition" },
  "metformin+alcohol": { severity: "Major", effect: "Lactic acidosis risk — potentially fatal", mechanism: "Both increase lactic acid production" },
  "paracetamol+alcohol": { severity: "Major", effect: "Severe liver damage", mechanism: "Alcohol increases toxic paracetamol metabolite" },
  "ibuprofen+naproxen": { severity: "Moderate", effect: "Increased GI bleeding and kidney damage", mechanism: "Additive NSAID effects" },
  "cetirizine+alcohol": { severity: "Moderate", effect: "Increased drowsiness", mechanism: "CNS depression is additive" },
};

async function callGroq(systemPrompt, userMessage) {
  const start = Date.now();
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }], temperature: 0.3, max_tokens: 1500 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Groq API error");
  return { content: data.choices[0].message.content, responseTime: Date.now() - start };
}

app.post("/api/symptom-analyse", async (req, res) => {
  const { symptoms, language = "English" } = req.body;
  if (!symptoms) return res.status(400).json({ error: "Symptoms required" });
  const emergency = detectEmergency(symptoms);
  const matchedDiseases = Object.entries(DISEASE_DB).filter(([key, val]) => val.symptoms.some(s => symptoms.toLowerCase().includes(s.toLowerCase()))).map(([key, val]) => ({ key, ...val }));
  const system = `You are a medical AI assistant trained on PubMed, WHO, CDC. If symptoms indicate emergency flag as EMERGENCY. Respond ONLY with valid JSON in ${language}:{"possibleConditions":[{"name":"string","likelihood":"High|Moderate|Low","description":"string"}],"recommendations":["string"],"urgencyLevel":"Emergency|High|Moderate|Low","sources":["string"],"disclaimer":"string","confidenceScore":0,"emergencyAction":"string or null"}`;
  try {
    const { content, responseTime } = await callGroq(system, `Symptoms: ${symptoms}`);
    const json = JSON.parse(content);
    json.responseTime = responseTime;
    json.isEmergency = emergency.isEmergency;
    json.emergencyKeywords = emergency.keywords;
    json.databaseMatches = matchedDiseases.slice(0, 2);
    if (emergency.isEmergency) json.urgencyLevel = "Emergency";
    res.json(json);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/fact-check", async (req, res) => {
  const { text, language = "English" } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });
  const system = `You are a medical fact-checking AI. Respond ONLY with valid JSON in ${language}:{"verdict":"TRUE|FALSE|MISLEADING|UNVERIFIABLE|OUTDATED","confidence":0,"explanation":"string","corrections":["string"],"sources":["string"],"riskLevel":"Safe|Caution|Dangerous","evidenceStrength":"Strong|Moderate|Weak|None","label":"string"}`;
  try {
    const { content, responseTime } = await callGroq(system, `Check: ${text}`);
    const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/url-check", async (req, res) => {
  const { url, tabletName, language = "English" } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });
  const dbMatch = tabletName ? MEDICINE_DB[tabletName.toLowerCase().split(" ")[0]] || null : null;
  const system = `You are a medical website safety AI. Respond ONLY with valid JSON in ${language}:{"urlSafety":"Safe|Suspicious|Dangerous|Unknown","urlAnalysis":"string","medicineInfo":{"name":"string","verified":true,"uses":["string"],"sideEffects":["string"],"warnings":["string"],"legitimacyScore":0,"fdaApproved":true},"recommendation":"string","redFlags":["string"],"sources":["string"]}`;
  try {
    const { content, responseTime } = await callGroq(system, `URL: ${url}${tabletName ? `\nMedicine: ${tabletName}` : ""}`);
    const json = JSON.parse(content);
    json.responseTime = responseTime;
    if (dbMatch) json.databaseInfo = dbMatch;
    res.json(json);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/whatsapp-check", async (req, res) => {
  const { message, language = "English" } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });
  const system = `You are an AI detecting fake health info on WhatsApp. Respond ONLY with valid JSON in ${language}:{"verdict":"REAL|FAKE|MISLEADING|PARTIALLY_TRUE","confidence":0,"title":"string","explanation":"string","dangerLevel":"Safe|Moderate|Dangerous|Extremely Dangerous","corrections":["string"],"sources":["string"],"commonInIndia":true,"shareAdvice":"string"}`;
  try {
    const { content, responseTime } = await callGroq(system, `WhatsApp message: ${message}`);
    const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/drug-interaction", async (req, res) => {
  const { medicines, language = "English" } = req.body;
  if (!medicines || medicines.length < 2) return res.status(400).json({ error: "At least 2 medicines required" });
  const dbInteractions = [];
  for (let i = 0; i < medicines.length; i++) {
    for (let j = i + 1; j < medicines.length; j++) {
      const key1 = `${medicines[i].toLowerCase()}+${medicines[j].toLowerCase()}`;
      const key2 = `${medicines[j].toLowerCase()}+${medicines[i].toLowerCase()}`;
      const found = DRUG_INTERACTIONS_DB[key1] || DRUG_INTERACTIONS_DB[key2];
      if (found) dbInteractions.push({ drug1: medicines[i], drug2: medicines[j], ...found, source: "MediGuard Drug Database" });
    }
  }
  const system = `You are a pharmacology AI. Respond ONLY with valid JSON in ${language}:{"overallSafety":"Safe|Caution|Dangerous|Contraindicated","interactionScore":0,"interactions":[{"drug1":"string","drug2":"string","severity":"None|Minor|Moderate|Major|Contraindicated","effect":"string","mechanism":"string"}],"recommendations":["string"],"alternatives":["string"],"sources":["string"],"consultDoctor":true}`;
  try {
    const { content, responseTime } = await callGroq(system, `Medicines: ${medicines.join(", ")}`);
    const json = JSON.parse(content);
    json.responseTime = responseTime;
    if (dbInteractions.length > 0) { json.databaseInteractions = dbInteractions; json.overallSafety = dbInteractions.some(i => i.severity === "Contraindicated") ? "Contraindicated" : json.overallSafety; }
    res.json(json);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/medicine-scan", async (req, res) => {
  const { medicineName, additionalInfo, language = "English" } = req.body;
  if (!medicineName) return res.status(400).json({ error: "Medicine name required" });
  const dbMatch = MEDICINE_DB[medicineName.toLowerCase().split(" ")[0]] || null;
  const system = `You are a medicine scanning AI. Respond ONLY with valid JSON in ${language}:{"name":"string","genericName":"string","manufacturer":"string","category":"string","uses":["string"],"dosage":"string","sideEffects":["string"],"warnings":["string"],"interactions":["string"],"storage":"string","prescription":true,"fdaApproved":true,"safetyScore":0,"expiryAdvice":"string","sources":["string"]}`;
  try {
    const { content, responseTime } = await callGroq(system, `Medicine: ${medicineName}. Extra: ${additionalInfo || "none"}`);
    const json = JSON.parse(content);
    json.responseTime = responseTime;
    if (dbMatch) json.databaseInfo = dbMatch;
    res.json(json);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/generate-report", async (req, res) => {
  const { reportData, language = "English" } = req.body;
  if (!reportData) return res.status(400).json({ error: "Report data required" });
  const system = `You are a medical report generator AI. Respond ONLY with valid JSON in ${language}:{"reportTitle":"string","patientSummary":"string","keyFindings":["string"],"riskAssessment":"Low|Moderate|High|Critical","recommendations":["string"],"lifestyle":["string"],"followUp":"string","disclaimer":"string"}`;
  try {
    const { content, responseTime } = await callGroq(system, `Generate report: ${JSON.stringify(reportData)}`);
    const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/chatbot", async (req, res) => {
  const { message, history = [], language = "English" } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });
  const emergency = detectEmergency(message);
  const system = `You are MediBot, friendly AI medical assistant inside MediGuard AI. Always respond in ${language}. If emergency symptoms mentioned say call 108 immediately. Be friendly, concise. Always add disclaimer to consult doctor.`;
  const messages = [{ role: "system", content: system }, ...history.slice(-10), { role: "user", content: message }];
  try {
    const start = Date.now();
    const r = await fetch(GROQ_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` }, body: JSON.stringify({ model: MODEL, messages, temperature: 0.5, max_tokens: 800 }) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error?.message || "Groq API error");
    res.json({ reply: data.choices[0].message.content, responseTime: Date.now() - start, isEmergency: emergency.isEmergency });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/report-analysis", async (req, res) => {
  const { reportText, reportType, language = "English" } = req.body;
  if (!reportText) return res.status(400).json({ error: "Report text required" });
  const system = `You are a medical report analysis AI for ${reportType} reports. Analyse values and identify abnormal readings. Respond ONLY with valid JSON in ${language}:{"reportType":"string","summary":"string","findings":[{"parameter":"string","value":"string","normalRange":"string","status":"Normal|Low|High|Critical","interpretation":"string"}],"abnormalCount":0,"criticalCount":0,"overallHealth":"Normal|Mild Concern|Moderate Concern|Critical","possibleConditions":["string"],"recommendations":["string"],"urgentAction":"string or null","followUp":"string","sources":["string"]}`;
  try {
    const { content, responseTime } = await callGroq(system, `Analyse ${reportType}:\n${reportText}`);
    const json = JSON.parse(content);
    json.responseTime = responseTime;
    json.isEmergency = json.criticalCount > 0;
    res.json(json);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/database/medicine/:name", (req, res) => {
  const result = MEDICINE_DB[req.params.name.toLowerCase()];
  result ? res.json({ found: true, data: result }) : res.json({ found: false, message: "Not in local database" });
});

app.get("/api/database/disease/:name", (req, res) => {
  const result = DISEASE_DB[req.params.name.toLowerCase()];
  result ? res.json({ found: true, data: result }) : res.json({ found: false, message: "Not in local database" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ MediGuard AI v4 running on port ${PORT}`));
// https://mediguard-ai-0lcl.onrender.com
// ─── EMAIL HEALTH REPORT ─────────────────────────────────────────────────────
const nodemailer = require("nodemailer");

app.post("/api/send-report", async (req, res) => {
  const { toEmail, patientName, reportContent, reportType } = req.body;
  if (!toEmail || !reportContent) return res.status(400).json({ error: "Email and report required" });

  try {
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `MediGuard AI <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `🏥 MediGuard AI — ${reportType || "Health"} Report for ${patientName || "Patient"}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f5f5f5">
          <div style="background:linear-gradient(135deg,#004080,#006994);padding:30px;border-radius:12px;margin-bottom:20px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:24px">⚕ MediGuard AI</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px">AI-Powered Medical Report</p>
          </div>
          <div style="background:#fff;padding:24px;border-radius:12px;margin-bottom:16px">
            <h2 style="color:#004080;margin:0 0 16px">📋 ${reportType || "Health"} Report</h2>
            <p style="color:#555;font-size:13px;margin-bottom:16px">Patient: <strong>${patientName || "N/A"}</strong></p>
            <p style="color:#555;font-size:13px;margin-bottom:16px">Generated: <strong>${new Date().toLocaleString()}</strong></p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
            <div style="background:#f8f9fa;padding:16px;border-radius:8px;font-size:13px;color:#333;line-height:1.8;white-space:pre-wrap">${reportContent}</div>
          </div>
          <div style="background:#fff3cd;padding:14px;border-radius:8px;font-size:12px;color:#856404">
            ⚠️ This report is AI-generated for informational purposes only. Always consult a licensed medical professional.
          </div>
          <p style="text-align:center;font-size:11px;color:#999;margin-top:16px">Sent by MediGuard AI · Powered by Groq LLaMA 3.3 70B</p>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Report sent successfully!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});