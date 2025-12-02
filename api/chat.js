import 'dotenv/config'; 
import Groq from 'groq-sdk';

export default async function handler(req, res) {
  // 1. Setup CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message, history, apiKey, model } = req.body;
  const activeKey = apiKey || process.env.GROQ_API_KEY;

  if (!activeKey) {
    return res.status(500).json({ error: 'No API Key found.' });
  }

  try {
    const groq = new Groq({ apiKey: activeKey });
    
    // System Prompt (Persona Gen Z)
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

    const conversation = [systemPrompt, ...cleanHistory, { role: 'user', content: message }];
    
    // 2. Tentukan Model & Cek Tipe Reasoning
    const selectedModel = model || 'llama-3.3-70b-versatile';
    
    // Perbaikan: Deklarasikan variabel ini SEBELUM dipakai
    const isReasoningModel = selectedModel.includes('o1-') 
                          || selectedModel.includes('openai/o1') 
                          || selectedModel.includes('gpt-oss');

    // 3. Buat Payload Dasar
    const payload = {
      messages: conversation,
      model: selectedModel,
      temperature: 0.5, // Default aman untuk coding
      max_tokens: 8192,
      stream: true,
    };

    // 4. Modifikasi Payload JIKA Model Reasoning (o1 / gpt-oss)
    if (isReasoningModel) {
      payload.reasoning_effort = "medium"; 
      // Opsional: Model reasoning kadang butuh temperature 1
      // payload.temperature = 1; 
    }

    // 5. Eksekusi Request ke Groq
    const stream = await groq.chat.completions.create(payload);

    // 6. Siapkan Header untuk Streaming Teks
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked'
    });

    // 7. Alirkan data (Piping)
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(content); 
      }
    }

    // 8. Tutup koneksi saat selesai
    res.end();

  } catch (error) {
    console.error("Groq Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.end(); 
    }
  }
}