// folha.mjs — folha de contato de uma pasta de desenhos SVG/PNG, para conferir de olho.
// Uso: node folha.mjs <pasta> <saida.png> [ms ...]
//   Sem ms: um quadro. Com ms (ex.: 700 1300): um quadro em cada instante,
//   para ver se as animações CSS dos SVGs estão se mexendo.
import { chromium } from 'playwright';
import { readdirSync, readFileSync } from 'node:fs';
import { extname } from 'node:path';

const [dir, out, ...tempos] = process.argv.slice(2);
if (!dir || !out) { console.error('Uso: node folha.mjs <pasta> <saida.png> [ms ...]'); process.exit(1); }
const tipos = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const arqs = readdirSync(dir).filter(f => tipos[extname(f)]);
// data: URI, porque uma página em about:blank não carrega file://
const html = '<body style="margin:0;display:grid;grid-template-columns:repeat(6,200px);gap:8px;padding:8px;background:#fff">' +
  arqs.map(f => `<div style="font:12px Arial;text-align:center"><img width="200" src="data:${tipos[extname(f)]};base64,${readFileSync(dir + '/' + f).toString('base64')}"><br>${f}</div>`).join('') + '</body>';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1270, height: 700 } });
await p.setContent(html);
const ts = tempos.length ? tempos.map(Number) : [300];
let antes = 0;
for (const t of ts) {
  await p.waitForTimeout(Math.max(0, t - antes)); antes = t;
  const nome = ts.length > 1 ? out.replace(/\.png$/, `-${t}.png`) : out;
  await p.screenshot({ path: nome, fullPage: true });
  console.log(nome);
}
await b.close();
