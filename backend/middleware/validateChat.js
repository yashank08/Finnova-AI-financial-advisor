/**
 * Middleware to validate and sanitize chat request body.
 */
function validateChatInput(req, res, next) {
  const { message, conversationHistory, history } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      error: 'Invalid Request',
      message: 'The "message" field is required and must be a non-empty string.'
    });
  }

  const trimmedMessage = message.trim();

  // Limit message length to prevent abuse (max 2000 characters)
  if (trimmedMessage.length > 2000) {
    return res.status(400).json({
      error: 'Message Too Long',
      message: 'Message length exceeds the maximum allowed limit of 2000 characters.'
    });
  }

  const historyArray = conversationHistory !== undefined ? conversationHistory : history;

  // Ensure conversation history is an array if provided
  if (historyArray !== undefined && !Array.isArray(historyArray)) {
    return res.status(400).json({
      error: 'Invalid Request',
      message: 'The "conversationHistory" or "history" field must be an array.'
    });
  }

  // Attach sanitized message to req
  req.body.message = trimmedMessage;
  next();
}

module.exports = {
  validateChatInput
};
