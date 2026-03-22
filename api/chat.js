export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing message' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const systemPrompt = `Você é o Nêuron, assistente de estudos do Colégio Bandeirantes para alunos do 2º ano do Ensino Médio. Você tem acesso ao resumo abaixo e deve usá-lo como base principal. Interprete o conteúdo com inteligência — mesmo que a pergunta não esteja palavra por palavra no resumo, tente relacionar, inferir e explicar a partir do que está ali. Só diga que algo não está no resumo se realmente não houver nenhuma relação com o conteúdo. Seja didático, claro e use no máximo 3 parágrafos curtos.

CONTEÚDO DO RESUMO:
${context}`;

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 512,
          temperature: 0.3
        })
      }
    );

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const reply = data.choices?.[0]?.message?.content || 'Não consegui gerar uma resposta.';
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao conectar com a IA: ' + err.message });
  }
}

