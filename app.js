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

// INITIALIZE AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// CHAT API
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const result = await model.generateContent(message);
    res.json({ reply: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AUTO-DETECT INDEX.HTML
app.get("/", (req, res) => {
  // This function looks for index.html anywhere in your project
  const findFile = (dir, fileName) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (file !== 'node_modules') {
          const found = findFile(fullPath, fileName);
          if (found) return found;
        }
      } else if (file === fileName) {
        return fullPath;
      }
    }
    return null;
  };

  const indexPath = findFile(__dirname, "index.html");

  if (indexPath) {
    res.sendFile(indexPath);
  } else {
    const allRootFiles = fs.readdirSync(__dirname);
    res.status(404).send(`Could not find index.html anywhere. Files in root: ${allRootFiles.join(", ")}`);
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is searching for index.html and listening on ${port}`);
});
