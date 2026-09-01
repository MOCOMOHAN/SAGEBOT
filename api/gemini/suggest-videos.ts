import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // move your /api/gemini/suggest-videos logic here
  const { subjectName, taskName } = req.body;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  // ... rest of your logic
}