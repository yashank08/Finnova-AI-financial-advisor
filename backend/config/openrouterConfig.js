const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Retrieves the OpenRouter API Key from environment variables.
 * @returns {string|null} The trimmed API key or null if missing/placeholder.
 */
const getApiKey = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openrouter_api_key' || apiKey === 'YOUR_OPENROUTER_API_KEY') {
    return null;
  }
  return apiKey.trim();
};

const OPENROUTER_CONFIG = {
  baseUrl: 'https://openrouter.ai/api/v1',
  endpoint: '/chat/completions',
  fullUrl: 'https://openrouter.ai/api/v1/chat/completions',
  defaultModel: 'openai/gpt-4.1-mini',
  fallbackModels: [
    'openai/gpt-4o-mini',
    'google/gemini-2.5-flash',
    'meta-llama/llama-3.3-70b-instruct'
  ],
  temperature: 0.4,
  maxTokens: 1000,
  referer: 'http://localhost:3000',
  title: 'AI Financial Advisor'
};

module.exports = {
  getApiKey,
  OPENROUTER_CONFIG
};
