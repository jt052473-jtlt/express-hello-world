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

// SERVE THE FRONTEND: This tells Render to show your index.html 
// file when you visit your primary URL.
app.use(express.static("."));

// Initialize Gemini
// Make sure your GEMINI_API_KEY is saved in the Render Environment tab
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// FIXED MODEL: Using 'gemini-1.5-flash' to match the API version 
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

    // Call the Gemini API
    const result = await model.generateContent(message);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error) {
    // This will appear in your Render Logs if something goes wrong
    console.error("Detailed Error in /chat:", error);
    res.status(500).json({ 
      error: "Failed to generate AI response",
      details: error.message 
    });
  }
});

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is successfully running on port ${port}`);
});
