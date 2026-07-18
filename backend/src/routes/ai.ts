import express from "express";
import OpenAI from "openai";

const router = express.Router();

// AI request timeout (30 seconds)
const AI_TIMEOUT = parseInt(process.env.AI_TIMEOUT || "30000");

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// Lazy initialization of AI clients - they will be created on first request
let cerebras: OpenAI | null | undefined = undefined;
let openai: OpenAI | null | undefined = undefined;

function getCerebrasClient(): OpenAI | null {
  if (cerebras !== undefined) {
    return cerebras;
  }
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (apiKey) {
    cerebras = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.cerebras.ai/v1",
    });
    console.log("✓ CEREBRAS_API_KEY detected");
    console.log("✓ Cerebras AI service initialized");
  } else {
    cerebras = null;
    console.warn("⚠ CEREBRAS_API_KEY not found in environment");
  }
  return cerebras;
}

function getOpenAIClient(): OpenAI | null {
  if (openai !== undefined) {
    return openai;
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    openai = new OpenAI({ apiKey: apiKey });
  } else {
    openai = null;
  }
  return openai;
}

interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

interface AiRequest {
  question: string;
  history: AiMessage[];
  scanContext?: {
    url: string;
    technologies: any;
    security: any;
    performance: any;
    seo: any;
    design: any;
    scores: any;
  };
}

// Build system prompt with scan context
function buildSystemPrompt(scanContext?: AiRequest["scanContext"]): string {
  let prompt = `You are WebScope AI, a helpful website analysis assistant. 
You provide detailed, technical insights about websites based on scan data.
Be concise but thorough. Use markdown formatting when appropriate.
Never fabricate data - only use what's provided in the context.

`;

  if (scanContext) {
    prompt += `Current website context:
- URL: ${scanContext.url}
- Technologies: ${JSON.stringify(scanContext.technologies)}
- Security: ${JSON.stringify(scanContext.security)}
- Performance: ${JSON.stringify(scanContext.performance)}
- SEO: ${JSON.stringify(scanContext.seo)}
- Design: ${JSON.stringify(scanContext.design)}
- Scores: ${JSON.stringify(scanContext.scores)}

`;
  }

  prompt += `Respond to the user's question about the website or general web development topics.
If the question is about the scanned website, use the context above.
If no context is available, provide general helpful information.`;

  return prompt;
}

// Call Cerebras API (non-streaming)
async function callCerebras(
  question: string,
  history: AiMessage[],
  scanContext?: AiRequest["scanContext"],
): Promise<string> {
  const client = getCerebrasClient();
  if (!client) {
    throw new Error("Cerebras API key not configured");
  }

  const systemPrompt = buildSystemPrompt(scanContext);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: question },
  ];

  try {
    const completion = await Promise.race([
      client.chat.completions.create({
        model: "gpt-oss-120b",
        messages,
        max_tokens: 8000,
        temperature: 0.7,
        stream: false,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Cerebras API timeout")), AI_TIMEOUT)
      ),
    ]);

    const typedCompletion = completion as any;
    return typedCompletion.choices[0]?.message?.content || "No response from AI";
  } catch (error) {
    console.error("Cerebras API error:", error);
    throw new Error(
      `Cerebras API error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Call Cerebras API (streaming)
async function* callCerebrasStream(
  question: string,
  history: AiMessage[],
  scanContext?: AiRequest["scanContext"],
): AsyncGenerator<string, void, unknown> {
  const client = getCerebrasClient();
  if (!client) {
    throw new Error("Cerebras API key not configured");
  }

  const systemPrompt = buildSystemPrompt(scanContext);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: question },
  ];

  const stream = await client.chat.completions.create({
    model: "gpt-oss-120b",
    messages,
    max_tokens: 8000,
    temperature: 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

// Call OpenAI API
async function callOpenAI(
  question: string,
  history: AiMessage[],
  scanContext?: AiRequest["scanContext"],
): Promise<string> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error("OpenAI API key not configured");
  }

  const systemPrompt = buildSystemPrompt(scanContext);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: question },
  ];

  try {
    const completion = await Promise.race([
      client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 8000,
        temperature: 0.7,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("OpenAI API timeout")), AI_TIMEOUT)
      ),
    ]);

    const typedCompletion = completion as any;
    return typedCompletion.choices[0]?.message?.content || "No response from AI";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(
      `OpenAI API error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Main AI chat endpoint
router.post(
  "/chat",
  async (req: express.Request<{}, {}, AiRequest>, res: express.Response) => {
    try {
      // Rate limiting
      const clientIp = req.ip || req.connection.remoteAddress || "unknown";
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({
          error: "Rate limit exceeded",
          message: "Too many AI requests. Please try again later.",
        });
      }

      const { question, history, scanContext } = req.body;

      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      let answer: string;
      let provider: string;

      // Try providers in order of preference
      const aiProvider = process.env.AI_PROVIDER || "cerebras";
      const errors: string[] = [];

      if (aiProvider === "cerebras") {
        try {
          answer = await callCerebras(question, history || [], scanContext);
          provider = "Cerebras Cloud";
        } catch (e) {
          const errorMsg = `Cerebras: ${e instanceof Error ? e.message : "Unknown error"}`;
          errors.push(errorMsg);
          console.warn("Cerebras failed, trying OpenAI:", errorMsg);
          try {
            answer = await callOpenAI(question, history || [], scanContext);
            provider = "OpenAI";
          } catch (openaiError) {
            const openaiErrorMsg = `OpenAI: ${openaiError instanceof Error ? openaiError.message : "Unknown error"}`;
            errors.push(openaiErrorMsg);
            throw new Error(`All AI providers failed: ${errors.join("; ")}`);
          }
        }
      } else if (aiProvider === "openai") {
        try {
          answer = await callOpenAI(question, history || [], scanContext);
          provider = "OpenAI";
        } catch (e) {
          const errorMsg = `OpenAI: ${e instanceof Error ? e.message : "Unknown error"}`;
          errors.push(errorMsg);
          console.warn("OpenAI failed, trying Cerebras:", errorMsg);
          try {
            answer = await callCerebras(question, history || [], scanContext);
            provider = "Cerebras Cloud";
          } catch (cerebrasError) {
            const cerebrasErrorMsg = `Cerebras: ${cerebrasError instanceof Error ? cerebrasError.message : "Unknown error"}`;
            errors.push(cerebrasErrorMsg);
            throw new Error(`All AI providers failed: ${errors.join("; ")}`);
          }
        }
      } else {
        // Try any available provider
        try {
          answer = await callCerebras(question, history || [], scanContext);
          provider = "Cerebras Cloud";
        } catch (e) {
          const errorMsg = `Cerebras: ${e instanceof Error ? e.message : "Unknown error"}`;
          errors.push(errorMsg);
          console.warn("Cerebras failed, trying OpenAI:", errorMsg);
          try {
            answer = await callOpenAI(question, history || [], scanContext);
            provider = "OpenAI";
          } catch (openaiError) {
            const openaiErrorMsg = `OpenAI: ${openaiError instanceof Error ? openaiError.message : "Unknown error"}`;
            errors.push(openaiErrorMsg);
            throw new Error(`All AI providers failed: ${errors.join("; ")}`);
          }
        }
      }

      res.json({ answer, provider });
    } catch (error) {
      console.error("AI error:", error);
      res.status(500).json({
        error: "AI request failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

// Streaming AI chat endpoint
router.post(
  "/chat/stream",
  async (req: express.Request<{}, {}, AiRequest>, res: express.Response) => {
    try {
      // Rate limiting
      const clientIp = req.ip || req.connection.remoteAddress || "unknown";
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({
          error: "Rate limit exceeded",
          message: "Too many AI requests. Please try again later.",
        });
      }

      const { question, history, scanContext } = req.body;

      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      // Set headers for Server-Sent Events
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Access-Control-Allow-Origin", "*");

      let answer = "";
      let provider = "Cerebras Cloud";

      // Try Cerebras streaming first
      try {
        for await (const chunk of callCerebrasStream(question, history || [], scanContext)) {
          answer += chunk;
          res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
        }
        res.write(`data: ${JSON.stringify({ answer, provider, done: true })}\n\n`);
        res.end();
        return;
      } catch (e) {
        console.warn("Cerebras streaming failed, trying non-streaming:", e);
      }

      // Fallback to non-streaming (send as single SSE event)
      try {
        answer = await callCerebras(question, history || [], scanContext);
        provider = "Cerebras Cloud";
      } catch (e) {
        console.warn("Cerebras failed, trying OpenAI:", e);
        try {
          answer = await callOpenAI(question, history || [], scanContext);
          provider = "OpenAI";
        } catch (openaiError) {
          const errorMsg = `All AI providers failed: Cerebras: ${e instanceof Error ? e.message : "Unknown error"}; OpenAI: ${openaiError instanceof Error ? openaiError.message : "Unknown error"}`;
          throw new Error(errorMsg);
        }
      }

      // Send the complete answer as a single SSE event
      res.write(`data: ${JSON.stringify({ answer, provider, done: true })}\n\n`);
      res.end();
      return;
    } catch (error) {
      console.error("AI streaming error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "AI request failed",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      } else {
        res.write(`data: ${JSON.stringify({ error: "AI request failed", message: error instanceof Error ? error.message : "Unknown error", done: true })}\n\n`);
        res.end();
      }
    }
  },
);

// Health check
router.get("/health", (req: express.Request, res: express.Response) => {
  // Initialize clients to log their status
  const cerebrasClient = getCerebrasClient();
  const openaiClient = getOpenAIClient();
  
  const providers = {
    cerebras: !!cerebrasClient,
    openai: !!openaiClient,
  };
  res.json({ status: "ok", providers, currentProvider: process.env.AI_PROVIDER || "cerebras" });
});

export default router;