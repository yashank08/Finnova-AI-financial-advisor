const { generateFinancialAdvice, streamFinancialAdvice } = require('../services/chatService');

/**
 * Handles POST /api/chat & POST /api/chat/stream
 * Accepts { message: string, conversationHistory?: Array, history?: Array, profile?: Object, userProfile?: Object, levelTopic?: string, stream?: boolean }
 * Returns JSON { reply: string } or text/event-stream
 */
async function chatController(req, res, next) {
  try {
    const { message, conversationHistory, history, profile, userProfile, levelTopic, stream } = req.body;
    const historyToUse = conversationHistory || history || [];
    const profileToUse = profile || userProfile || null;
    const isStream = Boolean(stream) || req.headers.accept === 'text/event-stream';

    if (isStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let responseStream;
      try {
        responseStream = await streamFinancialAdvice(message, historyToUse, profileToUse, levelTopic);
      } catch (err) {
        res.status(err.statusCode || 500);
        res.write(`data: ${JSON.stringify({ error: err.message || 'Stream initialization failed' })}\n\n`);
        return res.end();
      }

      const reader = responseStream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      req.on('close', () => {
        reader.cancel();
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;

          if (trimmed === 'data: [DONE]') {
            res.write('data: [DONE]\n\n');
            return res.end();
          }

          if (trimmed.startsWith('data: ')) {
            try {
              const dataStr = trimmed.slice(6);
              const json = JSON.parse(dataStr);
              const deltaText = json.choices?.[0]?.delta?.content || '';
              if (deltaText) {
                res.write(`data: ${JSON.stringify({ content: deltaText })}\n\n`);
              }
            } catch (_) {
              // Ignore non-json chunk lines
            }
          }
        }
      }

      res.write('data: [DONE]\n\n');
      return res.end();
    } else {
      const reply = await generateFinancialAdvice(message, historyToUse, profileToUse, levelTopic);
      return res.status(200).json({
        reply: reply
      });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  chatController
};
