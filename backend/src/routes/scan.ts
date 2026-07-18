import express from "express";
import { scanWebsite } from "../services/scanner.js";

const router = express.Router();

interface ScanRequest {
  url: string;
}

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

// Main scan endpoint
router.post(
  "/",
  async (req: express.Request<{}, {}, ScanRequest>, res: express.Response) => {
    try {
      // Rate limiting
      const clientIp = req.ip || req.connection.remoteAddress || "unknown";
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({
          error: "Rate limit exceeded",
          message: "Too many scan requests. Please try again later.",
        });
      }

      const url = req.body.url;

      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Validate URL format
      try {
        new URL(url.startsWith("http") ? url : `https://${url}`);
      } catch {
        return res.status(400).json({
          error: "Invalid URL format",
          message:
            "Please provide a valid URL (e.g., https://example.com or example.com)",
        });
      }

      console.log(`Scanning: ${url}`);

      // Perform scan
      const result = await scanWebsite(url);

      console.log(
        `Scan completed for ${url} result error=${result.error ? "yes" : "no"}`,
      );
      // Return result
      res.json(result);
    } catch (error) {
      console.error(
        "Scan error:",
        error instanceof Error ? error.stack || error.message : error,
      );
      res.status(500).json({
        error: "Scan failed",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        service: "scanRoute",
        function: "POST /api/scan",
      });
    }
  },
);

// Health check
router.get("/health", (req: express.Request, res: express.Response) => {
  res.json({ status: "ok", service: "scanner" });
});

export default router;
