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

// 1. Serve static files from the root AND the mychatbot folder
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "mychatbot")));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const result = await model.generateContent(message);
    res.json({ reply: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. The "Seek and Find" Home Route
app.get("/", (req, res) => {
  const pathsToTry = [
    path.join(__dirname, "index.html"),
    path.join(__dirname, "mychatbot", "index.html")
  ];

  for (const p of pathsToTry) {
    if (fs.existsSync(p)) {
      return res.sendFile(p);
    }
  }

  res.status(404).send("Server is live, but index.html is missing from the root and the mychatbot folder.");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is live on port ${port}`);
});
