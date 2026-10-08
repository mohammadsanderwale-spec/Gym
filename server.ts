import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Chat endpoint (multi-turn conversation with role-specific system instructions)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, role = 'general', model = 'gemini-3.5-flash', customPrompt } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the environment.',
        text: 'AI services require GEMINI_API_KEY. Please ensure your API key is configured.',
      });
    }

    if (!ai) {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }

    let systemInstruction = 'You are an expert fitness and retention assistant for a local Indian gym.';
    if (role === 'gym-advisor') {
      systemInstruction =
        'You are the Gym Retention & Business Advisor for an Indian gym owner/manager. ' +
        'Help with silent churn prevention, crafting polite yet high-converting WhatsApp follow-up messages in Hindi/English, ' +
        'pricing strategy, personal training packages, and membership renewal loops. Speak practically in English and respectful Hinglish when helpful.';
    } else if (role === 'diet-coach') {
      systemInstruction =
        'You are a Certified Indian Fitness & Diet Nutritionist. ' +
        'Guide gym members with realistic Indian nutrition (vegetarian and non-vegetarian sources like paneer, soya, dal, sprouts, eggs, chicken, whey protein), ' +
        'workout recovery, muscle building, fat loss, hydration, and safe supplement guidance without medical claims. Be friendly, motivating, and culturally attuned.';
    } else if (role === 'support-bot') {
      systemInstruction =
        'You are the Front-Desk & Member Care Assistant for IronForge Fitness Club. ' +
        'Answer questions regarding attendance rules, fair streak tracking, membership freezes/pauses, timings (6 AM - 10 PM), ' +
        'and personal trainer consultations clearly and courteously.';
    }

    // Convert messages to GenAI contents format
    // Expected contents format: array of { role: 'user' | 'model', parts: [{ text: string }] }
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(messages) && messages.length > 0) {
      for (const msg of messages) {
        contents.push({
          role: msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(msg.text || msg.content || '') }],
        });
      }
    } else if (customPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: String(customPrompt) }],
      });
    } else {
      return res.status(400).json({ error: 'No messages provided' });
    }

    // Choose requested model: gemini-3.1-pro-preview for complex tasks, gemini-3.5-flash for general, gemini-3.1-flash-lite for fast
    const selectedModel = model || 'gemini-3.5-flash';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      text: response.text || '',
      model: selectedModel,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    // If complex model fails, attempt fallback to gemini-3.8-flash
    try {
      if (ai && req.body.model === 'gemini-3.1-pro-preview') {
        const fallback = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: req.body.messages?.map((m: any) => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: String(m.text || m.content || '') }],
          })) || [{ role: 'user', parts: [{ text: 'Hello' }] }],
        });
        return res.json({ text: fallback.text || '', model: 'gemini-3.8-flash', fallback: true });
      }
    } catch {
      // Fallback failed
    }

    return res.status(500).json({
      error: error?.message || 'Failed to generate response from Gemini API',
    });
  }
});

// Image analysis endpoint (uses gemini-3.1-pro-preview as specified)
app.post('/api/gemini/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt, analysisType = 'meal' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the environment.',
      });
    }

    if (!ai) {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }

    // Extract mimeType and raw base64 data cleanly from data URLs
    let detectedMime = mimeType || 'image/jpeg';
    let cleanBase64 = imageBase64;

    const dataUrlMatch = imageBase64.match(/^data:([^;]+);base64,(.*)$/s);
    if (dataUrlMatch) {
      detectedMime = dataUrlMatch[1];
      cleanBase64 = dataUrlMatch[2];
    } else {
      cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    }

    // Remove any newlines or spaces
    cleanBase64 = cleanBase64.replace(/\s+/g, '');

    // Fallback if client sent an SVG or non-base64 string
    if (cleanBase64.startsWith('<') || detectedMime.includes('svg')) {
      // Encode the text into actual base64 bytes
      cleanBase64 = Buffer.from(cleanBase64).toString('base64');
      detectedMime = 'image/png';
    }

    // Normalize mimeType for Gemini API (must be standard image MIME type)
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(detectedMime)) {
      detectedMime = 'image/jpeg';
    }

    let effectivePrompt = prompt;
    if (!effectivePrompt) {
      if (analysisType === 'meal') {
        effectivePrompt =
          'You are a professional sports nutritionist for gym athletes and Indian fitness enthusiasts. ' +
          'Analyze this food/meal image in detail. Provide: ' +
          '1. Identified Food Items & Ingredients\n' +
          '2. Estimated Calories & Macronutrient Breakdown (Protein in grams, Carbohydrates in grams, Healthy Fats in grams)\n' +
          '3. Fitness Suitability Rating (Pre-workout, Post-workout, Muscle Gain, Fat Loss)\n' +
          '4. Practical Improvement Tips (e.g., add paneer/eggs/dal for higher protein, decrease excess oil/sugar).\n' +
          'Keep your tone encouraging, practical, and clear.';
      } else if (analysisType === 'workout_form') {
        effectivePrompt =
          'You are an experienced strength and conditioning gym coach. ' +
          'Analyze this gym exercise posture or gym equipment setup photo. Provide: ' +
          '1. Exercise or Equipment Identified\n' +
          '2. Key Posture & Biomechanical Checkpoints (Spine neutrality, joint alignment, grip, foot placement)\n' +
          '3. Safety & Injury Prevention Alerts\n' +
          '4. Three Actionable Cues for Maximum Hypertrophy / Strength.\n' +
          'Be concise, sharp, and encouraging.';
      } else {
        effectivePrompt =
          'Analyze this image in the context of gym fitness, membership, workout verification, or nutrition, and provide an insightful evaluation.';
      }
    }

    const imagePart = {
      inlineData: {
        mimeType: detectedMime,
        data: cleanBase64,
      },
    };

    const textPart = {
      text: effectivePrompt,
    };

    // Prompt specifies: "You MUST add image understanding to the app using model gemini-3.1-pro-preview"
    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: { parts: [imagePart, textPart] },
      });
    } catch (err: any) {
      console.warn('gemini-3.1-pro-preview error, trying gemini-3.8-flash fallback:', err?.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts: [imagePart, textPart] },
      });
    }

    return res.json({
      text: response.text || '',
      analysisType,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze-image:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze image with Gemini model',
    });
  }
});

// Production vs Development middleware
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
