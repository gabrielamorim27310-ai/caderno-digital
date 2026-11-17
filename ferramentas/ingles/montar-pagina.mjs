// montar-pagina.mjs — monta ingles-3tri.html (moldura de portugues-3tri + corpo + quiz + widgets)
// Uso: node ferramentas/ingles/montar-pagina.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const AQUI = dirname(fileURLToPath(import.meta.url)), RAIZ = join(AQUI, '..', '..');

const molde = readFileSync(join(RAIZ, 'portugues-3tri.html'), 'utf8');
let cabeca = molde.slice(0, molde.indexOf('<body'));
const cauda = molde.slice(molde.indexOf('<!-- ═══ CHATBOT'));

cabeca = cabeca
  .replace('data-pagina="portugues-3tri" data-materia="portugues"', 'data-pagina="ingles-3tri" data-materia="ingles"')
  .replace(/<title>[^<]*<\/title>/, '<title>Inglês C1 3º Tri — Idioms, Modals &amp; Body Language 2026</title>')
  .replace(/:root \{[\s\S]*?\n  \}/, `:root {
    --primary: #0e6b7a;
    --secondary: #17a2ad;
    --bg: #f5fbfa;
    --card-bg: #ffffff;
    --text: #1e1e1e;
    --text-light: #5f6f6e;
    --border: #d9ebe8;
    --c1: #0e6b7a;
    --c2: #b4531e;
    --c3: #17808b;
    --c4: #1f4e79;
  }`)
  .replace('linear-gradient(135deg, #1a0030 0%, #4a1060 55%, #7b2d8b 100%)', 'linear-gradient(135deg, #062a31 0%, #0e6b7a 55%, #17a2ad 100%)')
  .replace(/#fdf5ff/g, '#eef8f7').replace(/#f5e8ff, #ede0ff/g, '#e3f4f2, #d6efec').replace(/#f5e8ff/g, '#e3f4f2').replace(/#4a1060/g, '#0e6b7a');

// ── Quiz (formato Part 1: 5 alternativas) ──
const Q = [
  ['Choose the sentence in which the expression in bold does <b>NOT</b> fit the context.', [
    'Having never edited a documentary, Clara found herself <b>on a steep learning curve</b>.',
    'Although she had memorised every line and spoke without hesitation, Ana <b>went blank</b> on stage.',
    'With the deadline approaching, Maya decided to <b>get her head down</b> and revise.',
    'Despite the complex exam, Daniel <b>breezed through</b> it with time to spare.',
    'The coach <b>drummed</b> the rules <b>into</b> the players through constant repetition.'], 'b',
    'Quem lembrou de tudo e falou sem hesitar não "deu branco". O contexto contradiz <i>go blank</i>.'],
  ['Which collocation best completes the sentence? "The firefighters made ___ to rescue the people trapped inside the burning building."', [
    'a half-hearted effort', 'a misguided attempt', 'a futile attempt', 'a valiant attempt', 'a frantic effort'], 'd',
    'Coragem e determinação numa situação perigosa: <i>a valiant attempt</i>.'],
  ['Choose the alternative in which the expression in bold is <b>wrongly formed</b>.', [
    'The teacher’s plan to compare grades <b>backfired at</b> her.',
    'Alice <b>sorted</b> her notes <b>into</b> separate folders.',
    'I <b>associate</b> this song <b>with</b> our school trip.',
    'He <b>crammed for</b> the exam the night before.',
    'We <b>munched on</b> popcorn during the film.'], 'a',
    'O certo é <i>backfire <b>on</b></i> somebody.'],
  ['"Working calmly through a revision plan, with plenty of time before the exam, Sofia made ___ to prepare." Which option does NOT fit the context?', [
    'a sustained effort', 'a consistent effort', 'a frantic attempt', 'a determined effort', 'a serious effort'], 'c',
    '<i>Frantic</i> é desesperado e apressado: contradiz "calmly, with plenty of time".'],
  ['Which alternative contains a <b>mistake</b> in the use of modal verbs?', [
    'Students mustn’t disclose the confidential responses.',
    'Candidates may consult the reference materials.',
    '"I ought reconsider my approach," Leo admitted.',
    'All participants have to submit a consent form.',
    'Nina can’t operate the equipment independently yet.'], 'c',
    'Falta o <b>to</b>: <i>ought to reconsider</i>.'],
  ['Choose the explanation that does <b>NOT</b> match the sentence.', [
    '"We needn’t have printed the questionnaires." → They printed them, but it was unnecessary.',
    '"She can’t have attended the rehearsal." → It is impossible that she attended.',
    '"He might have forgotten the file." → Forgetting is a possibility, not a certainty.',
    '"They shouldn’t have shared the screenshot." → They didn’t share it, but sharing was advisable.',
    '"They must have rehearsed a lot." → The speaker is almost certain they rehearsed.'], 'd',
    '<i>Shouldn’t have shared</i> = compartilharam e não deviam.'],
  ['"Their timing was perfect after months of daily practice. They ___ rehearsed thoroughly."', [
    'can’t have', 'needn’t have', 'must have', 'shouldn’t have', 'ought to have'], 'c',
    'Dedução quase certa sobre o passado: <i>must have</i> + particípio.'],
  ['Which alternative <b>CANNOT</b> be completed with any of the words from the box? <i>shrug · grind · clear · twirl · flick</i>', [
    'Before speaking, Leo ___ his throat.',
    'Maya simply ___ her shoulders.',
    'Nina absent-mindedly ___ a strand of hair around her finger.',
    'Repeatedly ___ your teeth can damage them.',
    'The student ___ his chin thoughtfully.'], 'e',
    'Queixo vai com <i>stroke</i>, que não está no quadro.'],
  ['"When she smelt the spoiled milk, she ___ her nose."', ['stroked', 'pursed', 'wrinkled', 'furrowed', 'steepled'], 'c',
    '<i>Wrinkle your nose</i>: torcer o nariz de nojo.'],
  ['Choose the sentence in which the expression in bold does <b>NOT</b> fit the context.', [
    'Before answering, she <b>steepled her hands</b>, fingertips together.',
    'As the results failed to appear, students began <b>drumming their fingers</b>.',
    'Confused by the instructions, Daniel <b>furrowed his brow</b>.',
    'Nina <b>gave him the cold shoulder</b>, inviting him to sit beside her and chat.',
    'The leader <b>pursed her lips</b> and waited for the others to finish.'], 'd',
    '<i>Give someone the cold shoulder</i> é ignorar de propósito; convidar para sentar é o contrário.'],
  ['"She rejected the second-hand jacket because she considered it beneath her." She ___.', [
    'got cold feet', 'turned her nose up at it', 'kept her chin up', 'got in over her head', 'gave it her best shot'], 'b',
    '<i>Turn your nose up at</i>: desprezar por achar que não está à altura.'],
  ['"Lucas agreed to edit the documentary, organise the exhibition and lead the debate team at the same time, and soon could not cope." He ___.', [
    'got cold feet', 'kept his chin up', 'got in over his head', 'gave her the cold shoulder', 'got off her back'], 'c',
    '<i>Get in over your head</i>: assumir mais do que dá conta.'],
  ['"Even when given convincing evidence, he refuses to reconsider his position." He has ___.', [
    'a stubborn streak', 'raw talent', 'boundless energy', 'natural aptitude', 'self-conviction'], 'a',
    '<i>Stubborn streak</i>: um traço teimoso.'],
  ['In <i>Our Two Selves</i>, why does Molly suddenly start hitting the ball?', [
    'The coach gives her precise technical instructions.',
    'She replaces negative judgements with positive ones.',
    'Focusing on "bounce" and "hit" leaves no room for Self 1’s judgements.',
    'She has trained in secret before the lesson.',
    'She imitates the coach’s movements exactly.'], 'c',
    'Atenção total no presente: o Self 1 fica calado e o Self 2 joga, em concentração relaxada.'],
  ['"Thousands of students ___ to the streets since the protests began."', ['took', 'have taken', 'had taken', 'are taken', 'take'], 'b',
    '<i>Since</i> pede present perfect.'],
  ['In chapter 26 of <i>The Catcher in the Rye</i>, Holden objects to being asked whether he will apply himself at school. His response suggests that he', [
    'has decided to work hard but hides it.',
    'blames his teachers for all his problems.',
    'questions the idea that future behaviour can be predicted from present intentions.',
    'wants to reassure the adults around him.',
    'believes effort can never change anything.'], 'c',
    'Para Holden, não dá para saber o que vai fazer antes de fazer.'],
];
const L = 'abcde';
const quiz = `
    <style>
      .quiz { background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; margin-bottom: 14px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
      .quiz-q { display: flex; align-items: flex-start; gap: 12px; padding: 16px 16px 10px; font-weight: 600; font-size: 0.92rem; }
      .quiz-num { background: var(--primary); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0; margin-top: 1px; }
      .quiz-opts { display: flex; flex-direction: column; gap: 6px; padding: 0 16px 14px; }
      .opt { display: flex; align-items: flex-start; gap: 10px; padding: 9px 12px; border-radius: 8px; border: 1px solid var(--border); cursor: pointer; font-size: 0.88rem; transition: all 0.15s; }
      .opt:hover { border-color: var(--secondary); background: #eef8f7; }
      .opt-letter { width: 22px; height: 22px; border-radius: 50%; background: #e3f4f2; color: var(--primary); font-weight: 700; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
      .opt.correct { border-color: #166534; background: #f0fdf4; }
      .opt.correct .opt-letter { background: #166534; color: white; }
      .opt.wrong { border-color: #9c1c1c; background: #fff5f5; }
      .opt.wrong .opt-letter { color: #9c1c1c; }
      .opt.disabled { cursor: default; pointer-events: none; }
      .opt.reveal-correct { border-color: #166534; background: #f0fdf4; opacity: 0.7; }
      .quiz-feedback { margin: 0 16px 14px; padding: 10px 14px; border-radius: 10px; font-size: 0.86rem; display: none; }
      .quiz-feedback.show { display: block; }
      .quiz-feedback.ok { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
      .quiz-feedback.err { background: #fff5f5; border: 1px solid #fecaca; color: #9c1c1c; }
      .score-bar { background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; padding: 20px 24px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
      .score-val { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; color: var(--primary); }
      .score-label { font-size: 0.82rem; color: var(--text-light); }
      .btn-reset { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-size: 0.85rem; font-weight: 600; font-family: 'Inter', sans-serif; }
      .btn-reset:hover { background: var(--c3); }
    </style>
    <div class="score-bar">
      <div>
        <div class="score-val"><span id="score">0</span>/<span id="total">${Q.length}</span></div>
        <div class="score-label">acertos · clique nas alternativas para responder</div>
      </div>
      <button class="btn-reset" onclick="resetQuiz()">↺ Reiniciar</button>
    </div>
    <script>
      const ANSWERS = {${Q.map((q, i) => `q${i + 1}:'${q[2]}'`).join(',')}};
      let score = 0, answered = 0;
      function pick(qid, letter, el) {
        const opts = el.closest('.quiz-opts').querySelectorAll('.opt');
        opts.forEach(o => o.classList.add('disabled'));
        const fb = document.getElementById('fb-'+qid);
        if (letter === ANSWERS[qid]) {
          el.classList.add('correct'); score++; answered++;
          document.getElementById('score').textContent = score;
          fb.className = 'quiz-feedback show ok';
          fb.innerHTML = '✅ <strong>Correto!</strong> ' + fb.dataset.ok;
        } else {
          el.classList.add('wrong'); answered++;
          opts.forEach(o => { if(o.dataset.l === ANSWERS[qid]) o.classList.add('reveal-correct'); });
          fb.className = 'quiz-feedback show err';
          fb.innerHTML = '❌ <strong>Incorreto.</strong> ' + fb.dataset.err;
        }
      }
      function resetQuiz() {
        score = 0; answered = 0;
        document.getElementById('score').textContent = 0;
        document.querySelectorAll('.opt').forEach(o => o.className = 'opt');
        document.querySelectorAll('.quiz-feedback').forEach(f => f.className = 'quiz-feedback');
      }
    </script>
${Q.map(([stem, opts, ans, why], i) => {
  const id = 'q' + (i + 1), w = why.replace(/"/g, '&quot;');
  return `
    <div class="quiz">
      <div class="quiz-q"><span class="quiz-num">${i + 1}</span><span>${stem}</span></div>
      <div class="quiz-opts">
${opts.map((o, j) => `        <div class="opt" data-l="${L[j]}" onclick="pick('${id}','${L[j]}',this)"><span class="opt-letter">${L[j].toUpperCase()}</span> ${o}</div>`).join('\n')}
      </div>
      <div id="fb-${id}" class="quiz-feedback" data-ok="${w}" data-err="${w}"></div>
    </div>`;
}).join('\n')}
`;

const corpo = readFileSync(join(AQUI, 'pagina-corpo.html'), 'utf8').replace('QUIZ_AQUI', quiz);
const widgets = `<script>\n${readFileSync(join(AQUI, 'pagina-widgets.js'), 'utf8')}\n</script>\n`;
writeFileSync(join(RAIZ, 'ingles-3tri.html'), cabeca + corpo + '\n' + widgets + '\n' + cauda);
console.log('ingles-3tri.html montado:', Q.length, 'perguntas;', 'gabarito', Q.map(q => q[2]).join(''));
