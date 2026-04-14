import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const DEFAULT_MODEL = process.env.NVIDIA_MODEL || "deepseek-ai/deepseek-v3";

if (!NVIDIA_API_KEY) {
  console.warn("⚠️ NVIDIA_API_KEY no está definida en las variables de entorno.");
}

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "PedusGPT", time: new Date().toISOString() });
});

function extractMessageContent(data) {
  const direct = data?.choices?.[0]?.message?.content;
  if (typeof direct === "string" && direct.trim()) return direct;

  const alt1 = data?.choices?.[0]?.delta?.content;
  if (typeof alt1 === "string" && alt1.trim()) return alt1;

  const alt2 = data?.message?.content;
  if (typeof alt2 === "string" && alt2.trim()) return alt2;

  return "";
}

app.post("/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();
    const model = String(req.body?.model || DEFAULT_MODEL).trim();
    const systemPrompt = String(
      req.body?.systemPrompt ||
        "Eres PedusGPT, un asistente útil, claro y directo. Responde en español salvo que el usuario pida otro idioma."
    );

    if (!message) {
      return res.status(400).json({ error: "El campo message es obligatorio." });
    }

    if (!NVIDIA_API_KEY) {
      return res.status(500).json({ error: "Falta NVIDIA_API_KEY en el servidor." });
    }

    const response = await axios.post(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        top_p: 0.9,
});
