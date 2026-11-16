// ferramentas/cards-em-sanfona.cjs
// Transforma os cartões de tópico (<div class="card"><div class="card-title">…</div>…</div>)
// em sanfonas (.accordion), o mesmo componente das outras páginas de resumo.
// O texto não muda: o título vira o botão e o resto vai para dentro da sanfona.
// uso: node ferramentas/cards-em-sanfona.cjs pagina.html
const fs = require("fs");
const arq = process.argv[2];
let h = fs.readFileSync(arq, "utf8");

// acha o </div> que fecha o <div> que começa em i
function fimDoDiv(s, i) {
  const re = /<div\b|<\/div>/g; re.lastIndex = i; let prof = 0, m;
  while ((m = re.exec(s))) {
    prof += m[0] === "</div>" ? -1 : 1;
    if (prof === 0) return m.index + m[0].length;
  }
  throw new Error("div sem fim em " + i);
}

let n = 0, pos = 0;
for (;;) {
  const i = h.indexOf('<div class="card">', pos);
  if (i < 0) break;
  const fim = fimDoDiv(h, i);
  const bloco = h.slice(i, fim);
  const t = bloco.match(/^<div class="card">(\s*)<div class="card-title">([\s\S]*?)<\/div>/);
  if (!t) { pos = fim; continue; } // cartão sem título: fica como está
  const recuo = (h.slice(h.lastIndexOf("\n", i) + 1, i).match(/^\s*/) || [""])[0];
  const resto = bloco.slice(t[0].length, -"</div>".length).replace(/\s+$/, "");
  const novo =
    `<div class="accordion">${t[1]}` +
    `<button class="accordion-btn" onclick="toggleAccordion(this)"><span class="card-title">${t[2].trim()}</span> <span class="chev">▾</span></button>${t[1]}` +
    `<div class="accordion-content"><div class="content-block">${resto}${t[1]}</div></div>\n${recuo}</div>`;
  h = h.slice(0, i) + novo + h.slice(fim);
  pos = i + novo.length; n++;
}
fs.writeFileSync(arq, h);
console.log(`${arq}: ${n} cartões viraram sanfona`);
