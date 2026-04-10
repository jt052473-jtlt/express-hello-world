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

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize Gemini with the API Key from your Render Environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// We are using 'gemini-1.5-flash' which is the current stable standard
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "No message provided." });

    // Generate response
    const result = await model.generateContent(message);
    const text = result.response.text();
    
    res.json({ reply: text });
  } catch (error) {
    console.error("Gemini Error:", error.message);
    // If it fails, it will tell us exactly why on the chat screen
    res.status(500).json({ reply: "Connection Error: " + error.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is live on port ${port}`);
});
