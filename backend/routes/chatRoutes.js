const express = require('express');
const router = express.Router();
const { chatController } = require('../controllers/chatController');
const { validateChatInput } = require('../middleware/validateChat');

// POST /api/chat & /api/chat/stream
router.post('/chat', validateChatInput, chatController);
router.post('/chat/stream', validateChatInput, (req, res, next) => {
  req.body.stream = true;
  chatController(req, res, next);
});

module.exports = router;
