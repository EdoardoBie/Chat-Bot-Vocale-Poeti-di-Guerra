import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are an expert literary assistant specializing in the lives and works of two great modernist poets: Chen Jingrong (Chinese) and Anna Akhmatova (Russian).
You possess comprehensive knowledge of their biographies, historical contexts, poetic themes, and specific poems.
Your goal is to provide accurate, insightful, and engaging information about them.
You can compare their styles, discuss their struggles during tumultuous historical periods, and analyze their poetry.
Reply in a natural, informative, and conversational tone (not roleplaying as the poets).
If the user asks in Italian, reply in Italian. If in English, reply in English.`;

let chatSession: any = null;

export async function generateTextResponse(userMessage: string): Promise<string> {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }

  try {
    const response = await chatSession.sendMessage({ message: userMessage });
    return response.text || "I apologize, I cannot answer that right now.";
  } catch (error) {
    console.error("Error generating text:", error);
    return "I encountered an error while processing your request.";
  }
}
