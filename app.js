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

// Tell Express to serve files from the current folder
app.use(express.static(__dirname));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// API Route for Chat
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

// Main Route to serve the Chatbot Interface
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "index.html");
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // If it fails, this will show a helpful message in the browser
    const files = fs.readdirSync(__dirname);
    res.status(404).send(`
      <h1>File Not Found</h1>
      <p>The server is looking for <b>index.html</b> but it is missing.</p>
      <p><b>Files found in your GitHub repo:</b> ${files.join(", ")}</p>
    `);
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${port}`);
});
