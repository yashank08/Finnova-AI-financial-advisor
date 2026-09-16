const { getApiKey, OPENROUTER_CONFIG } = require('../../config/openrouterConfig');

/**
 * Sends a completion request to OpenRouter API with automatic model fallback.
 * @param {Array<{role: string, content: string}>} messages - Array of OpenAI-formatted messages.
 * @param {Object} options - Execution options.
 * @param {boolean} options.stream - Whether to stream the response via SSE.
 * @returns {Promise<string|ReadableStream>} Text response or response body stream.
 */
async function generateCompletion(messages, options = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    const error = new Error('OpenRouter API key is not configured. Please add OPENROUTER_API_KEY=your_key in backend/.env and restart the server.');
    error.statusCode = 503;
    throw error;
  }

  const isStream = Boolean(options.stream);
  const models = [OPENROUTER_CONFIG.defaultModel, ...OPENROUTER_CONFIG.fallbackModels];
  let lastError = null;

  for (let i = 0; i < models.length; i++) {
    const modelToUse = models[i];
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': OPENROUTER_CONFIG.referer,
      'X-Title': OPENROUTER_CONFIG.title
    };

    const payload = {
      model: modelToUse,
      messages: messages,
      temperature: options.temperature ?? OPENROUTER_CONFIG.temperature,
      max_tokens: options.maxTokens ?? OPENROUTER_CONFIG.maxTokens,
      stream: isStream
    };

    try {
      const response = await fetch(OPENROUTER_CONFIG.fullUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        if (isStream) {
          return response.body;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content !== undefined && content !== null) {
          return String(content).trim();
        }

        throw new Error(`OpenRouter returned empty content for model ${modelToUse}`);
      }

      // Handle non-OK HTTP statuses
      const status = response.status;
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (_) {}

      const errorMsg = errorData.error?.message || errorData.message || response.statusText;

      // 401 Unauthorized -> invalid API key (no retry will fix this)
      if (status === 401 || (errorMsg && errorMsg.toLowerCase().includes('api key'))) {
        const err = new Error('Invalid OpenRouter API key. Please check your OPENROUTER_API_KEY in backend/.env.');
        err.statusCode = 401;
        throw err;
      }

      // Save error and log fallback warning if more models remain
      lastError = new Error(`OpenRouter API error (${status}): ${errorMsg}`);
      lastError.statusCode = status;

      console.warn(`[OpenRouter Provider] Model "${modelToUse}" failed (${status}: ${errorMsg}). ${i < models.length - 1 ? 'Falling back to next model...' : 'No more fallbacks available.'}`);
    } catch (err) {
      if (err.statusCode === 401 || err.statusCode === 503) {
        throw err;
      }

      lastError = err;
      console.warn(`[OpenRouter Provider] Error calling model "${modelToUse}": ${err.message}. ${i < models.length - 1 ? 'Retrying with next fallback model...' : 'All models failed.'}`);
    }
  }

  // If all models failed, throw user-friendly error
  if (lastError) {
    if (lastError.statusCode === 429) {
      const err = new Error('Rate limit exceeded on OpenRouter API. Please wait a moment and try again.');
      err.statusCode = 429;
      throw err;
    }
    if (lastError.statusCode === 504 || (lastError.message && lastError.message.includes('fetch failed'))) {
      const err = new Error('Could not reach OpenRouter API. Please check your internet connection.');
      err.statusCode = 504;
      throw err;
    }
    throw lastError;
  }

  const fallbackErr = new Error('Failed to generate response from OpenRouter API.');
  fallbackErr.statusCode = 500;
  throw fallbackErr;
}

module.exports = {
  generateCompletion
};
