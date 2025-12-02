import 'dotenv/config';
import Groq from 'groq-sdk';

export default async function handler(req, res) {
  // 1. Setup CORS (Supaya frontend bisa akses)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 2. Tentukan Key mana yang dipakai (Punya User atau Server)
  // Kita ambil dari Header 'Authorization' biar standar
  const authHeader = req.headers.authorization;
  let activeKey = process.env.GROQ_API_KEY;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const userKey = authHeader.split(' ')[1];
    // Kalau user kirim key (dan bukan string 'null'), pakai punya user
    if (userKey && userKey !== 'null') {
      activeKey = userKey;
    }
  }

  if (!activeKey) {
    return res.status(500).json({ error: 'No API Key found.' });
  }

  try {
    const groq = new Groq({ apiKey: activeKey });
    
    // 3. Minta daftar model ke Groq
    const list = await groq.models.list();
    
    // 4. Filter hanya model yang cocok untuk Chat (bukan Whisper/Audio)
    // Biasanya ID model chat tidak mengandung 'whisper'
    const chatModels = list.data.filter(m => !m.id.includes('whisper'));

    return res.status(200).json({ data: chatModels });

  } catch (error) {
    console.error("Failed to fetch models:", error);
    return res.status(500).json({ error: error.message });
  }
}