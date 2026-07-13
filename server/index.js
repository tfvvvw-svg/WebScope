import express from 'express';
import cors from 'cors';
import scanRoutes from './routes/scan.js';
import aiRoutes from './routes/ai.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import * as log from './logger/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  log.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/scan', scanRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  log.info(`WebScope server running on http://localhost:${PORT}`);
  console.log(`🚀 WebScope backend server started on http://localhost:${PORT}`);
});