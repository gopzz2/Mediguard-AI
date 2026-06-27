const express = require("express");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

async function callGroq(systemPrompt, userMessage) {
  const start = Date.now();
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }],
      temperature: 0.3, max_tokens: 1500,
    }),
  });
  const data = await res.json();
  const responseTime = Date.now() - start;
  if (!res.ok) throw new Error(data.error?.message || "Groq API error");
  return { content: data.choices[0].message.content, responseTime };
}

// 1. SYMPTOM ANALYSER
app.post("/api/symptom-analyse", async (req, res) => {
  const { symptoms, language = "English" } = req.body;
  if (!symptoms) return res.status(400).json({ error: "Symptoms required" });
  const system = `You are a medical AI assistant trained on PubMed, WHO, and CDC medical literature. Analyse symptoms and respond ONLY with valid JSON in ${language} language:
{"possibleConditions":[{"name":"string","likelihood":"High|Moderate|Low","description":"string"}],"recommendations":["string"],"urgencyLevel":"Emergency|High|Moderate|Low","sources":["string"],"disclaimer":"string","confidenceScore":0}`;
  try {
    const { content, responseTime } = await callGroq(system, `Symptoms: ${symptoms}`);
    const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. FACT CHECKER
app.post("/api/fact-check", async (req, res) => {
  const { text, language = "English" } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });
  const system = `You are a medical fact-checking AI using PubMed, WHO, CDC, MedlinePlus. Respond ONLY with valid JSON in ${language}:
{"verdict":"TRUE|FALSE|MISLEADING|UNVERIFIABLE|OUTDATED","confidence":0,"explanation":"string","corrections":["string"],"sources":["string"],"riskLevel":"Safe|Caution|Dangerous","evidenceStrength":"Strong|Moderate|Weak|None","label":"string"}`;
  try {
    const { content, responseTime } = await callGroq(system, `Check: ${text}`);
    const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. URL CHECKER
app.post("/api/url-check", async (req, res) => {
  const { url, tabletName, language = "English" } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });
  const system = `You are a medical website safety and medicine verification AI. Respond ONLY with valid JSON in ${language}:
{"urlSafety":"Safe|Suspicious|Dangerous|Unknown","urlAnalysis":"string","medicineInfo":{"name":"string","verified":true,"uses":["string"],"sideEffects":["string"],"warnings":["string"],"legitimacyScore":0,"fdaApproved":true},"recommendation":"string","redFlags":["string"],"sources":["string"]}`;
  try {
    const { content, responseTime } = await callGroq(system, `URL: ${url}${tabletName ? `\nMedicine: ${tabletName}` : ""}`);
    const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. WHATSAPP DETECTOR
app.post("/api/whatsapp-check", async (req, res) => {
  const { message, language = "English" } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });
  const system = `You are an AI detecting fake health info on WhatsApp. Respond ONLY with valid JSON in ${language}:
{"verdict":"REAL|FAKE|MISLEADING|PARTIALLY_TRUE","confidence":0,"title":"string","explanation":"string","dangerLevel":"Safe|Moderate|Dangerous|Extremely Dangerous","corrections":["string"],"sources":["string"],"commonInIndia":true,"shareAdvice":"string"}`;
  try {
    const { content, responseTime } = await callGroq(system, `WhatsApp message: ${message}`);
    const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. DRUG INTERACTION
app.post("/api/drug-interaction", async (req, res) => {
  const { medicines, language = "English" } = req.body;
  if (!medicines || medicines.length < 2) return res.status(400).json({ error: "At least 2 medicines required" });
  const system = `You are a pharmacology AI trained on FDA drug interaction databases. Respond ONLY with valid JSON in ${language}:
{"overallSafety":"Safe|Caution|Dangerous|Contraindicated","interactionScore":0,"interactions":[{"drug1":"string","drug2":"string","severity":"None|Minor|Moderate|Major|Contraindicated","effect":"string","mechanism":"string"}],"recommendations":["string"],"alternatives":["string"],"sources":["string"],"consultDoctor":true}`;
  try {
    const { content, responseTime } = await callGroq(system, `Medicines: ${medicines.join(", ")}`);
    const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 6. MEDICINE SCANNER
app.post("/api/medicine-scan", async (req, res) => {
  const { medicineName, additionalInfo, language = "English" } = req.body;
  if (!medicineName) return res.status(400).json({ error: "Medicine name required" });
  const system = `You are a medicine scanning AI. Given a medicine name from a photo scan, provide complete info. Respond ONLY with valid JSON in ${language}:
{"name":"string","genericName":"string","manufacturer":"string","category":"string","uses":["string"],"dosage":"string","sideEffects":["string"],"warnings":["string"],"interactions":["string"],"storage":"string","prescription":true,"fdaStatus":"Approved|Not Listed|Controlled","safetyScore":0,"expiryAdvice":"string","sources":["string"]}`;
  try {
    const { content, responseTime } = await callGroq(system, `Medicine from scan: ${medicineName}. Extra info: ${additionalInfo || "none"}`);
    const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 7. HEALTH REPORT GENERATOR
app.post("/api/generate-report", async (req, res) => {
  const { reportData, language = "English" } = req.body;
  if (!reportData) return res.status(400).json({ error: "Report data required" });
  const system = `You are a medical report generator AI. Generate a comprehensive health summary. Respond ONLY with valid JSON in ${language}:
{"reportTitle":"string","patientSummary":"string","keyFindings":["string"],"riskAssessment":"Low|Moderate|High|Critical","recommendations":["string"],"lifestyle":["string"],"followUp":"string","disclaimer":"string"}`;
  try {
    const { content, responseTime } = await callGroq(system, `Generate report for: ${JSON.stringify(reportData)}`);
    const json = JSON.parse(content); json.responseTime = responseTime; res.json(json);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 8. AI MEDICAL CHATBOT
app.post("/api/chatbot", async (req, res) => {
  const { message, history = [], language = "English" } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });
  const system = `You are MediBot, a friendly AI medical assistant inside MediGuard AI. Always respond in ${language} language. Be friendly, clear, helpful. Use WHO/CDC/PubMed knowledge. Always add disclaimer to consult a doctor for serious issues. If emergency symptoms mentioned, say call ambulance immediately. Keep responses concise.`;
  const messages = [{ role: "system", content: system }, ...history.slice(-10), { role: "user", content: message }];
  try {
    const start = Date.now();
    const r = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.5, max_tokens: 800 }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error?.message || "Groq API error");
    res.json({ reply: data.choices[0].message.content, responseTime: Date.now() - start });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ MediGuard AI v3 running on port ${PORT}`));
