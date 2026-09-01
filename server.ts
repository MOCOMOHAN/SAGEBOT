import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

// ✅ FIX 1: Supabase removed from server.ts entirely — it was imported but
// never used, and caused a crash on startup. Use it in the frontend via
// src/lib/supabase.ts with VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY instead.

// ✅ FIX 2: Lazy/Safe initialization of GoogleGenAI
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set — AI features disabled');
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Pre-curated educational knowledge base for YouTube suggestions (fallback)
const CURATED_YOUTUBE_RESOURCES: Record<string, Array<{
  title: string; channelName: string; duration: string;
  youtubeUrl: string; searchQuery: string;
  recommendedReason: string; keyTopics: string[]; badge: string;
}>> = {
  calculus: [
    {
      title: "Green's Theorem Explained Visually | 3Blue1Brown",
      channelName: '3Blue1Brown', duration: '18 mins',
      youtubeUrl: 'https://www.youtube.com/results?search_query=3blue1brown+greens+theorem+visual+calculus',
      searchQuery: "3blue1brown green's theorem visual calculus",
      recommendedReason: 'Geometric intuition of 2D fluid circulation and boundary line integration.',
      keyTopics: ['Curl intuition', 'Boundary line integrals', 'Flux vs Circulation'],
      badge: 'Visual Intuition',
    },
    {
      title: "Multivariable Calculus: Line Integrals & Green's Theorem",
      channelName: 'Professor Leonard', duration: '42 mins',
      youtubeUrl: 'https://www.youtube.com/results?search_query=professor+leonard+greens+theorem+line+integrals',
      searchQuery: 'professor leonard greens theorem line integrals',
      recommendedReason: 'Step-by-step lecture covering complex exam-level integration examples.',
      keyTopics: ['Jordan curves', 'Partial derivatives setup', 'Planar area shortcuts'],
      badge: 'Exam Walkthrough',
    },
  ],
  algorithms: [
    {
      title: 'Binary Search Algorithm & O(log n) Time Complexity Visually Explained',
      channelName: 'NeetCode', duration: '14 mins',
      youtubeUrl: 'https://www.youtube.com/results?search_query=neetcode+binary+search+algorithm+explained',
      searchQuery: 'neetcode binary search algorithm explained',
      recommendedReason: 'Detailed boundary index pointers and off-by-one edge cases.',
      keyTopics: ['Two pointer index logic', 'Integer overflow prevention', 'Search space reduction'],
      badge: 'Coding Interview',
    },
    {
      title: 'MIT 6.006: Introduction to Algorithms',
      channelName: 'MIT OpenCourseWare', duration: '48 mins',
      youtubeUrl: 'https://www.youtube.com/results?search_query=mit+opencourseware+binary+search+algorithms',
      searchQuery: 'mit opencourseware binary search algorithms',
      recommendedReason: 'Rigorous theoretical foundations from MIT computer science faculty.',
      keyTopics: ['Asymptotic proofs', 'Recurrence relations', 'Tree height balance'],
      badge: 'Deep Academic',
    },
  ],
  chemistry: [
    {
      title: 'SN1 vs SN2 Reaction Mechanism & Stereochemistry Master Guide',
      channelName: 'The Organic Chemistry Tutor', duration: '26 mins',
      youtubeUrl: 'https://www.youtube.com/results?search_query=organic+chemistry+tutor+sn1+vs+sn2+stereochemistry',
      searchQuery: 'organic chemistry tutor sn1 vs sn2 stereochemistry',
      recommendedReason: 'Clear comparison covering carbocation stability and solvent effects.',
      keyTopics: ['Nucleophile strength', 'Solvent effects', 'Stereochemical outcome'],
      badge: 'Concept Breakdown',
    },
  ],
  economics: [
    {
      title: 'Monetary vs Fiscal Policy - Macroeconomics CrashCourse',
      channelName: 'CrashCourse', duration: '12 mins',
      youtubeUrl: 'https://www.youtube.com/results?search_query=crashcourse+monetary+fiscal+policy+macroeconomics',
      searchQuery: 'crashcourse monetary fiscal policy macroeconomics',
      recommendedReason: 'Visual breakdown of interest rates, reserve ratios, and aggregate demand.',
      keyTopics: ['Central Bank operations', 'Government spending multiplier', 'Inflation targeting'],
      badge: 'High Yield',
    },
  ],
  physics: [
    {
      title: "Maxwell's Equations & Vector Calculus in Electromagnetism",
      channelName: '3Blue1Brown', duration: '21 mins',
      youtubeUrl: 'https://www.youtube.com/results?search_query=3blue1brown+maxwell+equations+electromagnetism',
      searchQuery: '3blue1brown maxwell equations electromagnetism',
      recommendedReason: 'Visual divergence and curl explanation of electric and magnetic vector fields.',
      keyTopics: ['Gauss Law', 'Faraday Induction', 'Ampere-Maxwell Law'],
      badge: 'Visual Intuition',
    },
  ],
};

async function startServer() {
  const app = express();
  app.use(express.json());

  // API 1: Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API 2: YouTube video suggestions
  app.post('/api/gemini/suggest-videos', async (req, res) => {
    try {
      const { subjectName, taskName, taskDescription, query } = req.body;
      const term = `${subjectName || ''} ${taskName || ''} ${query || ''}`.trim();
      const termLower = term.toLowerCase();
      const ai = getGenAIClient();

      if (ai) {
        try {
          const prompt = `You are an elite academic study tutor. Recommend 3 top-tier YouTube tutorial videos for:
Subject: "${subjectName || 'General'}"
Task: "${taskName || 'Study Session'}"
Notes: "${taskDescription || ''}"

Return ONLY a valid JSON array, no markdown, no backticks:
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
            config: { responseMimeType: 'application/json' },
          });

          const rawText = response.text || '[]';
          let parsedVideos: any[] = [];
          try {
            parsedVideos = JSON.parse(rawText.replace(/```json|```/g, '').trim());
          } catch (err) {
            console.error('Failed to parse Gemini video JSON:', err);
          }

          if (Array.isArray(parsedVideos) && parsedVideos.length > 0) {
            const formatted = parsedVideos.map((v: any, idx: number) => ({
              id: `yt-gemini-${Date.now()}-${idx}`,
              title: v.title || `${subjectName}: ${taskName} Tutorial`,
              channelName: v.channelName || 'Academic Educator',
              duration: v.duration || '15 mins',
              youtubeUrl: v.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(v.searchQuery || term)}`,
              searchQuery: v.searchQuery || term,
              recommendedReason: v.recommendedReason || `Covers key concepts for ${taskName}.`,
              keyTopics: Array.isArray(v.keyTopics) ? v.keyTopics : [subjectName, taskName],
              badge: v.badge || 'Recommended',
            }));
            return res.json({ success: true, source: 'gemini-ai', videos: formatted });
          }
        } catch (geminiErr) {
          console.warn('Gemini API call failed, using curated fallback:', geminiErr);
        }
      }

      // Fallback: curated library
      let fallbackVideos = CURATED_YOUTUBE_RESOURCES.calculus;
      if (termLower.includes('algo') || termLower.includes('search') || termLower.includes('binary') || termLower.includes('code')) {
        fallbackVideos = CURATED_YOUTUBE_RESOURCES.algorithms;
      } else if (termLower.includes('chem') || termLower.includes('sn1') || termLower.includes('reaction')) {
        fallbackVideos = CURATED_YOUTUBE_RESOURCES.chemistry;
      } else if (termLower.includes('econ') || termLower.includes('fiscal') || termLower.includes('monetary')) {
        fallbackVideos = CURATED_YOUTUBE_RESOURCES.economics;
      } else if (termLower.includes('physic') || termLower.includes('wave') || termLower.includes('force')) {
        fallbackVideos = CURATED_YOUTUBE_RESOURCES.physics;
      }

      const formatted = fallbackVideos.map((v, idx) => ({
        id: `yt-curated-${idx}`,
        ...v,
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${term} ${v.searchQuery}`.trim())}`,
        searchQuery: `${term} ${v.searchQuery}`.trim(),
      }));

      return res.json({ success: true, source: 'curated-academic-engine', videos: formatted });
    } catch (err: any) {
      console.error('Video suggestion error:', err);
      res.status(500).json({ error: err.message || 'Failed to suggest videos' });
    }
  });

  // API 3: Gemini concept solver
  // ✅ FIX 3: Prompt no longer forces subject context — answers the actual question
  app.post('/api/gemini/solve-concept', async (req, res) => {
    try {
      const { prompt, subjectName } = req.body;
      const ai = getGenAIClient();

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: `You are an expert academic tutor. The student is studying "${subjectName || 'general academics'}" but answer based on what the question is ACTUALLY about — do not force the subject context if unrelated.

Question: "${prompt}"

Respond in Markdown:
1. **Core Governing Principle / Axiom**
2. **Step-by-Step Derivation or Logical Execution**
3. **Common Exam Traps & Intuition Trick**`,
        });

        return res.json({ success: true, solution: response.text });
      }

      // Fallback only if no API key
      return res.json({
        success: true,
        solution: `### ${prompt}\n\n**Note:** AI is not configured. Add GEMINI_API_KEY to your environment variables.`,
      });
    } catch (err: any) {
      console.error('Solve concept error:', err);
      res.status(500).json({ error: err.message || 'Error generating solution' });
    }
  });

  // Vite middleware for dev, static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyOrbit running on http://localhost:${PORT}`);
  });
}

startServer();