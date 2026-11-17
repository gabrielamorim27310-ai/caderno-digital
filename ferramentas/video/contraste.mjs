// contraste.mjs — acha texto ilegível (pouco contraste com o fundo real) no tema
// escuro e no claro. Pega o caso clássico: fundo claro fixo no CSS da página com
// texto que segue o tema escuro (branco no quase-branco).
// Uso: node contraste.mjs <url> [<url> ...]
import { chromium } from 'playwright';

const urls = process.argv.slice(2);
if (!urls.length) { console.error('Uso: node contraste.mjs <url> [...]'); process.exit(1); }
const b = await chromium.launch();
let total = 0;
for (const url of urls) for (const tema of ['dark', 'light']) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: tema });
  await p.goto(url); await p.waitForTimeout(1000);
  const ruins = await p.evaluate(() => {
    const rgb = s => { const m = s.match(/[\d.]+/g); return m ? m.map(Number) : [0, 0, 0, 1]; };
    const lum = ([r, g, bb]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bb); };
    // fundo efetivo: sobe até achar um fundo opaco (gradiente conta como a 1ª cor dele)
    const fundo = el => {
      for (let e = el; e; e = e.parentElement) {
        const cs = getComputedStyle(e);
        const g = cs.backgroundImage.match(/rgba?\([^)]+\)/);
        if (g) return rgb(g[0]);
        const c = rgb(cs.backgroundColor);
        if ((c[3] ?? 1) > 0.5) return c;
      }
      return rgb(getComputedStyle(document.body).backgroundColor);
    };
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
      const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ');
      if (txt.length < 3) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || +cs.opacity < 0.3) continue;
      const fg = rgb(cs.color), bg = fundo(el);
      const [l1, l2] = [lum(fg), lum(bg)].sort((x, y) => y - x);
      const r = (l1 + 0.05) / (l2 + 0.05);
      if (r < 3) out.push(`${r.toFixed(1)}:1  <${el.tagName.toLowerCase()} class="${el.className}">  "${txt.slice(0, 60)}"`);
    }
    return [...new Set(out)];
  });
  total += ruins.length;
  console.log(`\n${url} [${tema}] ${ruins.length ? ruins.length + ' trecho(s) com pouco contraste:' : 'ok'}`);
  ruins.slice(0, 25).forEach(r => console.log('  ' + r));
  await p.close();
}
await b.close();
process.exitCode = total ? 1 : 0;
