import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Diagnostic log to confirm your key is working
console.log("Checking API Key...");
if (process.env.GEMINI_API_KEY) {
    console.log("✅ API Key detected in Render environment.");
} else {
    console.log("❌ ERROR: API Key NOT found. Check Render Environment tab!");
}

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// CHANGED: Using 'gemini-pro' for maximum compatibility with the current library
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "No message sent." });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    res.json({ reply: text });
  } catch (error) {
    console.error("Gemini Error:", error.message);
    // This sends the actual error back to your chat screen so we can see it
    res.status(500).json({ reply: "Brain connection failed: " + error.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is live on port ${port}`);
});
