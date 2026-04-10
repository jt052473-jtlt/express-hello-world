import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Chat API
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const result = await model.generateContent(message);
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// HOME ROUTE with automatic file detection
app.get("/", (req, res) => {
  const pathsToTry = [
    path.join(__dirname, "index.html"),
    path.join(__dirname, "public", "index.html")
  ];

  for (const p of pathsToTry) {
    if (fs.existsSync(p)) {
      return res.sendFile(p);
    }
  }
  
  res.status(404).send("Could not find index.html in root or public folder. Check your GitHub file names!");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${port}`);
});
