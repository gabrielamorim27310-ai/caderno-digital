/* ═══════════════════════════════════════════════════════════
   manter-ativo.js — Cron diário (vercel.json → crons)
   1. Consulta o banco, para o Supabase grátis não pausar o
      projeto depois de 7 dias sem uso.
   2. Apaga envios que ficaram "enviando" por mais de 1 dia
      (o aluno fechou a página no meio do upload).
   A Vercel manda "Authorization: Bearer $CRON_SECRET".
   ═══════════════════════════════════════════════════════════ */

import * as db from './_supabase.js';

export default async function handler(req, res) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || req.headers.authorization !== `Bearer ${segredo}`) return res.status(401).end();
  if (!db.configurado()) return res.status(500).json({ error: 'Supabase não configurado.' });

  try {
    const pendentes = await db.contar('envios', 'status=eq.pendente');

    const ontem = new Date(Date.now() - 86400e3).toISOString();
    const abandonados = await db.selecionar('envios', `status=eq.enviando&criado_em=lt.${ontem}&select=id,pagina,arquivos`);
    for (const e of abandonados) {
      await db.remover(e.arquivos.map(a => `${e.pagina}/${e.id}/${a.nome}`));
      await db.apagar('envios', `id=eq.${e.id}`);
    }

    res.status(200).json({ ok: true, pendentes, abandonados_removidos: abandonados.length });
  } catch (err) {
    console.error('manter-ativo:', err.message);
    res.status(502).json({ error: err.message });
  }
}
