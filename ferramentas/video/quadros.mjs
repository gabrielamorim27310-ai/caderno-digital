// quadros.mjs — prévia de um projeto HyperFrames sem renderizar o vídeo todo:
// abre o index.html, pula a linha do tempo para alguns instantes e fotografa.
// Uso: node quadros.mjs videos-gerados/<pagina>-hf <saida-prefixo> <cena>[+seg] ...
//   cena = número da cena (1, 2, ...); +seg = segundos depois do início dela (padrão 4)
//   ex.: node quadros.mjs ../../videos-gerados/ingles-3tri-hf C:/tmp/q 1 8+6 22+12 20+16
import { chromium } from 'playwright';
import path from 'node:path';

const [dir, out, ...pedidos] = process.argv.slice(2);
if (!dir || !out || !pedidos.length) { console.error('Uso: node quadros.mjs <pasta-hf> <prefixo> <cena>[+seg] ...'); process.exit(1); }
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('ERRO:', e.message));
await p.addInitScript(() => { window.__timelines = {}; });   // quem cria isso é o HyperFrames
await p.goto('file:///' + path.resolve(dir, 'index.html').replace(/\\/g, '/'));
await p.waitForTimeout(3000);
if (!(await p.evaluate(() => !!(window.__timelines && window.__timelines.main)))) { console.error('A linha do tempo não carregou (sem internet para o GSAP?)'); process.exit(1); }
for (const ped of pedidos) {
  const [cena, mais = '4'] = ped.split('+');
  const id = 's' + String(cena).padStart(2, '0');
  const t = await p.evaluate(([id, mais]) => {
    const el = document.getElementById(id); const t = +el.dataset.start + +mais;
    // mostra só a cena do instante (o HyperFrames faz isso ao renderizar)
    document.querySelectorAll('.cena').forEach(c => { c.style.visibility = (c === el) ? 'visible' : 'hidden'; });
    window.__timelines.main.seek(t);
    document.getAnimations().forEach(a => { a.pause(); a.currentTime = t * 1000; });
    return t;
  }, [id, mais]);
  await p.waitForTimeout(150);
  const arq = `${out}-cena${cena}.png`;
  await p.screenshot({ path: arq, scale: 'css' });
  console.log(`${arq}  (t=${t.toFixed(1)}s)`);
}
await b.close();
