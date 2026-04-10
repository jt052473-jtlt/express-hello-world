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

// 1. Serve static files from the root folder
app.use(express.static("."));

// 2. Initialize Gemini (Using the stable model name)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 3. The Chat API
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

// 4. THE FIX: Catch-all route to force index.html to load
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${port}`);
});
