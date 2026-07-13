import axios from 'axios';
import type { WebScanReport } from '../types/scan';

const API_BASE = '/api';

export interface AiMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  sections?: AiSection[];
}

export interface AiSection {
  title: string;
  facts: string[];
  explanation: string;
  technical: string;
  recommendations: string[];
}

export async function sendAiQuestion(question: string, report: WebScanReport | Record<string, unknown>): Promise<{ text: string; sections: AiSection[] }> {
  const response = await axios.post<{ success: boolean; data: { text: string; sections: AiSection[] } }>(
    `${API_BASE}/ai/chat`,
    { question, report },
    { timeout: 10000 }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error('AI request failed');
  }

  return response.data.data;
}