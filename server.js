const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

// Load environment variables from .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Create OpenAI client using the API key from .env
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// TODO: Switch to Gemini API here if needed

app.use(cors());
app.use(express.json());

// Serve static frontend files from the current project folder
app.use(express.static(path.join(__dirname)));

app.post('/generate-reply', async (req, res) => {
  const { originalEmailSubject, originalEmailBody, senderName, senderEmail, voiceTranscript } = req.body;

  console.log('[AI] /generate-reply called');
  console.log('[AI] senderName:', senderName, 'subject:', originalEmailSubject);
  console.log('[AI] voiceTranscript snippet:', voiceTranscript?.slice(0, 120));

  if (!voiceTranscript || !originalEmailSubject || !originalEmailBody) {
    return res.status(400).json({
      error: 'originalEmailSubject, originalEmailBody, and voiceTranscript are required'
    });
  }

  const recipient = senderName || senderEmail || 'there';
  const subject = originalEmailSubject || 'No subject';
  const emailBody = originalEmailBody || '';

  const prompt = `Rewrite the spoken reply transcript into a polished, professional email reply. Preserve the meaning of the user's voice message, fix grammar and punctuation, improve sentence flow, and keep the original email context in mind. Do not invent facts. Return only the final email text with greeting, body, and closing.`;

  const userMessage = `Original email subject: ${subject}\nOriginal email body: ${emailBody}\nSender: ${recipient}\nSpoken reply transcript: ${voiceTranscript}\n\nFinal reply:`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a professional email assistant.' },
        { role: 'user', content: prompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 450
    });

    const polishedReply = completion.choices?.[0]?.message?.content?.trim();
    console.log('[AI] OpenAI polished reply length:', polishedReply?.length);

    if (!polishedReply) {
      return res.status(500).json({ error: 'OpenAI returned an empty reply' });
    }

    console.log('[AI] returning polishedReply');
    return res.json({ polishedReply });
  } catch (error) {
    console.error('[AI] OpenAI request failed:', error);
    return res.status(500).json({ error: 'OpenAI request failed' });
  }
});

app.listen(port, () => {
  console.log('Backend server running on http://localhost:3000');
});
