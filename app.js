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

// Initialize Gemini
// Ensure GEMINI_API_KEY is set in your Render Environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// STABLE MODEL NAME: Changed from 'gemini-1.5-flash-latest' to 'gemini-1.5-flash'
// This fixes the 404 error appearing in your Render logs.
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash" 
});

// Health check
app.get("/", (req, res) => {
  res.send("Chatbot Backend is live and reaching Gemini ✅");
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    // Generate content using the Gemini model
    const result = await model.generateContent(message);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error) {
    // This logs the specific error to your Render dashboard
    console.error("Detailed Error in /chat:", error);
    res.status(500).json({ 
      error: "Failed to generate AI response",
      details: error.message 
    });
  }
});

// Start server on 0.0.0.0 to ensure it's accessible on Render
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is successfully running on port ${port}`);
});
