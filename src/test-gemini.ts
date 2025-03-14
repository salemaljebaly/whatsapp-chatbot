// test-gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testGeminiAPI() {
  try {
    // Initialize the API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Access the model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      systemInstruction: "You are a helpful assistant."
    });
    
    // Test with a simple prompt
    const result = await model.generateContent("Hello! Can you introduce yourself?");
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini Response:");
    console.log(text);
    console.log("\nAPI test successful!");
  } catch (error) {
    console.error("Error testing Gemini API:");
    console.error(error);
  }
}

// Run the test
testGeminiAPI();