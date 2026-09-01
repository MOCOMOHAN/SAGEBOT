import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ✅ destructure FIRST
  const { subjectName, taskName, taskDescription, query } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an elite academic study tutor. Recommend 3 top-tier YouTube tutorial videos for:
Subject: "${subjectName || 'General'}"
Task: "${taskName || 'Study Session'}"
Notes: "${taskDescription || ''}"
Query: "${query || ''}"

Return ONLY a valid JSON array with no markdown, no backticks:
[{
  "title": "video title",
  "channelName": "channel name",
  "duration": "e.g. 14 mins",
  "searchQuery": "youtube search query",
  "youtubeUrl": "https://www.youtube.com/results?search_query=...",
  "recommendedReason": "why this helps",
  "keyTopics": ["topic1", "topic2"],
  "badge": "e.g. Visual Intuition"
}]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    const raw = response.text || '[]';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const videos = JSON.parse(cleaned);

    return res.json({ success: true, source: 'gemini-ai', videos });
  } catch (err: any) {
    console.error('Suggest videos error:', err);
    return res.status(500).json({ error: err.message || 'Failed' });
  }
}