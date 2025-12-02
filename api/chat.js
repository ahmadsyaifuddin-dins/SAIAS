import 'dotenv/config'; 
import Groq from 'groq-sdk';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { message, history, apiKey } = req.body;
  const activeKey = apiKey || process.env.GROQ_API_KEY;

  if (!activeKey) {
    return res.status(500).json({ error: 'Server configuration error: No API Key found.' });
  }

  try {
    const groq = new Groq({ apiKey: activeKey });
    
    const systemPrompt = {
      role: 'system',
      content: "Kamu adalah SAIAS (Ahmad Syaifuddin's AI LLM Assistant), asisten cerdas buatan Ahmad Syaifuddin. Jawablah dengan bahasa Indonesia yang santai, jelas, dan akurat. Kamu ahli coding dan teknologi."
    };

    const cleanHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Gabungkan data yang sudah bersih
    const conversation = [systemPrompt, ...cleanHistory, { role: 'user', content: message }];

    const completion = await groq.chat.completions.create({
      messages: conversation,
      model: 'llama-3.3-70b-versatile', 
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || 'Maaf, saya tidak bisa memproses permintaan itu.';
    
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Groq Error:", error);
    return res.status(500).json({ error: error.message });
  }
}