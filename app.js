// app.js

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

// Check for API key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables.");
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Health check
app.get("/", (req, res) => {
  res.send("Backend is live ✅");
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'message' field in request body." });
    }

    const result = await model.generateContent(userMessage);
    const responseText = result.response.text();

    return res.json({ reply: responseText });
  } catch (error) {
    console.error("Error in /chat:", error);
    return res.status(500).json({ error: "Error generating response from Gemini." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
