// fotos.mjs — fotografa uma página no computador (claro) e no celular (escuro),
// rolando até cada seletor, e avisa erro de JavaScript e rolagem lateral.
// Uso: node fotos.mjs <url> <prefixo-saida> [seletor ...]
//   ex.: node fotos.mjs http://localhost:3001/ingles-3tri.html C:/tmp/pg "#idioms" "#gallery"
//   Uma página local (file:///.../index.html) também serve.
import { chromium } from 'playwright';

const [url, out, ...sels] = process.argv.slice(2);
if (!url || !out) { console.error('Uso: node fotos.mjs <url> <prefixo-saida> [seletor ...]'); process.exit(1); }
const b = await chromium.launch();
const erros = [];
for (const [w, h, tema, nome] of [[1280, 900, 'light', 'pc'], [390, 844, 'dark', 'celular']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, colorScheme: tema });
  p.on('pageerror', e => erros.push(`${nome}: ${e.message}`));
  p.on('console', m => m.type() === 'error' && erros.push(`${nome}: ${m.text()}`));
  await p.goto(url); await p.waitForTimeout(1200);
  for (const s of sels.length ? sels : ['body']) {
    await p.locator(s).first().scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
    const arq = `${out}-${nome}-${s.replace(/\W/g, '') || 'topo'}.png`;
    await p.screenshot({ path: arq }); console.log(arq);
  }
  const sobra = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (sobra > 0) erros.push(`${nome}: a página rola ${sobra}px para o lado`);
}
console.log(erros.length ? 'PROBLEMAS:\n' + erros.join('\n') : 'Sem erros de JavaScript nem rolagem lateral.');
await b.close();
