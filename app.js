import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// SERVE FRONTEND: This tells the server to show index.html 
// when you visit the main website URL.
app.use(express.static("."));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// STABLE MODEL: Using 'gemini-1.5-flash' to avoid the 404 error
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash" 
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const result = await model.generateContent(message);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error) {
    console.error("Detailed Error in /chat:", error);
    res.status(500).json({ 
      error: "Failed to generate AI response",
      details: error.message 
    });
  }
});

// Start server on 0.0.0.0 for Render compatibility
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is successfully running on port ${port}`);
});
