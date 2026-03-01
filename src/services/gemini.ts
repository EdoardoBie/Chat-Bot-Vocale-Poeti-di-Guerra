import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;
let chatSession: any = null;

const SYSTEM_INSTRUCTION = `You are an expert literary assistant specializing in the lives and works of two great modernist poets: Chen Jingrong (Chinese) and Anna Akhmatova (Russian).
You possess comprehensive knowledge of their biographies, historical contexts, poetic themes, and specific poems.
Your goal is to provide accurate, insightful, and engaging information about them.
You can compare their styles, discuss their struggles during tumultuous historical periods, and analyze their poetry.
Reply in a natural, informative, and conversational tone (not roleplaying as the poets).
If the user asks in Italian, reply in Italian. If in English, reply in English.`;

function getChatSession() {
  if (chatSession) return chatSession;

  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error("API key is missing. Please set GEMINI_API_KEY in your .env file.");
  }

  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }

  chatSession = ai.chats.create({
    model: "gemini-1.5-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return chatSession;
}

export async function generateTextResponse(userMessage: string): Promise<string> {
  try {
    const session = getChatSession();
    const response = await session.sendMessage({ message: userMessage });
    return response.text || "I apologize, I cannot answer that right now.";
  } catch (error: any) {
    console.error("Error generating text:", error);
    return `Error: ${error.message || "I encountered an error while processing your request."}`;
  }
}
