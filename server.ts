import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';

const PORT = 3000;
const ADMIN_EMAIL = 'bansalsidhi26@gmail.com';
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

interface FirebaseAppletConfig {
  apiKey?: string;
  projectId?: string;
}

function getFirebaseApiKey(): string {
  try {
    const raw = fs.readFileSync(path.resolve(process.cwd(), 'firebase-applet-config.json'), 'utf-8');
    const parsed = JSON.parse(raw) as FirebaseAppletConfig;
    return parsed.apiKey ?? '';
  } catch {
    return '';
  }
}

function getDemoReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('style') || lower.includes('minimal') || lower.includes('modern') || lower.includes('warm')) {
    return 'Demo Preview Mode (AI API key not configured): Based on your aesthetic sensibility, our studio often pairs Architectural Warm Minimalism with Organic Travertine & Smoked Oak—balancing warm ivory limewash walls, bespoke fluted joinery, and brushed champagne brass accents. Would you like to book a private consultation to explore material samples in person?';
  }
  if (lower.includes('service') || lower.includes('offer') || lower.includes('process')) {
    return 'Demo Preview Mode (AI API key not configured): LUXORA LIVING provides full-scope Turnkey Residential Interiors, Architectural Space Planning, Bespoke Millwork & Furniture Design, Penthouse Styling, and Boutique Hospitality spaces across a structured 5-phase studio process. Share your property details in our Consultation form to receive a tailored scope proposal.';
  }
  if (lower.includes('consult') || lower.includes('book') || lower.includes('price') || lower.includes('cost')) {
    return 'Demo Preview Mode (AI API key not configured): Private consultations can be scheduled directly via our Consultation section below or through our WhatsApp concierge. Our Principal Designers begin with a spatial audit, concept moodboard, and investment roadmap tailored to your timeline.';
  }
  return 'Demo Preview Mode (AI API key not configured): Thank you for reaching out to LUXORA LIVING. I can guide you through our turnkey residential and hospitality design services, suggest bespoke architectural styles, or help you prepare for a private design consultation. Live Gemini AI responses activate automatically once GEMINI_API_KEY is configured on the server.';
}

async function verifyAdminToken(authHeader: string | undefined): Promise<{ email: string } | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken) return null;

  const apiKey = getFirebaseApiKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      users?: Array<{ email?: string; emailVerified?: boolean }>;
    };
    const user = data.users?.[0];
    if (!user || !user.email || !user.emailVerified) return null;
    if (user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return null;
    }
    return { email: user.email };
  } catch {
    return null;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    const key = process.env.GEMINI_API_KEY;
    const aiConfigured = Boolean(key && key !== 'MY_GEMINI_API_KEY');
    res.json({ ok: true, aiConfigured });
  });

  // LUXORA AI Server-Side Chat Endpoint
  app.post('/api/ai/chat', async (req, res) => {
    const { message, history, studioContext } = req.body as {
      message?: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
      studioContext?: {
        services?: string[];
        projects?: string[];
      };
    };

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Please enter a message for LUXORA AI.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json({
        demoMode: true,
        reply: getDemoReply(message),
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const servicesSummary = studioContext?.services?.length
        ? studioContext.services.join(', ')
        : 'Turnkey Residential Interiors, Architectural Space Planning, Bespoke Millwork & Furniture, Penthouse & Villa Styling, Boutique Hospitality Spaces, Lighting & Material Curation';

      const projectsSummary = studioContext?.projects?.length
        ? studioContext.projects.join(', ')
        : 'The Obsidian Penthouse (Manhattan), Ivory Travertine Sanctuary (Beverly Hills), Atelier Noir Culinary Suite (Zurich), Olive Courtyard Villa (Lake Como)';

      const systemInstruction = `You are LUXORA AI, the refined personal design concierge for LUXORA LIVING — an international luxury interior design studio ("Designing Spaces. Defining Elegance.").

Your tone is calm, architectural, knowledgeable, warm, and deeply tasteful—never salesy, never robotic, never using excessive exclamation marks or buzzwords.
Keep replies concise (2-4 clear sentences or brief structured points) and practical.

Studio Profile:
- Aesthetic DNA: Warm Ivory (#F5F1EA), Champagne Gold (#C6A15B), Charcoal Black (#252522), honed travertine, Venetian limewash plaster, smoked walnut, Belgian linen, and sculptural brass lighting.
- Services: ${servicesSummary}.
- Signature Works: ${projectsSummary}.
- Design Process (5 Phases): 01. Discovery & Spatial Audit, 02. Concept & Material Palette, 03. Technical Drawings & 3D Visualization, 04. Artisan Fabrication & Procurement, 05. White-Glove Installation & Styling.
- Consultation: Visitors can book a private consultation directly in the Consultation Booking section or send a direct studio enquiry from this assistant.

Capabilities:
1. Answer questions about LUXORA LIVING's services, process, materials, timelines, and featured projects.
2. Recommend tailored interior design styles based on a visitor's lifestyle, room type, lighting, and material preferences.
3. Encourage visitors ready to begin a project to share their details via the Consultation Enquiry option.`;

      const recentHistory = Array.isArray(history)
        ? history.slice(-8).map((item) => ({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: String(item.content).slice(0, 1200) }],
          }))
        : [];

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: [
          ...recentHistory,
          { role: 'user', parts: [{ text: message.trim().slice(0, 1500) }] },
        ],
        config: {
          systemInstruction,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'LUXORA AI did not return a response. Please try again.' });
        return;
      }

      res.json({ demoMode: false, reply });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to reach LUXORA AI right now.';
      console.error('LUXORA AI error:', msg);
      res.status(500).json({
        error: 'LUXORA AI is temporarily unavailable. You can still submit a consultation enquiry directly below.',
      });
    }
  });

  // Protected Admin Image Upload Endpoint
  app.post('/api/upload', async (req, res) => {
    const admin = await verifyAdminToken(req.headers.authorization);
    if (!admin) {
      res.status(401).json({ error: 'Administrator authentication required to upload project images.' });
      return;
    }

    const { filename, mimeType, dataBase64 } = req.body as {
      filename?: string;
      mimeType?: string;
      dataBase64?: string;
    };

    const allowedMimes: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };

    if (!mimeType || !allowedMimes[mimeType] || !dataBase64) {
      res.status(400).json({ error: 'Please upload a valid JPG, PNG, or WebP image.' });
      return;
    }

    const base64Clean = dataBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');
    if (buffer.byteLength === 0 || buffer.byteLength > 8 * 1024 * 1024) {
      res.status(400).json({ error: 'Image size must be under 8 MB.' });
      return;
    }

    const slug = (filename || 'project')
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'project';
    const uniqueName = `${slug}-${crypto.randomBytes(4).toString('hex')}.${allowedMimes[mimeType]}`;
    const targetPath = path.join(UPLOADS_DIR, uniqueName);
    fs.writeFileSync(targetPath, buffer);

    res.json({ url: `/uploads/${uniqueName}` });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LUXORA LIVING server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
