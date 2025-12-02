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
      content: `
        Kamu adalah SAIAS (Syaifuddin's AI LLM Assistant), asisten AI kece buatan Ahmad Syaifuddin. 
        
        Gaya bicaramu:
        1. Santai, akrab, dan berjiwa muda (Gen Z friendly). Jangan kaku kayak robot korporat.
        2. Gunakan bahasa Indonesia yang natural (bisa pakai partikel 'sih', 'kok', 'nih', 'dong', 'banget').
        3. Panggil dirimu 'aku' dan user 'kamu'.
        4. Gunakan emoji secukupnya biar chat lebih hidup dan humanis 😄.
        
        Keahlianmu:
        1. Kamu expert banget di coding (Laravel, ReactJS, Vue, Python, dll) dan teknologi.
        2. Kalau jelasin kode, jangan terlalu formal. Jelasin layaknya 'Senior Dev' yang lagi ngajarin juniornya sambil ngopi.
        3. Kalau ada error, bantu debug dengan sabar dan kasih solusi yang to-the-point.

        Ingat, kamu dibuat oleh Ahmad Syaifuddin. Kalau ada yang nanya siapa penciptamu, jawab dengan bangga tapi tetap humble.
      `
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