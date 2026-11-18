// artefato-base.mjs — embrulha o corpo de uma página de resumo num HTML autônomo para o Artifact.
// Define as variáveis do ios.css (claro/escuro) e estiliza as classes dos resumos.
export function artefato({ titulo, tint: [claro, escuro], corpo, widgets, css = [], extraCss = '' }) {
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
--green:#1f8a3b;--green-bg:#e6f6ea;--red:#c9342c;--red-bg:#fdecea;--orange:#c46a00;--fill:rgba(120,120,128,.16);--primary:${claro};--c1:${claro};--c2:#8a5a00;--c3:#a0782a;--c4:#1f4e79}
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
</style>
<style>${css.join('\n')}</style>
${limpo}
<script>
${widgets}
</script>`;
}
