import { generateAiResponse } from '../services/aiService.js';

export async function aiChat(req, res, next) {
  try {
    const { question, report } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Question is required',
      });
    }

    if (!report) {
      return res.status(400).json({
        success: false,
        error: 'Report data is required',
      });
    }

    const response = generateAiResponse(question, report);

    res.json({
      success: true,
      data: response,
    });
  } catch (err) {
    next(err);
  }
}