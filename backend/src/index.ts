import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env from the backend directory FIRST, before any other imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, "..", ".env");
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("⚠ Failed to load .env file:", result.error);
} else {
  console.log("✓ backend/.env loaded");
}

// Log the API key status (without exposing the key)
if (process.env.CEREBRAS_API_KEY) {
  console.log("✓ CEREBRAS_API_KEY detected (length:", process.env.CEREBRAS_API_KEY.length, ")");
} else {
  console.warn("⚠ CEREBRAS_API_KEY not found in environment");
}

import express from "express";
import cors from "cors";
import helmet from "helmet";
import scanRoutes from "./routes/scan.js";
import aiRoutes from "./routes/ai.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS configuration
const isAllowedOrigin = (origin: string | undefined) => {
  if (!origin) {
    return true;
  }

  try {
    const parsed = new URL(origin);
    const host = parsed.hostname.toLowerCase();
    const isLocalHost = ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(
      host,
    );
    // Allow localhost for development and any origin for production (Render)
    // The frontend is deployed on a different domain, so we need to allow all origins
    return true;
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  }),
);

// Body parsing
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  express.json({ limit: "10mb", strict: false })(req, res, (err) => {
    if (err) {
      if (err.type === "entity.parse.failed") {
        req.body = {};
        return next();
      }
      return next(err);
    }
    next();
  });
});
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/scan", scanRoutes);
app.use("/api/ai", aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  },
);

app.listen(PORT, () => {
  console.log(`WebScope Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});