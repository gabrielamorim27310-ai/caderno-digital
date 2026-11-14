// ferramentas/limpar-estilos.cjs
// Tira do <style> de cada resumo as regras que o CSS compartilhado
// (styles/ios.css + styles/resumo.css) já cobre; deixa só o que é da página.
// uso: node ferramentas/limpar-estilos.cjs . relatorio [pagina.html]   (mostra)
//      node ferramentas/limpar-estilos.cjs . aplicar   [pagina.html]   (grava)
const fs = require("fs");
const path = require("path");
const raiz = process.argv[2];
const modo = process.argv[3] || "relatorio";
const so = process.argv.slice(4);

// Seletores cuja PRIMEIRA classe/elemento-alvo é coberto pelo CSS compartilhado.
const GENERICOS = [
  /^\*$/, /^\*,/, /^html\b(?![w-])/, /^body\b(?![w-])/, /^:root\b(?![w-])/, /^main\b(?![w-])/, /^nav\b(?![w-])/, /^footer\b(?![w-])/, /^a\b(?![w-])/, /^h[1-6]\b(?![w-])/, /^p\b(?![w-])/, /^ul\b(?![w-])/, /^ol\b(?![w-])/, /^li\b(?![w-])/, /^strong\b(?![w-])/, /^em\b(?![w-])/,
  /^\.progress-bar\b(?![w-])/, /^\.hero\b(?![w-])/, /^\.nav-inner\b(?![w-])/, /^\.back-link\b(?![w-])/,
  /^\.chapter(-header|-num|-body)?\b(?![w-])/, /^\.section(-header|-num|-title|-sub)?\b(?![w-])/, /^\.ch-tag\b(?![w-])/, /^\.meta\b(?![w-])/, /^\.cap-ref\b(?![w-])/, /^\.pending-badge\b(?![w-])/,
  /^\.accordion(-btn|-content|-body|-inner)?\b(?![w-])/, /^\.content-block\b(?![w-])/, /^\.chev(ron)?\b(?![w-])/,
  /^\.(highlight|highlight-box|warn-box|warning-box|tip-box|tip|info-box|danger-box|example-box|highlight-purple|highlight-gray|highlight-red|highlight-blue)\b(?![w-])/,
  /^\.timeline\b(?![w-])/, /^\.tl-(item|year|text)\b(?![w-])/, /^\.timeline-(item|year|text)\b(?![w-])/,
  /^\.data-table\b(?![w-])/, /^\.styled-table\b(?![w-])/, /^\.table-wrap\b(?![w-])/,
  /^#quiz-section\b(?![w-])/, /^\.quiz-section\b(?![w-])/, /^\.quiz-filters?\b(?![w-])/, /^\.filter-btn\b(?![w-])/, /^\.qf-btn\b(?![w-])/, /^\.question-card\b(?![w-])/, /^\.options\b(?![w-])/, /^\.option-btn\b(?![w-])/, /^\.quiz-result\b(?![w-])/, /^\.donut-(wrap|center|score|label)\b(?![w-])/, /^\.result-(msg|sub)\b(?![w-])/, /^\.btn-reset(-mid)?\b(?![w-])/, /^\.reset-btn\b(?![w-])/, /^\.quiz-topbar\b(?![w-])/, /^\.score-(left|live)\b(?![w-])/, /^\.mini-donut-wrap\b(?![w-])/, /^#mini-pct\b(?![w-])/, /^\.answer-exp\b(?![w-])/, /^\.q-fonte\b(?![w-])/,
  /^\.quiz-q\b(?![w-])/, /^\.quiz-chapter-tag\b(?![w-])/, /^\.quiz-tag\b(?![w-])/, /^\.feedback\b(?![w-])/, /^\.q-feedback\b(?![w-])/,
  /^\.quiz\b(?![w-])/, /^\.quiz-num\b(?![w-])/, /^\.quiz-opts\b(?![w-])/, /^\.opt\b(?![w-])/, /^\.opt-letter\b(?![w-])/, /^\.quiz-feedback\b(?![w-])/,
  /^#chat-(btn|panel|head|close|msgs|form|input|send)\b(?![w-])/, /^\.cmsg\b(?![w-])/,
  /^#contrib-/, /^\.video-box\b(?![w-])/, /^\.video-links\b(?![w-])/, /^\.obra\b(?![w-])/, /^\.obras-par\b(?![w-])/,
];

function ehGenerico(sel) {
  return sel.split(",").map(s => s.trim()).filter(Boolean).every(s => GENERICOS.some(re => re.test(s)));
}

// Divide CSS em blocos de topo: regras simples e @media (com regras dentro).
function blocos(css) {
  const out = []; let i = 0;
  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) i++;
    if (i >= css.length) break;
    if (css.startsWith("/*", i)) { const j = css.indexOf("*/", i) + 2; out.push({ tipo: "comentario", txt: css.slice(i, j) }); i = j; continue; }
    const a = css.indexOf("{", i); if (a < 0) break;
    const cab = css.slice(i, a).trim();
    let prof = 1, j = a + 1;
    while (j < css.length && prof) { if (css[j] === "{") prof++; else if (css[j] === "}") prof--; j++; }
    const corpo = css.slice(a + 1, j - 1);
    if (cab.startsWith("@media") || cab.startsWith("@supports")) out.push({ tipo: "media", cab, filhos: blocos(corpo), txt: css.slice(i, j) });
    else out.push({ tipo: cab.startsWith("@") ? "at" : "regra", cab, txt: css.slice(i, j) });
    i = j;
  }
  return out;
}

function filtrar(lista) {
  const fica = [], sai = [];
  for (const b of lista) {
    if (b.tipo === "comentario") continue;
    if (b.tipo === "regra") (ehGenerico(b.cab) ? sai : fica).push(b.txt);
    else if (b.tipo === "media") {
      const r = filtrar(b.filhos);
      sai.push(...r.sai.map(x => b.cab + " " + x));
      if (r.fica.length) fica.push(b.cab + " {\n" + r.fica.map(x => "  " + x).join("\n") + "\n}");
    } else fica.push(b.txt); // @keyframes etc. ficam
  }
  return { fica, sai };
}

const paginas = fs.readdirSync(raiz).filter(f => f.endsWith(".html") && (!so.length || so.includes(f)));
for (const f of paginas) {
  const html = fs.readFileSync(path.join(raiz, f), "utf8");
  if (!/<body class="ios resumo">/.test(html)) continue;
  const tags = [...html.matchAll(/([ \t]*)<style>([\s\S]*?)<\/style>[ \t]*\r?\n?/g)];
  if (!tags.length) { console.log(`## ${f}: sem <style>`); continue; }
  let fica = [], sai = [];
  const trocas = [];
  for (const m of tags) {
    const r = filtrar(blocos(m[2].replace(/\r\n/g, "\n")));
    fica.push(...r.fica); sai.push(...r.sai);
    trocas.push({ m, r });
  }
  if (modo === "relatorio") {
    console.log(`## ${f}: ${tags.length} blocos, sai ${sai.length}, fica ${fica.length}`);
    for (const x of fica) console.log("   + " + x.replace(/\s+/g, " ").slice(0, 150));
    if (process.env.SAI) for (const x of sai) console.log("   - " + x.replace(/\s+/g, " ").slice(0, 400));
  } else if (modo === "aplicar") {
    // Um <style> só, no <head>, com o que é desta página; os outros blocos somem.
    let out = html;
    tags.forEach((t, i) => { out = out.replace(t[0], i === 0 ? "\u0000ESTILO\u0000" : ""); });
    const novo = fica.length
      ? "<style>\n  /* Só desta página. O visual comum vem de styles/ios.css e styles/resumo.css. */\n" + fica.map(x => "  " + x.replace(/\n/g, "\n  ")).join("\n") + "\n</style>\n"
      : "";
    out = out.replace("\u0000ESTILO\u0000", novo.replace(/\n/g, "\r\n"));
    fs.writeFileSync(path.join(raiz, f), out);
    console.log(`${f}: ${tags.length} blocos → ${fica.length ? 1 : 0}; ${sai.length} regras removidas, ${fica.length} mantidas`);
  }
}
