import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const PORT = 3000;

// Lazy/Safe initialization of GoogleGenAI
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

//client for Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // never expose this to frontend
);

// Pre-curated educational knowledge base for YouTube suggestions
const CURATED_YOUTUBE_RESOURCES: Record<
  string,
  Array<{
    title: string;
    channelName: string;
    duration: string;
    youtubeUrl: string;
    embedUrl?: string;
    searchQuery: string;
    recommendedReason: string;
    keyTopics: string[];
    badge: string;
  }>
> = {
  calculus: [
    {
      title: "Green's Theorem Explained Visually | 3Blue1Brown (Essence of Calculus)",
      channelName: '3Blue1Brown',
      duration: '18 mins',
      youtubeUrl: 'https://www.youtube.com/results?search_query=3blue1brown+greens+theorem+visual+calculus',
      embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      searchQuery: "3blue1brown green's theorem visual calculus",
      recommendedReason: 'Provides geometric intuition of 2D microscopic fluid circulation and boundary line integration.',
      keyTopics: ['Curl intuition', 'Boundary line integrals', 'Flux vs Circulation'],
      badge: 'Visual Intuition',
    },
    {
      title: "Multivariable Calculus: Line Integrals & Green's Theorem - Full Masterclass",
      channelName: 'Professor Leonard',
      duration: '42 mins',
      youtubeUrl: 'https://www.youtube.com/results?search_query=professor+leonard+greens+theorem+line+integrals',
      searchQuery: 'professor leonard greens theorem line integrals',
      recommendedReason: 'Comprehensive step-by-step lecture covering complex exam-level integration examples.',
      keyTopics: ['Jordan curves', 'Partial derivatives setup', 'Planar area shortcuts'],
      badge: 'Exam Walkthrough',
    },
    {
      title: "Green's Theorem Examples & Practice Problems",
      channelName: 'The Organic Chemistry Tutor',
      duration: '22 mins',
      youtubeUrl: 'https://www.youtube.com/results?search_query=the+organic+chemistry+tutor+greens+theorem+problems',
      searchQuery: 'organic chemistry tutor greens theorem problems',
      recommendedReason: 'Direct formula drills with 5 step-by-step solved problems for rapid review.',
      keyTopics: ['Counterclockwise orientation', 'Standard notation', 'Vector field curl'],
      badge: 'Problem Drill',
    },
  ],
  algorithms: [
    {
      title: 'Binary Search Algorithm & O(log n) Time Complexity Visually Explained',
      channelName: 'NeetCode',
      duration: '14 mins',
      youtubeUrl: 'https://www.youtube.com/results?search_query=neetcode+binary+search+algorithm+explained',
      searchQuery: 'neetcode binary search algorithm explained',
      recommendedReason: 'Detailed boundary index pointers handling (left <= right) and off-by-one edge cases.',
      keyTopics: ['Two pointer index logic', 'Integer overflow prevention', 'Search space reduction'],
      badge: 'Coding Interview',
    },
    {
      title: 'Binary Search in 100 Seconds',
      channelName: 'Fireship',
      duration: '2 mins',
      youtubeUrl: 'https://www.youtube.com/results?search_query=fireship+binary+search+in+100+seconds',
      searchQuery: 'fireship binary search in 100 seconds',
      recommendedReason: 'Ultra-fast visual overview of logarithmic divide and conquer search.',
      keyTopics: ['O(log n) complexity', 'Sorted array invariant', 'Memory layout'],
      badge: 'Fast Recap',
    },
    {
      title: 'MIT 6.006: Introduction to Algorithms - Binary Search Trees & Divide/Conquer',
      channelName: 'MIT OpenCourseWare',
      duration: '48 mins',
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
      channelName: 'The Organic Chemistry Tutor',
      duration: '26 mins',
      youtubeUrl: 'https://www.youtube.com/results?search_query=organic+chemistry+tutor+sn1+vs+sn2+stereochemistry',
      searchQuery: 'organic chemistry tutor sn1 vs sn2 stereochemistry',
      recommendedReason: 'Clear comparison table covering carbocation stability, polar protic vs aprotic solvents, and Walden inversion.',
      keyTopics: ['Nucleophile strength', 'Solvent effects', 'Stereochemical outcome'],
      badge: 'Concept Breakdown',
    },
    {
      title: 'Substitution Reactions (SN1 and SN2) - Khan Academy Organic Chemistry',
      channelName: 'Khan Academy',
      duration: '16 mins',
      youtubeUrl: 'https://www.youtube.com/results?search_query=khan+academy+organic+chemistry+sn1+sn2',
      searchQuery: 'khan academy organic chemistry sn1 sn2',
      recommendedReason: 'Intuitive electron push arrow mechanisms and transition state energy diagrams.',
      keyTopics: ['Backside attack', 'Leaving group ability', 'Rate law kinetics'],
      badge: 'Core Concept',
    },
  ],
  economics: [
    {
      title: 'Monetary vs Fiscal Policy - Macroeconomics CrashCourse',
      channelName: 'CrashCourse',
      duration: '12 mins',
      youtubeUrl: 'https://www.youtube.com/results?search_query=crashcourse+monetary+fiscal+policy+macroeconomics',
      searchQuery: 'crashcourse monetary fiscal policy macroeconomics',
      recommendedReason: 'Visual breakdown of interest rates, reserve ratios, taxation, and aggregate demand shifts.',
      keyTopics: ['Central Bank operations', 'Government spending multiplier', 'Inflation targeting'],
      badge: 'High Yield',
    },
  ],
  physics: [
    {
      title: "Maxwell's Equations & Vector Calculus in Electromagnetism",
      channelName: '3Blue1Brown',
      duration: '21 mins',
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
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API 2: Gemini-powered YouTube Video Search & Suggestion for Subject + Task
  app.post('/api/gemini/suggest-videos', async (req, res) => {
    try {
      const { subjectName, taskName, taskDescription, query } = req.body;
      const term = `${subjectName || ''} ${taskName || ''} ${query || ''}`.trim();
      const termLower = term.toLowerCase();

      const ai = getGenAIClient();

      if (ai) {
        try {
          const prompt = `You are an elite academic study tutor. Recommend 3 to 4 top-tier, highly educational YouTube tutorial videos for a student currently studying the following subject and task:
Subject: "${subjectName || 'Academic Course'}"
Task: "${taskName || 'Study Session'}"
Additional Notes: "${taskDescription || ''}"

Return ONLY a valid JSON array of objects with the following schema for each recommended video:
[
  {
    "title": "Exact or highly realistic popular video title (e.g. from Khan Academy, 3Blue1Brown, Professor Leonard, NeetCode, Organic Chemistry Tutor, MIT OCW, StatQuest, CrashCourse)",
    "channelName": "Channel Name (e.g. 3Blue1Brown, Khan Academy, NeetCode, The Organic Chemistry Tutor)",
    "duration": "e.g. 14 mins",
    "searchQuery": "optimal YouTube search query string to find this video",
    "youtubeUrl": "Direct search or watch URL (e.g. https://www.youtube.com/results?search_query=...)",
    "recommendedReason": "1-2 concise sentences explaining why this video specifically helps master this exact task",
    "keyTopics": ["Topic 1", "Topic 2", "Topic 3"],
    "badge": "e.g. Visual Intuition, Fast Review, Exam Walkthrough, Problem Drill, Deep Dive"
  }
]`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              systemInstruction:
                'You are an expert AI academic advisor. Always provide structured, factual, and high-quality YouTube educational video suggestions for students.',
            },
          });

          const rawText = response.text || '[]';
          let parsedVideos = [];
          try {
            parsedVideos = JSON.parse(rawText);
          } catch (err) {
            console.error('Failed to parse Gemini video JSON:', err);
          }

          if (Array.isArray(parsedVideos) && parsedVideos.length > 0) {
            const formatted = parsedVideos.map((v: any, idx: number) => ({
              id: `yt-gemini-${Date.now()}-${idx}`,
              title: v.title || `${subjectName}: ${taskName} Tutorial`,
              channelName: v.channelName || 'Academic Educator',
              duration: v.duration || '15 mins',
              youtubeUrl:
                v.youtubeUrl ||
                `https://www.youtube.com/results?search_query=${encodeURIComponent(
                  v.searchQuery || `${subjectName} ${taskName}`
                )}`,
              searchQuery: v.searchQuery || `${subjectName} ${taskName}`,
              recommendedReason:
                v.recommendedReason ||
                `Covers essential theorems and practice problems for ${taskName}.`,
              keyTopics: Array.isArray(v.keyTopics) ? v.keyTopics : [subjectName, taskName],
              badge: v.badge || 'Recommended',
            }));

            return res.json({
              success: true,
              source: 'gemini-ai',
              videos: formatted,
            });
          }
        } catch (geminiErr) {
          console.warn('Gemini API call failed, falling back to curated library:', geminiErr);
        }
      }

      // Fallback: Smart Curated Knowledge Matching
      let fallbackVideos = CURATED_YOUTUBE_RESOURCES.calculus;
      if (termLower.includes('algo') || termLower.includes('search') || termLower.includes('tree') || termLower.includes('code') || termLower.includes('binary')) {
        fallbackVideos = CURATED_YOUTUBE_RESOURCES.algorithms;
      } else if (termLower.includes('chem') || termLower.includes('sn1') || termLower.includes('sn2') || termLower.includes('reaction')) {
        fallbackVideos = CURATED_YOUTUBE_RESOURCES.chemistry;
      } else if (termLower.includes('econ') || termLower.includes('fiscal') || termLower.includes('monetary') || termLower.includes('market')) {
        fallbackVideos = CURATED_YOUTUBE_RESOURCES.economics;
      } else if (termLower.includes('physic') || termLower.includes('vector') || termLower.includes('wave') || termLower.includes('force')) {
        fallbackVideos = CURATED_YOUTUBE_RESOURCES.physics;
      }

      // Format fallback with dynamic query
      const formatted = fallbackVideos.map((v, idx) => ({
        id: `yt-curated-${idx}`,
        title: v.title,
        channelName: v.channelName,
        duration: v.duration,
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          `${subjectName || ''} ${taskName || ''} ${v.searchQuery}`.trim()
        )}`,
        searchQuery: `${subjectName || ''} ${taskName || ''} ${v.searchQuery}`.trim(),
        recommendedReason: v.recommendedReason,
        keyTopics: v.keyTopics,
        badge: v.badge,
      }));

      return res.json({
        success: true,
        source: 'curated-academic-engine',
        videos: formatted,
      });
    } catch (err: any) {
      console.error('Video suggestion error:', err);
      res.status(500).json({ error: err.message || 'Failed to suggest videos' });
    }
  });

  // API 3: Gemini Q&A and Concept Solver
  app.post('/api/gemini/solve-concept', async (req, res) => {
    try {
      const { prompt, subjectName } = req.body;
      const ai = getGenAIClient();

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: `You are an expert university professor in ${subjectName || 'Science & Engineering'}.
Provide a clear, step-by-step derivation, proof, or conceptual answer formatted in Markdown for the following student question:
"${prompt}"

Structure:
1. Core Governing Principle / Axiom
2. Step-by-Step Mathematical Derivation or Logical Execution
3. Common Exam Traps & Intuition Trick`,
        });

        return res.json({
          success: true,
          solution: response.text,
        });
      }

      // Fallback
      return res.json({
        success: true,
        solution: `### Concept Breakdown: ${subjectName || 'Study Guide'}\n\n**Topic:** ${prompt}\n\n1. **Core Governing Principle:** Analyze boundary conditions and identify key variables.\n2. **Step-by-Step Resolution:** Substitute initial parameters into standard equations.\n3. **Exam Tip:** Double check dimensions and asymptotic limits.`,
      });
    } catch (err: any) {
      console.error('Solve concept error:', err);
      res.status(500).json({ error: err.message || 'Error generating solution' });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyOrbit Server running on http://localhost:${PORT}`);
  });
}

startServer();
