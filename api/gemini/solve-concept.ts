import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ✅ destructure FIRST — this was the TS2304 error
  const { prompt, subjectName } = req.body;

  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `You are an expert academic tutor. The student is currently studying "${subjectName || 'general academics'}", but answer based on what the question is ACTUALLY about — do NOT force the subject context if the question belongs to a different domain.

Question: "${prompt}"

Provide a clear answer formatted in Markdown:
1. **Core Governing Principle / Axiom**
2. **Step-by-Step Derivation or Logical Execution**
3. **Common Exam Traps & Intuition Trick**`,
    });

    return res.json({ success: true, solution: response.text });
  } catch (err: any) {
    console.error('Gemini error:', err);
    return res.status(500).json({ error: err.message || 'Gemini request failed' });
  }
}