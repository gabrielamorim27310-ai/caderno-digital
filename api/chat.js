export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing message' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const systemPrompt = `Você é um assistente de estudos do Colégio Bandeirantes para alunos do 2º ano do Ensino Médio. Responda APENAS com base no conteúdo do resumo abaixo. Seja direto, didático e use no máximo 3 parágrafos curtos. Se a pergunta não for sobre o conteúdo do resumo, diga educadamente que só pode ajudar com o conteúdo da página atual.

CONTEÚDO DO RESUMO:
${context}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt + '\n\nPergunta do aluno: ' + message }] }
          ],
          generationConfig: { maxOutputTokens: 512, temperature: 0.3 }
        })
      }
    );

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Não consegui gerar uma resposta.';
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao conectar com a IA: ' + err.message });
  }
}
