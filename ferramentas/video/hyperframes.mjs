// Monta um projeto HyperFrames (HTML animado com GSAP, renderizado em vídeo)
// a partir de um roteiro e das falas gravadas pelo narrar.py.
//
//   node hyperframes.mjs roteiros/<pagina>.json
//   cd ../../videos-gerados/<pagina>-hf && npx hyperframes render --quality delivery -o <pagina>.mp4
//
// Cada cena dura o tempo da sua fala (mais uma folga). Os itens de cada tela
// aparecem no momento em que a narração chega na palavra em destaque deles.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const AQUI = path.dirname(new URL(import.meta.url).pathname);
const RAIZ = path.resolve(AQUI, '../..');
const arq = process.argv[2];
if (!arq) { console.error('Uso: node hyperframes.mjs roteiros/<pagina>.json'); process.exit(1); }
const rot = JSON.parse(fs.readFileSync(path.resolve(AQUI, arq), 'utf8'));
const PAG = rot.pagina;
const AUD = path.join(AQUI, 'audio', PAG);
const OUT = path.join(RAIZ, 'videos-gerados', PAG + '-hf');
fs.mkdirSync(path.join(OUT, 'assets/aud'), { recursive: true });

// Paleta por matéria: fundo escuro e uma cor de destaque
const CORES = {
  portugues: { a: '#FF4D8D', b: '#8B5CF6', bg: '#0D0A14' },
  literatura: { a: '#FFB020', b: '#E5484D', bg: '#120C0A' },
};
const COR = CORES[rot.paleta || rot.materia] || CORES.portugues;

const dur = f => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r2 = n => Math.round(n * 100) / 100;
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// **texto** vira destaque com marca-texto animado
let hlN = 0;
function rich(t, cls = '') {
  const ids = [];
  const h = esc(t).replace(/\*\*(.+?)\*\*/g, (_, x) => {
    const id = 'hl' + (++hlN); ids.push(id);
    return `<span class="hl ${cls}"><span class="hl-bg" id="${id}"></span><span class="hl-t">${x}</span></span>`;
  });
  return { h, ids };
}
// Momento em que a fala chega no destaque do item (proporcional ao texto)
function momentos(itens, fala, A, ini = 0.6) {
  const f = norm(fala), out = [];
  let ult = ini - 0.7, cursor = 0;
  itens.forEach((it, i) => {
    const chave = norm((it.match(/\*\*(.+?)\*\*/) || [0, it])[1]).replace(/["“”]/g, '').split(/[\s,:;.]+/).filter(w => w.length > 3).slice(0, 2);
    let pos = -1;
    for (const w of chave) { const p = f.indexOf(w, cursor); if (p >= 0) { pos = p; break; } }
    let t = pos >= 0 ? (pos / f.length) * A : ini + i * (A * 0.75) / itens.length;
    if (pos >= 0) cursor = pos + 1;
    t = Math.max(t - 0.25, ult + 0.7, ini);
    t = Math.min(t, A - 0.5);
    out.push(r2(t)); ult = t;
  });
  return out;
}

// ═══ Cenas ═══
const PAD = 0.7, PAUSA = 3.2;
let t0 = 0, n = 0;
const cenasHtml = [], tw = [], audios = [], capitulos = [];
let capAtual = '';
for (const c of rot.cenas) {
  n++;
  const nn = String(n).padStart(2, '0');
  const a1 = path.join(AUD, nn + '.wav');
  if (!fs.existsSync(a1)) { console.error('Falta a fala ' + a1 + ' (rode o narrar.py)'); process.exit(1); }
  fs.copyFileSync(a1, path.join(OUT, 'assets/aud', nn + '.wav'));
  const A = dur(a1);
  let A2 = 0;
  if (c.tipo === 'pergunta') {
    const a2 = path.join(AUD, nn + 'b.wav');
    fs.copyFileSync(a2, path.join(OUT, 'assets/aud', nn + 'b.wav'));
    A2 = dur(a2);
  }
  const D = r2(c.tipo === 'pergunta' ? 0.4 + A + PAUSA + A2 + PAD : 0.4 + A + PAD + (c.tipo === 'capa' ? 0.6 : 0));
  const id = 's' + nn, T = t0;
  audios.push(`<audio id="a${nn}" class="clip" src="assets/aud/${nn}.wav" data-start="${r2(T + 0.4)}" data-duration="${r2(A)}" data-track-index="20" data-volume="1"></audio>`);
  if (A2) audios.push(`<audio id="a${nn}b" class="clip" src="assets/aud/${nn}b.wav" data-start="${r2(T + 0.4 + A + PAUSA)}" data-duration="${r2(A2)}" data-track-index="21" data-volume="1"></audio>`);
  if (c.tipo === 'capitulo') { capAtual = c.titulo; capitulos.push({ t: T, n: c.capitulo, titulo: c.titulo }); }
  const at = x => r2(T + x);   // tempo absoluto
  const enter = (sel, x, de = { opacity: 0, y: 40 }, d = 0.55) => tw.push(`tl.fromTo(${JSON.stringify(sel)}, ${JSON.stringify(de)}, {opacity:1, x:0, y:0, scale:1, rotation:0, duration:${d}, ease:"power3.out"}, ${at(x)});`);
  const marca = (ids, x) => ids.forEach((h, k) => tw.push(`tl.fromTo("#${h}", {scaleX:0}, {scaleX:1, duration:0.45, ease:"power2.inOut"}, ${at(x + 0.25 + k * 0.12)});`));
  const rotulo = c.capitulo && c.tipo !== 'capitulo' ? `<div class="eyebrow" id="${id}-eb">${esc(c.capitulo)}</div>` : '';
  let h = '';

  if (c.tipo === 'capa') {
    const palavras = c.titulo.split(' ');
    h = `<div class="capa">
      <div class="pill" id="${id}-selo">${esc(c.selo)}</div>
      <h1 class="mega">${palavras.map((w, i) => `<span class="w"><span class="wi" id="${id}-w${i}">${esc(w)}</span></span>`).join(' ')}</h1>
      <p class="sub" id="${id}-sub">${esc(c.subtitulo)}</p>
      <div class="chips">${(rot.capitulos || []).map((k, i) => `<span class="chip" id="${id}-c${i}"><b>${i + 1}</b>${esc(k)}</span>`).join('')}</div>
    </div>`;
    enter(`#${id}-selo`, 0.2, { opacity: 0, y: -20 });
    palavras.forEach((_, i) => tw.push(`tl.fromTo("#${id}-w${i}", {yPercent:110}, {yPercent:0, duration:0.8, ease:"expo.out"}, ${at(0.35 + i * 0.12)});`));
    enter(`#${id}-sub`, 1.0);
    const ts = momentos((rot.capitulos || []).map(k => `**${k}**`), c.fala, A, 1.6);
    (rot.capitulos || []).forEach((_, i) => enter(`#${id}-c${i}`, ts[i] + 0.4, { opacity: 0, y: 24, scale: 0.9 }, 0.45));
  }
  if (c.tipo === 'capitulo') {
    h = `<div class="cap">
      <div class="cap-n" id="${id}-n">${esc(String(c.capitulo).padStart(2, '0'))}</div>
      <div class="cap-txt">
        <div class="eyebrow" id="${id}-k">Tema ${esc(c.capitulo)} de ${(rot.capitulos || []).length || ''}</div>
        <h2 class="cap-t">${c.titulo.split(' ').map((w, i) => `<span class="w"><span class="wi" id="${id}-w${i}">${esc(w)}</span></span>`).join(' ')}</h2>
        <p class="sub" id="${id}-sub">${esc(c.subtitulo || '')}</p>
      </div>
      <div class="wipe" id="${id}-wipe"></div>
    </div>`;
    tw.push(`tl.fromTo("#${id}-wipe", {xPercent:-101}, {xPercent:101, duration:0.9, ease:"power4.inOut"}, ${at(0)});`);
    tw.push(`tl.fromTo("#${id}-n", {opacity:0, scale:1.5, xPercent:-8}, {opacity:1, scale:1, xPercent:0, duration:1.0, ease:"expo.out"}, ${at(0.35)});`);
    enter(`#${id}-k`, 0.55, { opacity: 0, x: -30 });
    c.titulo.split(' ').forEach((_, i) => tw.push(`tl.fromTo("#${id}-w${i}", {yPercent:110}, {yPercent:0, duration:0.75, ease:"expo.out"}, ${at(0.6 + i * 0.1)});`));
    enter(`#${id}-sub`, 1.1);
  }
  if (c.tipo === 'topicos') {
    const ts = momentos(c.itens, c.fala, A);
    h = `<div class="pad">${rotulo}<h2 class="tt" id="${id}-t">${esc(c.titulo)}</h2>
      <ol class="itens">${c.itens.map((it, i) => { const r = rich(it); r.ids.length && marca(r.ids, ts[i]); return `<li id="${id}-i${i}"><span class="num">${String(i + 1).padStart(2, '0')}</span><span class="it">${r.h}</span></li>`; }).join('')}</ol></div>`;
    enter(`#${id}-eb`, 0.1, { opacity: 0, x: -20 });
    enter(`#${id}-t`, 0.2);
    c.itens.forEach((_, i) => enter(`#${id}-i${i}`, ts[i], { opacity: 0, x: -60 }));
  }
  if (c.tipo === 'destaque') {
    const r = rich(c.texto, 'big');
    h = `<div class="pad center">${rotulo}<h2 class="tt small" id="${id}-t">${esc(c.titulo)}</h2>
      <blockquote class="quote" id="${id}-q"><span class="aspas">“</span>${r.h}</blockquote></div>`;
    enter(`#${id}-eb`, 0.1, { opacity: 0, x: -20 });
    enter(`#${id}-t`, 0.2);
    tw.push(`tl.fromTo("#${id}-q", {opacity:0, y:50, scale:0.96}, {opacity:1, y:0, scale:1, duration:0.9, ease:"expo.out"}, ${at(0.5)});`);
    marca(r.ids, Math.min(1.6, A * 0.3));
  }
  if (c.tipo === 'comparacao') {
    const [L, Rr] = c.colunas;
    const todos = [...L.itens, ...Rr.itens];
    const ts = momentos(todos, c.fala, A, 1.0);
    const col = (cc, lado, off) => `<div class="col ${lado}" id="${id}-${lado}"><h3>${esc(cc.titulo)}</h3><ul>${cc.itens.map((it, i) => { const r = rich(it); r.ids.length && marca(r.ids, ts[off + i]); return `<li id="${id}-${lado}${i}">${r.h}</li>`; }).join('')}</ul></div>`;
    h = `<div class="pad">${rotulo}<h2 class="tt" id="${id}-t">${esc(c.titulo)}</h2>
      <div class="cmp">${col(L, 'L', 0)}<div class="vs" id="${id}-vs">x</div>${col(Rr, 'R', L.itens.length)}</div></div>`;
    enter(`#${id}-eb`, 0.1, { opacity: 0, x: -20 });
    enter(`#${id}-t`, 0.2);
    enter(`#${id}-L`, 0.45, { opacity: 0, x: -80 }, 0.7);
    enter(`#${id}-R`, Math.max(0.65, ts[L.itens.length] - 0.3), { opacity: 0, x: 80 }, 0.7);
    tw.push(`tl.fromTo("#${id}-vs", {opacity:0, scale:0, rotation:-90}, {opacity:1, scale:1, rotation:0, duration:0.6, ease:"back.out(2.2)"}, ${at(0.8)});`);
    L.itens.forEach((_, i) => enter(`#${id}-L${i}`, ts[i], { opacity: 0, y: 20 }, 0.45));
    Rr.itens.forEach((_, i) => enter(`#${id}-R${i}`, ts[L.itens.length + i], { opacity: 0, y: 20 }, 0.45));
  }
  if (c.tipo === 'frase') {
    const r = rich(c.frase, 'alvo');
    h = `<div class="pad center">${rotulo}<h2 class="tt small" id="${id}-t">${esc(c.titulo)}</h2>
      <p class="frase" id="${id}-f">${r.h}</p>
      <div class="rotulo" id="${id}-r"><span class="seta">↑</span>${esc(c.rotulo)}</div></div>`;
    enter(`#${id}-eb`, 0.1, { opacity: 0, x: -20 });
    enter(`#${id}-t`, 0.2);
    enter(`#${id}-f`, 0.4, { opacity: 0, y: 40 }, 0.8);
    const tr = momentos(['**' + (c.frase.match(/\*\*(.+?)\*\*/) || [0, ''])[1] + '**'], c.fala, A, 1.2)[0];
    marca(r.ids, Math.max(1.2, tr + 1.2));
    enter(`#${id}-r`, Math.max(1.8, tr + 1.8), { opacity: 0, y: 30 });
  }
  if (c.tipo === 'reescrita') {
    const ra = rich(c.antes, 'risca'), rd = rich(c.depois, 'novo');
    h = `<div class="pad">${rotulo}<h2 class="tt" id="${id}-t">${esc(c.titulo)}</h2>
      <div class="rw"><div class="rw-k" id="${id}-ka">Pessoal</div><p class="rw-a" id="${id}-a">${ra.h}</p>
      <div class="rw-seta" id="${id}-s">↓</div>
      <div class="rw-k ok" id="${id}-kd">Impessoal</div><p class="rw-d" id="${id}-d">${rd.h}</p></div></div>`;
    const ts = momentos([c.antes, c.depois], c.fala, A, 0.8);
    enter(`#${id}-eb`, 0.1, { opacity: 0, x: -20 });
    enter(`#${id}-t`, 0.2);
    enter(`#${id}-ka`, ts[0] - 0.2, { opacity: 0, x: -20 });
    enter(`#${id}-a`, ts[0], { opacity: 0, y: 30 });
    marca(ra.ids, ts[0] + 1.6);
    enter(`#${id}-s`, ts[1] - 0.6, { opacity: 0, y: -20 });
    enter(`#${id}-kd`, ts[1] - 0.2, { opacity: 0, x: -20 });
    enter(`#${id}-d`, ts[1], { opacity: 0, y: 30 });
    marca(rd.ids, ts[1] + 0.6);
  }
  if (c.tipo === 'pergunta') {
    const L = 'abcdefgh';
    const tq = 0.4 + A, tr = tq + PAUSA;
    h = `<div class="pad">${`<div class="eyebrow q" id="${id}-eb">Pergunta</div>`}
      <h2 class="perg" id="${id}-p">${esc(c.pergunta)}</h2>
      <div class="alts">${c.alternativas.map((x, i) => `<div class="alt" id="${id}-x${i}"><b>${L[i]}</b><span>${esc(x)}</span></div>`).join('')}</div>
      <div class="timer" id="${id}-tm"><svg viewBox="0 0 120 120"><circle class="tr-bg" cx="60" cy="60" r="52"/><circle class="tr-fg" id="${id}-tf" cx="60" cy="60" r="52"/></svg><span id="${id}-tn">pense</span></div>
      <div class="expl" id="${id}-e"><b>Resposta ${c.certa.toUpperCase()}.</b> ${esc(c.explicacao)}</div></div>`;
    enter(`#${id}-eb`, 0.1, { opacity: 0, scale: 0.8 });
    enter(`#${id}-p`, 0.25, { opacity: 0, y: 40 }, 0.7);
    c.alternativas.forEach((_, i) => enter(`#${id}-x${i}`, 0.9 + i * Math.min(0.9, (A - 1) / c.alternativas.length), { opacity: 0, x: -50 }, 0.45));
    tw.push(`tl.fromTo("#${id}-tm", {opacity:0, scale:0.6}, {opacity:1, scale:1, duration:0.4, ease:"back.out(2)"}, ${at(tq - 0.1)});`);
    tw.push(`tl.fromTo("#${id}-tf", {strokeDashoffset:0}, {strokeDashoffset:327, duration:${PAUSA - 0.2}, ease:"none"}, ${at(tq)});`);
    tw.push(`tl.to("#${id}-tm", {opacity:0, scale:0.6, duration:0.3}, ${at(tr - 0.1)});`);
    const ci = L.indexOf(c.certa);
    c.alternativas.forEach((_, i) => {
      if (i === ci) tw.push(`tl.to("#${id}-x${i}", {backgroundColor:"rgba(52,211,153,.18)", borderColor:"#34D399", scale:1.03, duration:0.4, ease:"power2.out"}, ${at(tr)});`);
      else tw.push(`tl.to("#${id}-x${i}", {opacity:0.28, duration:0.4}, ${at(tr)});`);
    });
    enter(`#${id}-e`, tr + 0.5, { opacity: 0, y: 30 });
  }
  if (c.tipo === 'fim') {
    h = `<div class="capa fim"><h1 class="mega">${c.titulo.split(' ').map((w, i) => `<span class="w"><span class="wi" id="${id}-w${i}">${esc(w)}</span></span>`).join(' ')}</h1>
      <p class="sub" id="${id}-sub">${esc(c.texto)}</p><div class="marca" id="${id}-m">Caderno Digital</div></div>`;
    c.titulo.split(' ').forEach((_, i) => tw.push(`tl.fromTo("#${id}-w${i}", {yPercent:110}, {yPercent:0, duration:0.8, ease:"expo.out"}, ${at(0.3 + i * 0.12)});`));
    enter(`#${id}-sub`, 0.9);
    enter(`#${id}-m`, 1.4, { opacity: 0, y: 20 });
  }
  // saída da cena
  tw.push(`tl.to("#${id}-in", {opacity:0, y:-24, duration:0.35, ease:"power2.in"}, ${at(D - 0.4)});`);
  cenasHtml.push(`<section id="${id}" class="clip cena" data-start="${r2(T)}" data-duration="${D}" data-track-index="2"><div class="in" id="${id}-in">${h}</div></section>`);
  t0 = r2(T + D);
}
const TOTAL = r2(t0);

// Barra de progresso com marcas dos capítulos
const ticks = capitulos.map(k => `<span class="tick" style="left:${(k.t / TOTAL * 100).toFixed(2)}%"></span>`).join('');
const hud = `<div id="hud" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="9">
  <div class="brand"><span class="dot"></span>${esc(rot.titulo)}</div>
  <div class="prog"><div class="prog-fg" id="prog"></div>${ticks}</div>
</div>`;
tw.push(`tl.fromTo("#prog", {scaleX:0}, {scaleX:1, duration:${TOTAL}, ease:"none"}, 0);`);
// Fundo vivo: duas manchas de cor que flutuam devagar
tw.push(`tl.fromTo("#blobA", {x:-120, y:-60}, {x:220, y:120, duration:${TOTAL}, ease:"sine.inOut"}, 0);`);
tw.push(`tl.fromTo("#blobB", {x:160, y:80}, {x:-200, y:-100, duration:${TOTAL}, ease:"sine.inOut"}, 0);`);

const css = `
:root{--bg:${COR.bg};--a:${COR.a};--b:${COR.b};--ink:#F6F3FA;--ink2:rgba(246,243,250,.66);--line:rgba(246,243,250,.14);--ok:#34D399}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:var(--bg)}
#root{width:100%;height:100%;position:relative;font-family:Inter,sans-serif;color:var(--ink);overflow:hidden}
#fundo{position:absolute;inset:0;background:var(--bg)}
.blob{position:absolute;width:1300px;height:1300px;border-radius:50%;opacity:.55}
#blobA{left:-420px;top:-520px;background:radial-gradient(circle at center, color-mix(in srgb,var(--a) 55%,transparent) 0%, transparent 62%)}
#blobB{right:-480px;bottom:-640px;background:radial-gradient(circle at center, color-mix(in srgb,var(--b) 60%,transparent) 0%, transparent 62%)}
#grade{position:absolute;inset:0;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:120px 120px;opacity:.35}
.cena{position:absolute;inset:0}
.in{position:absolute;inset:0}
.pad{position:absolute;left:150px;right:150px;top:150px;bottom:150px}
.pad.center{display:flex;flex-direction:column;justify-content:center}
.eyebrow{font-family:'JetBrains Mono',monospace;font-size:26px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--a);margin-bottom:18px}
.eyebrow.q{display:inline-block;background:var(--a);color:#0D0A14;padding:8px 18px;border-radius:8px}
.tt{font-family:'Archivo Black',sans-serif;font-size:84px;line-height:1.02;letter-spacing:-.02em;margin-bottom:56px}
.tt.small{font-size:56px;color:var(--ink2);margin-bottom:36px}
.w{display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.08em}
.wi{display:inline-block}
.hl{position:relative;display:inline-block;padding:0 .12em;margin:0 -.04em}
.hl-bg{position:absolute;left:0;right:0;top:12%;bottom:6%;background:var(--a);transform-origin:left center;border-radius:6px;z-index:0}
.hl-t{position:relative;z-index:1;color:#0D0A14;font-weight:800}
.hl.risca .hl-bg{background:#F87171;top:46%;bottom:44%}
.hl.risca .hl-t{color:var(--ink)}
.hl.novo .hl-bg{background:var(--ok)}
.capa{position:absolute;left:150px;right:150px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center}
.pill{align-self:flex-start;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:26px;letter-spacing:.12em;text-transform:uppercase;border:2px solid var(--a);color:var(--a);padding:12px 22px;border-radius:999px;margin-bottom:40px}
.mega{font-family:'Archivo Black',sans-serif;font-size:150px;line-height:.98;letter-spacing:-.035em}
.sub{font-size:40px;color:var(--ink2);margin-top:28px;max-width:1400px}
.chips{display:flex;flex-wrap:wrap;gap:14px;margin-top:60px;max-width:1600px}
.chip{display:inline-flex;align-items:center;gap:12px;font-size:28px;font-weight:700;background:rgba(246,243,250,.08);border:1px solid var(--line);padding:12px 20px 12px 12px;border-radius:14px}
.chip b{display:inline-grid;place-items:center;width:40px;height:40px;border-radius:10px;background:var(--a);color:#0D0A14;font-size:22px}
.cap{position:absolute;inset:0;display:flex;align-items:center;padding:0 150px;gap:80px}
.cap-n{font-family:'Archivo Black',sans-serif;font-size:420px;line-height:.8;color:transparent;-webkit-text-stroke:4px var(--a)}
.cap-t{font-family:'Archivo Black',sans-serif;font-size:112px;line-height:1;letter-spacing:-.03em}
.wipe{position:absolute;inset:0;background:var(--a)}
.itens{list-style:none;display:flex;flex-direction:column;gap:30px}
.itens li{display:flex;align-items:baseline;gap:30px;font-size:50px;line-height:1.2;font-weight:500}
.num{font-family:'JetBrains Mono',monospace;font-size:30px;font-weight:700;color:var(--a);min-width:56px}
.quote{font-family:'Archivo Black',sans-serif;font-size:72px;line-height:1.18;letter-spacing:-.01em;position:relative;max-width:1550px}
.aspas{position:absolute;left:-90px;top:-50px;font-size:200px;color:var(--a);opacity:.9}
.cmp{display:grid;grid-template-columns:1fr 120px 1fr;align-items:start}
.col{background:rgba(246,243,250,.06);border:1px solid var(--line);border-radius:28px;padding:44px 48px;min-height:420px}
.col.R{border-color:color-mix(in srgb,var(--a) 50%,transparent)}
.col h3{font-family:'Archivo Black',sans-serif;font-size:50px;margin-bottom:30px;color:var(--a)}
.col.L h3{color:var(--ink)}
.col ul{list-style:none;display:flex;flex-direction:column;gap:22px}
.col li{font-size:40px;line-height:1.25}
.vs{align-self:center;justify-self:center;width:96px;height:96px;border-radius:50%;background:var(--a);color:#0D0A14;display:grid;place-items:center;font-family:'Archivo Black',sans-serif;font-size:44px}
.frase{font-family:'Archivo Black',sans-serif;font-size:96px;line-height:1.15}
.rotulo{margin-top:46px;font-size:42px;font-weight:700;color:var(--a);display:flex;align-items:center;gap:20px}
.seta{font-size:60px}
.rw{display:flex;flex-direction:column;gap:14px}
.rw-k{font-family:'JetBrains Mono',monospace;font-size:26px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#F87171}
.rw-k.ok{color:var(--ok)}
.rw-a,.rw-d{font-size:58px;line-height:1.25;font-weight:600}
.rw-a{color:var(--ink2)}
.rw-seta{font-size:70px;color:var(--ink2);margin:6px 0}
.perg{font-family:'Archivo Black',sans-serif;font-size:60px;line-height:1.15;margin:26px 0 44px;max-width:1500px}
.alts{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:1620px}
.alt{display:flex;align-items:center;gap:22px;font-size:38px;line-height:1.2;border:2px solid var(--line);border-radius:20px;padding:22px 26px;background:rgba(246,243,250,.05)}
.alt b{display:grid;place-items:center;flex:none;width:58px;height:58px;border-radius:14px;background:rgba(246,243,250,.12);font-family:'JetBrains Mono',monospace;text-transform:uppercase;font-size:30px}
.timer{position:absolute;right:0;top:0;width:150px;height:150px;display:grid;place-items:center}
.timer svg{position:absolute;inset:0;width:150px;height:150px;transform:rotate(-90deg)}
.tr-bg{fill:none;stroke:var(--line);stroke-width:10}
.tr-fg{fill:none;stroke:var(--a);stroke-width:10;stroke-linecap:round;stroke-dasharray:327}
.timer span{font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:700;color:var(--a);text-transform:uppercase}
.expl{margin-top:34px;font-size:38px;line-height:1.3;color:var(--ink);max-width:1620px;border-left:6px solid var(--ok);padding-left:26px}
.expl b{color:var(--ok)}
.fim .mega{font-size:180px}
.marca{margin-top:60px;font-family:'JetBrains Mono',monospace;font-size:30px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--a)}
#hud{position:absolute;inset:0;pointer-events:none}
.brand{position:absolute;left:150px;top:64px;display:flex;align-items:center;gap:14px;font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink2)}
.brand .dot{width:14px;height:14px;border-radius:50%;background:var(--a)}
.prog{position:absolute;left:150px;right:150px;bottom:70px;height:6px;border-radius:6px;background:var(--line)}
.prog-fg{position:absolute;inset:0;background:var(--a);border-radius:6px;transform-origin:left center}
.tick{position:absolute;top:-7px;width:4px;height:20px;border-radius:2px;background:var(--ink2);margin-left:-2px}
`;

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>${css}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1920" data-height="1080">
<div id="fundo" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="0" data-layout-ignore><div class="blob" id="blobA"></div><div class="blob" id="blobB"></div><div id="grade"></div></div>
${cenasHtml.join('\n')}
${hud}
${audios.join('\n')}
</div>
<script>
const tl = gsap.timeline({ paused: true });
${tw.join('\n')}
window.__timelines["main"] = tl;
tl.seek(0);
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.writeFileSync(path.join(OUT, 'hyperframes.json'), JSON.stringify({ name: PAG }, null, 2));
const mm = Math.floor(TOTAL / 60), ss = Math.round(TOTAL % 60);
console.log(`${rot.cenas.length} cenas · ${mm}min${String(ss).padStart(2, '0')}s · ${path.relative(RAIZ, OUT)}/index.html`);
console.log('Capítulos: ' + capitulos.map(k => `${k.n} ${k.titulo} @${Math.round(k.t)}s`).join(' | '));
