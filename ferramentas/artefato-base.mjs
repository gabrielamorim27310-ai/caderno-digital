// artefato-base.mjs — embrulha o corpo de uma página de resumo num HTML autônomo para o Artifact.
// Define as variáveis do ios.css (claro/escuro) e estiliza as classes dos resumos.
// CSS das páginas antigas foi escrito só para o tema claro (fundos #f2faf5, gradientes claros, texto #2c2c2c).
// No artefato não há o ios.css para corrigir isso, então trocamos cada cor fixa por uma variável do tema:
// fundo claro → --bg-3, texto escuro → --label, borda clara → --sep. Assim nada some no modo escuro.
const lum = h => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); return .2126 * r + .7152 * g + .0722 * b; };
const HEX = /#(?:[0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-f])/gi;
const corDe = v => {
  const m = v.match(HEX); if (m) return lum(m[0]);
  if (/(^|[^-\w])white([^-\w]|$)/i.test(v)) return 1;
  const r = v.match(/rgba?\(([^)]+)\)/); if (r) { const [a, b, c] = r[1].split(',').map(Number); return (.2126 * a + .7152 * b + .0722 * c) / 255; }
  return null;
};
const alfa = v => { const r = v.match(/rgba\(([^)]+)\)/); return r ? Number(r[1].split(',')[3]) : 1; };
// Trata cada bloco de declarações inteiro, porque fundo e texto andam juntos:
// - fundo claro (ou branco translúcido) → --bg-3; se o texto do bloco era claro, vira --label
// - fundo translúcido escuro com texto claro (feito para fundo escuro fixo) → texto --label
// - texto escuro → --label / --label-2; bordas claras → --sep
function bloco(d) {
  const get = re => { const m = d.match(re); return m ? m[1].trim() : null; };
  const bg = get(/(?:^|;|\s)background(?:-color)?\s*:\s*([^;!]+)/i), col = get(/(?:^|;|\s)color\s*:\s*([^;!]+)/i);
  const lb = bg && !/url\(/.test(bg) ? corDe(bg) : null, lc = col ? corDe(col) : null;
  const claroBg = lb !== null && lb > .75, transl = bg && /rgba\(/.test(bg) && alfa(bg) < .7;
  let out = d;
  if (claroBg) out = out.replace(/((?:^|;|\s)background(?:-color)?\s*:\s*)([^;!]+)/gi, '$1var(--bg-3)');
  if (lc !== null) {
    const novo = lc < .3 ? 'var(--label)' : lc < .55 ? 'var(--label-2)' : (claroBg || transl) ? 'var(--label)' : null;
    if (novo) out = out.replace(/((?:^|;|\s)color\s*:\s*)([^;!]+)/i, '$1' + novo);
  }
  return out.replace(/(border(?:-[a-z]+)?\s*:[^;]*?)(#(?:[0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-f])|rgba?\([^)]*\)|\bwhite\b)/gi, (t, k, c) => corDe(c) > .75 ? k + 'var(--sep)' : t);
}
export function temaSeguro(css) {
  return /[{}]/.test(css) ? css.replace(/\{([^{}]*)\}/g, (t, d) => '{' + bloco(d) + '}') : bloco(css);
}
const TOKENS_DO_TEMA = ['--bg', '--card-bg', '--text', '--text-light', '--border'];
export function rootDaPagina(css) { // mantém as variáveis próprias (--ch1, --c2...), tira as que o tema define
  return css.replace(/:root\s*\{([^}]*)\}/, (t, d) => ':root{' + d.split(';').filter(x => !TOKENS_DO_TEMA.includes(x.split(':')[0].trim())).join(';') + '}');
}
export function artefato({ titulo, tint: [claro, escuro], corpo, widgets, css = [], extraCss = '' }) {
  extraCss = temaSeguro(extraCss);
  corpo = corpo.replace(/style="([^"]*)"/g, (t, v) => `style="${temaSeguro(v)}"`);
  const limpo = corpo
    .replace(/<body[^>]*>/, '').replace(/<\/body>/, '')
    .replace(/<div class="progress-bar"[^>]*><\/div>/, '')
    .replace(/<a class="back-link"[^>]*>[^<]*<\/a>/, '')
    .replace(/<div class="hero-icon">[\s\S]*?<\/div>/, '')
    .replace(/<section class="section" id="video"[\s\S]*?<\/section>/, '')
    .replace(/<a class="nav-link" href="#video">[^<]*<\/a>/, '');
  return `<title>${titulo}</title>
<style>
:root{--tint:${claro};--tint-fill:${claro};--bg:#f2f2f7;--bg-2:#ffffff;--bg-3:#f6f6f9;--sep:rgba(60,60,67,.18);--label:#1c1c1e;--label-2:rgba(60,60,67,.68);
--green:#1f8a3b;--green-bg:#e6f6ea;--red:#c9342c;--red-bg:#fdecea;--orange:#c46a00;--fill:rgba(120,120,128,.16);--primary:${claro};--c1:${claro};--c2:#8a5a00;--c3:#a0782a;--c4:#1f4e79;
/* apelidos das variáveis antigas das páginas, apontando para o tema */
--text:var(--label);--text-light:var(--label-2);--border:var(--sep);--card-bg:var(--bg-2);--secondary:var(--tint);--blue-bg:rgba(59,130,196,.14);--yellow-bg:rgba(227,162,26,.16)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--tint:${escuro};--bg:#000;--bg-2:#1c1c1e;--bg-3:#2c2c2e;--sep:rgba(84,84,88,.6);--label:#fff;--label-2:rgba(235,235,245,.65);--green:#32d74b;--green-bg:rgba(50,215,75,.14);--red:#ff6b61;--red-bg:rgba(255,69,58,.15);--orange:#ff9f0a;--fill:rgba(120,120,128,.32)}}
:root[data-theme="dark"]{--tint:${escuro};--bg:#000;--bg-2:#1c1c1e;--bg-3:#2c2c2e;--sep:rgba(84,84,88,.6);--label:#fff;--label-2:rgba(235,235,245,.65);--green:#32d74b;--green-bg:rgba(50,215,75,.14);--red:#ff6b61;--red-bg:rgba(255,69,58,.15);--orange:#ff9f0a;--fill:rgba(120,120,128,.32)}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--label);font:16px/1.6 -apple-system,BlinkMacSystemFont,"Inter","Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--tint)}
.hero{padding:44px 16px 28px;text-align:center;max-width:860px;margin:0 auto}
.hero h1{font-size:clamp(1.9rem,6vw,2.8rem);line-height:1.1;margin:0 0 10px;letter-spacing:-.02em}
.hero .subtitle{color:var(--label-2);margin:0 0 14px}
.hero .badge{display:inline-block;color:var(--tint);border:1px solid var(--tint);border-radius:999px;padding:3px 12px;font-size:.8rem;font-weight:700}
.hero .author{display:inline-block;margin-top:8px;color:var(--label-2);font-size:.85rem}
nav{position:sticky;top:0;z-index:10;background:color-mix(in srgb,var(--bg) 85%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--sep)}
.nav-inner{max-width:860px;margin:0 auto;display:flex;gap:4px;overflow-x:auto;padding:8px 16px;scrollbar-width:none}
.nav-link{white-space:nowrap;text-decoration:none;font-size:.82rem;font-weight:600;color:var(--label-2);padding:6px 10px;border-radius:999px}
.nav-link:hover{background:var(--bg-3);color:var(--label)}
.content{max-width:860px;margin:0 auto;padding:24px 16px 60px}
.section{margin-bottom:44px;scroll-margin-top:60px}
.section-header{display:flex;gap:12px;align-items:center;margin-bottom:16px}
.section-num{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:800;flex-shrink:0;background:var(--tint-fill)!important}
.section-title{font-size:1.35rem;margin:0;line-height:1.2;letter-spacing:-.01em}
.section-sub{margin:2px 0 0;color:var(--label-2);font-size:.85rem}
.card{background:var(--bg-2);border:1px solid var(--sep);border-radius:16px;padding:18px 18px;margin-bottom:14px}
.card p{margin:8px 0}
.card-title{font-weight:700;display:flex;align-items:center;gap:8px;margin-bottom:8px}
.dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.grid-2,.grid-3{display:grid;gap:12px;margin:12px 0}
.grid-2{grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}.grid-3{grid-template-columns:repeat(auto-fit,minmax(190px,1fr))}
.mini-card{background:var(--bg-3);border-radius:12px;padding:14px;border-top:4px solid var(--tint)}
.mini-card h4{margin:0 0 6px;font-size:.95rem}.mini-card p{margin:0;font-size:.9rem;color:var(--label-2)}
.list{list-style:none;padding:0;margin:10px 0;display:grid;gap:6px}
.list li{background:var(--bg-3);border-radius:10px;padding:8px 12px;font-size:.92rem}
.highlight,.highlight-purple,.highlight-gray,.tip-box,.warn-box,.highlight-box{border-radius:12px;padding:12px 16px;margin:12px 0;font-size:.92rem;background:var(--bg-3);border-left:4px solid var(--tint)}
.highlight-purple{border-left-color:#8e44ad}.highlight-gray{border-left-color:var(--label-2);color:var(--label-2)}
.quote{border-left:4px solid var(--tint);padding:10px 16px;margin:12px 0;font-style:italic;background:var(--bg-3);border-radius:0 12px 12px 0}
.quote span{display:block;font-style:normal;font-size:.8rem;color:var(--label-2);margin-top:4px}
.table-wrap{overflow-x:auto;margin:12px 0;border:1px solid var(--sep);border-radius:12px}
table{width:100%;border-collapse:collapse;font-size:.88rem}
th{background:var(--bg-3);text-align:left;padding:9px 12px;font-weight:700}
td{padding:9px 12px;border-top:1px solid var(--sep);vertical-align:top}
.tag{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;padding:2px 8px;border-radius:999px;background:var(--bg-3);color:var(--orange)}
img{max-width:100%;height:auto;border-radius:12px}
figure{margin:12px 0}figcaption{font-size:.82rem;color:var(--label-2);margin-top:4px}
footer{text-align:center;color:var(--label-2);font-size:.8rem;padding:24px 16px;border-top:1px solid var(--sep)}
.qz-score{top:52px}
${extraCss}
/* por último: o que precisa valer nos dois temas, acima do CSS antigo da página */
body{background:var(--bg)!important;color:var(--label)!important}
.hero{background:none!important;color:var(--label)!important}.hero::before{display:none!important}
.hero h1{color:var(--label)!important}.hero :is(.subtitle,.author){color:var(--label-2)!important;background:none!important;border-color:var(--sep)!important}
.hero .badge{background:none!important;color:var(--tint)!important;border:1px solid var(--tint)!important}
nav{background:var(--bg)!important;border-color:var(--sep)!important}.nav-link{color:var(--label-2)!important}
.card,.chapter-body,.quiz-section{color:var(--label)}
:is(.card,.mini-card,.list,td,.quote,[class^="highlight"],[class*=" highlight"],.tip-box,.warn-box,.info-box) :is(strong,b){color:inherit!important}
</style>
<style>${css.join('\n')}</style>
${limpo}
<script>
${widgets}
</script>`;
}

// Modo "igual ao site": leva o CSS do próprio site (shared.css + ios.css + labs.css) para o artefato.
// O ios.css já faz todas as páginas antigas funcionarem no claro e no escuro, e usa a mesma convenção
// de tema do claude.ai (data-theme no <html> + prefers-color-scheme). É o jeito que não quebra.
import { readFileSync as _ler } from 'node:fs';
import { join as _j } from 'node:path';
export function artefatoSite({ raiz, titulo, materia, pagina, corpo, widgets, estilosPagina }) {
  const css = f => _ler(_j(raiz, 'styles', f), 'utf8');
  const limpo = corpo
    .replace(/<body[^>]*>/, '').replace(/<\/body>/, '')
    .replace(/<div class="progress-bar"[^>]*><\/div>/, '')
    .replace(/<a class="back-link"[^>]*>[^<]*<\/a>/, '')
    .replace(/<section class="(?:section|chapter)" id="video"[\s\S]*?<\/section>/, '')
    .replace(/<a class="nav-link" href="#video">[^<]*<\/a>/, '')
    .replace(/<script\b[^>]*\bsrc=[^>]*><\/script>/g, '');
  return `<title>${titulo}</title>
<style>${estilosPagina}</style>
<style>${css('shared.css')}</style>
<style>${css('ios.css')}</style>
<style>${css('labs.css')}
/* artefato: sem a moldura do site (barra lateral, topo fixo), o conteúdo usa a largura toda */
body { margin: 0; background: var(--bg); color: var(--label); }
.qz-score { top: 8px; }
nav, .chapter-nav, .top-nav { background: var(--bg-2) !important; border-color: var(--sep) !important; box-shadow: none !important; }
nav a, .chapter-nav a { color: var(--label-2) !important; }
nav a:hover { color: var(--tint) !important; }
</style>
<script>document.documentElement.dataset.materia = ${JSON.stringify(materia)}; document.documentElement.dataset.pagina = ${JSON.stringify(pagina)};
(function liga() { if (!document.body) return document.addEventListener('DOMContentLoaded', liga); document.body.classList.add('ios', 'resumo'); })();</script>
${limpo}
<script>document.body.classList.add('ios', 'resumo');</script>
<script>
${widgets}
</script>`;
}
