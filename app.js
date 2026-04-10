import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
// Render dynamic port or default to 10000
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini with the API Key from your Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// FIXED: Using 'gemini-1.5-flash-latest' to resolve the 404 error found in logs
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash-latest" 
});

// Health check endpoint (This is what you see when you visit the URL)
app.get("/", (req, res) => {
  res.send("Chatbot Backend is live and reaching Gemini ✅");
});

// Main Chat Endpoint
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
    // This will print the specific error in your Render Logs if it fails again
    console.error("Detailed Error in /chat:", error);
    res.status(500).json({ 
      error: "Failed to generate AI response",
      details: error.message 
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is successfully running on port ${port}`);
});
