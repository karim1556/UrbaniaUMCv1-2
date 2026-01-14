const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

let Groq;
try {
  Groq = require('groq-sdk').Groq;
} catch (e) {
  // If groq-sdk isn't installed, this route will fail; package.json update included.
  console.warn('groq-sdk not installed; please run `npm install` in server folder');
}

router.post('/chat', async (req, res) => {
  if (!Groq) return res.status(500).json({ message: 'Groq SDK not available on server' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ message: 'Server GROQ_API_KEY not configured' });

  const { messages, model = 'openai/gpt-oss-120b', temperature = 1, max_completion_tokens = 8192 } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: 'messages array is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  (async () => {
    try {
      const groq = new Groq({ apiKey });
      const chatCompletion = await groq.chat.completions.create({
        messages,
        model,
        temperature,
        max_completion_tokens,
        stream: true
      });

      for await (const chunk of chatCompletion) {
        // Send each chunk as an SSE data event. The client will parse JSON.
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      // Signal completion
      res.write('event: done\n\n');
      res.end();
    } catch (err) {
      console.error('Groq chat error:', err);
      try {
        const errPayload = { message: err.message || 'Groq error' };
        res.write(`event: error\ndata: ${JSON.stringify(errPayload)}\n\n`);
      } catch (e) {}
      res.end();
    }
  })();
});

module.exports = router;
