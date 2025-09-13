// src/app/api/summarize/route.ts
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  const { text } = await req.json();
  const r = await ai.models.generateContent({
    model: process.env.MODEL_ID || "gemini-2.5-flash",
    contents: `아래 글을 3~5문장으로 요약:\n\n${text}`,
  });
  return Response.json({ summary: r.text ?? "" });
}
