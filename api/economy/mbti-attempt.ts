import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleMbtiEconomyRequest } from './mbti-completed.js';

export default function handler(request: VercelRequest, response: VercelResponse) {
  return handleMbtiEconomyRequest(request, response, 'attempt');
}
