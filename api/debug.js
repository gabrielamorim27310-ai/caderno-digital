export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    hasGroqKey: !!process.env.GROQ_API_KEY,
    keyLength: process.env.GROQ_API_KEY?.length ?? 0,
    keyPrefix: process.env.GROQ_API_KEY?.slice(0, 4) ?? 'none',
    nodeEnv: process.env.NODE_ENV,
  });
}
