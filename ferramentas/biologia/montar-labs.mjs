// montar-labs.mjs — encaixa os laboratórios interativos numa página de Biologia e gera o artefato.
// Uso: node ferramentas/biologia/montar-labs.mjs 3tri   (ou 2tri)
// Fontes: labs-<tri>.html (blocos "<!--@idDaSecao-->") e labs-<tri>.js. Pode rodar quantas vezes quiser:
// os blocos ficam entre marcadores <!-- LABS:id --> ... <!-- /LABS --> e são trocados a cada execução.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { artefato } from '../artefato-base.mjs';
const AQUI = dirname(fileURLToPath(import.meta.url)), RAIZ = join(AQUI, '..', '..');
const tri = process.argv[2] || '3tri', arq = join(RAIZ, `biologia-${tri}.html`);
const crlf = readFileSync(arq, 'utf8').includes('\r\n');
let html = readFileSync(arq, 'utf8').replace(/\r\n/g, '\n');
const fonte = readFileSync(join(AQUI, `labs-${tri}.html`), 'utf8');
const js = '(function () {\n' + readFileSync(join(AQUI, 'labs-comum.js'), 'utf8') + '\n' + readFileSync(join(AQUI, `labs-${tri}.js`), 'utf8') + '\n})();';

// limpa execuções anteriores
html = html.replace(/\n?<!-- LABS:[\w-]+ -->[\s\S]*?<!-- \/LABS -->\n?/g, '\n')
  .replace(/\n?<!-- LABS-JS -->[\s\S]*?<!-- \/LABS-JS -->\n?/g, '\n')
  .replace(/\n<link rel="stylesheet" href="styles\/labs.css">/g, '');

const blocos = fonte.split(/<!--@([\w-]+)-->/).slice(1);
for (let i = 0; i < blocos.length; i += 2) {
  const id = blocos[i], corpo = blocos[i + 1].trim();
  const ini = html.indexOf(`id="${id}"`); if (ini < 0) throw new Error('seção não encontrada: ' + id);
  const prox = html.indexOf('<section', ini + 5), fimSec = html.lastIndexOf('</section>', prox < 0 ? html.length : prox);
  if (fimSec < ini) throw new Error('fim da seção não achado: ' + id);
  html = html.slice(0, fimSec) + `<!-- LABS:${id} -->\n${corpo}\n<!-- /LABS -->\n` + html.slice(fimSec);
}
html = html.replace('<link rel="stylesheet" href="styles/ios.css">', '<link rel="stylesheet" href="styles/ios.css">\n<link rel="stylesheet" href="styles/labs.css">');
let marca = html.indexOf('<!-- ═══ CHATBOT'); if (marca < 0) marca = html.lastIndexOf('</body>');
html = html.slice(0, marca) + `<!-- LABS-JS -->\n<script>\n${js}\n</script>\n<!-- /LABS-JS -->\n` + html.slice(marca);
writeFileSync(arq, crlf ? html.replace(/\n/g, '\r\n') : html);

// artefato: corpo da página sem chatbot, com estilos próprios da página
const estilos = [...html.slice(0, html.indexOf('<body')).matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const corpo = html.slice(html.indexOf('<body'), html.indexOf('<!-- LABS-JS -->')).replace(/<script[^>]*src=[^>]*><\/script>/g, '');
mkdirSync(join(AQUI, 'artefato'), { recursive: true });
writeFileSync(join(AQUI, 'artefato', `biologia-${tri}.html`), artefato({
  titulo: `Biologia ${tri[0]}º Tri`, tint: ['#1f7a4d', '#4cd388'], corpo, widgets: js,
  css: [readFileSync(join(RAIZ, 'styles/labs.css'), 'utf8')],
  extraCss: '/* estilos da página, depois dos do artefato */\n' + estilos.replace(/:root\s*\{[\s\S]*?\}/, ''),
}));
console.log(`biologia-${tri}.html: ${blocos.length / 2} seções com laboratórios; artefato gerado.`);
