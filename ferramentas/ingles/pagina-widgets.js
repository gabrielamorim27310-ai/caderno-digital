const $ = s => document.querySelector(s);
const esc = s => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ── Idioms ── */
const IDIOMS = [
  ['be on a steep learning curve', 'ter muito para aprender, rápido; achar difícil no começo', 'I was on a steep learning curve when I started my new job.'],
  ['breeze through', 'fazer algo com muita facilidade e rapidez', 'Sarah breezed through the test and finished early.'],
  ['get your head down', 'se concentrar a sério no trabalho', "Let's get our heads down and finish this report."],
  ['go blank', 'dar branco: de repente não lembrar de nada', 'My mind went blank when the teacher called on me.'],
  ['drum sth into sb', 'repetir algo até a pessoa aprender', 'My parents drummed it into me that I should save money.'],
  ['keep sb on track', 'ajudar alguém a manter o foco nos objetivos', 'My study partner keeps me on track.'],
  ['run on empty', 'estar sem energia de tanto trabalhar', 'After studying all night, I was running on empty.'],
  ['get the hang of sth', 'pegar o jeito depois de praticar', "I'm finally getting the hang of the new software."],
  ['give it your best shot', 'fazer o máximo, mesmo sem garantia de sucesso', "I'm not sure I'll win, but I'll give it my best shot."],
];
function flipCards(el, list) {
  el.innerHTML = list.map(([t, m, e]) => `<button class="flip" type="button" aria-label="${esc(t)}"><div class="in"><div class="f"><strong>${esc(t)}</strong><small>toque para virar</small></div><div class="b"><span>${esc(m)}</span><i>${esc(e)}</i></div></div></button>`).join('');
  el.querySelectorAll('.flip').forEach(b => b.onclick = () => b.classList.toggle('on'));
}
flipCards($('#flips'), IDIOMS);

/* ── Attempt & effort ── */

function gapExercise(el, items) {
  el.innerHTML = items.map((it, i) => `<div class="gap" data-i="${i}"><p>${it.s.replace('___', '<span class="blank">?</span>')}</p><div class="opts">${shuffle(it.o).map(o => `<button type="button">${esc(o)}</button>`).join('')}</div>${it.w ? `<p class="why" hidden>${it.w}</p>` : ''}</div>`).join('');
  el.onclick = e => {
    const b = e.target.closest('.opts button'); if (!b) return;
    const g = b.closest('.gap'), it = items[g.dataset.i];
    if (g.dataset.done) return;
    if (b.textContent === it.a) {
      b.classList.add('ok'); g.dataset.done = 1;
      const bl = g.querySelector('.blank'); bl.textContent = it.a; bl.classList.add('ok');
      const w = g.querySelector('.why'); if (w) w.hidden = false;
    } else b.classList.add('no');
  };
}
gapExercise($('#effortGaps'), [
  { s: 'With seconds left before the portal closed, Sofia made ___ to recover her portfolio.', a: 'a last-ditch effort', o: ['a last-ditch effort', 'a sustained effort', 'a half-hearted effort'] },
  { s: 'Oliver added two vague sentences and went back to his phone: ___.', a: 'a half-hearted effort', o: ['a half-hearted effort', 'a strenuous effort', 'a valiant attempt'] },
  { s: 'Restoring the school garden took ___ over several months.', a: 'a sustained effort', o: ['a sustained effort', 'a frantic attempt', 'a futile attempt'] },
  { s: 'Despite losing two members, the debate team made ___ to win; the judges admired their courage.', a: 'a valiant attempt', o: ['a valiant attempt', 'a misguided attempt', 'a half-hearted effort'] },
  { s: 'Trying to recover the recordings from the destroyed device was ___.', a: 'a futile attempt', o: ['a futile attempt', 'a sustained effort', 'a last-ditch effort'] },
  { s: 'Banning group discussions to help students concentrate was ___: they lost interest.', a: 'a misguided attempt', o: ['a misguided attempt', 'a valiant attempt', 'a strenuous effort'] },
]);

/* ── Verb + preposition ── */
const PREPS = [['cram into', 'enfiar algo num espaço/tempo pequeno'], ['cram for', 'estudar muito em pouco tempo para uma prova'], ['backfire on', 'sair pela culatra para alguém'], ['apply yourself to', 'se dedicar a algo (+ -ing)'], ['sort into', 'separar em grupos'], ['associate with', 'associar a'], ['gape at', 'olhar boquiaberto para'], ['deflect from', 'desviar (atenção, culpa) de'], ['munch on', 'mastigar, beliscar']];
const P = ['into', 'on', 'to', 'for', 'with', 'at', 'from', 'than'];
const pg = (s, a, w) => ({ s, a, o: P.filter(x => x !== a).sort(() => Math.random() - 0.5).slice(0, 3).concat(a), w });
gapExercise($('#prepGaps'), [
  pg('First, avoid trying to cram all your revision ___ a single weekend.', 'into'),
  pg('Studying for hours without rest can backfire ___ you.', 'on'),
  pg('Instead, apply yourself ___ following a realistic study plan.', 'to', 'apply yourself to + <b>-ing</b> (following).'),
  pg('Sort your notes ___ manageable groups by topic.', 'into'),
  pg('This reduces the pressure to cram ___ an exam the night before.', 'for'),
  pg('If you associate breaks ___ laziness, remember that rest is part of preparation.', 'with'),
  pg('You might gape ___ your timetable when you see how much there is to revise.', 'at'),
  pg("Don't let that feeling deflect you ___ your main goal.", 'from'),
  pg('Try munching ___ some fruit or nuts during a break.', 'on'),
  pg('Returning to your books refreshed is more useful ___ studying when you are too tired.', 'than', 'Comparação: more useful <b>than</b>.'),
]);

/* ── Key word transformations ── */
const KWT = [
  ['I am almost certain that someone gave the journalist a copy of the secret report.', 'MUST', 'The journalist', 'a copy of the secret report.', ['must have been given']],
  ['Perhaps the researchers missed an important detail.', 'MIGHT', 'The researchers', 'an important detail.', ['might have missed']],
  ['It is impossible that Eva wrote the review: she had never seen the show.', "CAN'T", 'Eva', 'the review.', ["can't have written", 'cannot have written']],
  ['It was a mistake for Max to share the results before anyone checked them.', "SHOULDN'T", 'Max', 'the results before anyone had checked them.', ["shouldn't have shared", 'should not have shared']],
  ['The school did not ask the students for their opinions, but that would have been right.', 'OUGHT', 'The school', 'the students for their opinions.', ['ought to have asked']],
  ['We printed all the worksheets, but it was unnecessary: everyone got an online copy.', "NEEDN'T", 'We', 'all the worksheets.', ["needn't have printed", 'need not have printed']],
  ['The weekly feedback prevents our group from losing focus on its objectives.', 'TRACK', 'The weekly feedback', 'its objectives.', ['keeps our group on track with', 'keeps us on track with']],
  ['Sofia completed the assessment without experiencing any difficulty.', 'BREEZED', 'Sofia', 'the assessment.', ['breezed through', 'simply breezed through', 'easily breezed through']],
];
const norm = s => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
$('#kwt').innerHTML = KWT.map(([a, k, s, e], i) => `<div class="item"><p>${esc(a)} <span class="key">${k}</span></p><p>${esc(s)} <input id="k${i}" autocomplete="off" spellcheck="false" aria-label="answer ${i + 1}"> ${esc(e)}</p><div class="row"><button class="kbtn" type="button" data-i="${i}">Check</button><span class="ans" id="ka${i}" aria-live="polite"></span></div></div>`).join('');
$('#kwt').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  const i = +b.dataset.i, inp = $('#k' + i), ok = KWT[i][4].map(norm).includes(norm(inp.value));
  inp.className = ok ? 'ok' : 'no';
  $('#ka' + i).textContent = ok ? 'Correct!' : 'Answer: ' + KWT[i][4][0];
};

/* ── Body language ── */
const GEST = [
  ['fold-your-arms', 'fold your arms', 'cruzar os braços', 'cross your arms over your chest: defensive, closed, or just comfortable'],
  ['purse-your-lips', 'purse your lips', 'apertar os lábios', 'press your lips tightly together: disapproval, holding words back'],
  ['furrow-your-brow', 'furrow your brow', 'franzir a testa', 'draw your eyebrows together: concentration or confusion'],
  ['drum-your-fingers', 'drum your fingers', 'tamborilar os dedos', 'tap your fingers again and again: impatience'],
  ['rub-your-hands-together', 'rub your hands together', 'esfregar as mãos', 'rub your palms together: excitement, something good is coming'],
  ['tilt-your-head', 'tilt your head', 'inclinar a cabeça', 'move your head slightly to one side: curiosity, a question'],
  ['cross-your-ankles', 'cross your ankles', 'cruzar os tornozelos', 'place one ankle over the other while sitting'],
  ['steeple-your-hands', 'steeple your hands', 'juntar as pontas dos dedos', 'press your fingertips together in a triangle: confidence, thinking'],
  ['wrinkle-your-nose', 'wrinkle your nose', 'torcer o nariz', 'screw up your nose: disgust, a bad smell'],
  ['stroke-your-chin', 'stroke your chin', 'alisar o queixo', 'move your hand gently over your chin: thinking it over'],
  ['give-a-thumbs-up', 'give a thumbs up', 'fazer joinha', 'raise your thumb: approval, well done'],
  ['cross-your-fingers', 'cross your fingers', 'cruzar os dedos', 'twist one finger over another: hoping for good luck'],
  ['clear-your-throat', 'clear your throat', 'pigarrear', 'cough lightly: before speaking or to get attention'],
  ['shrug-your-shoulders', 'shrug your shoulders', 'dar de ombros', 'raise and lower your shoulders: I don’t know / I don’t care'],
  ['grind-your-teeth', 'grind your teeth', 'ranger os dentes', 'rub your teeth together hard: frustration, or in your sleep'],
  ['twirl-your-hair', 'twirl your hair', 'enrolar o cabelo no dedo', 'wind a strand of hair around your finger: nervous or bored'],
  ['flick-your-hair-back', 'flick your hair back', 'jogar o cabelo para trás', 'move your hair away from your face with a quick movement'],
  ['bite-your-lip', 'bite your lip', 'morder o lábio', 'hold your lip between your teeth: nervous, holding back words'],
];
$('#gallery').innerHTML = GEST.map(([f, en, pt, m]) => `<figure class="gcard"><img src="ing-imgs/3tri/${f}.svg" alt="${en}" loading="lazy" width="240" height="240"><b>${en}</b><span>${m}</span><span lang="pt-BR" style="font-style:italic">${pt}</span></figure>`).join('');
let gRight = 0, gTotal = 0, gCur, gDone;
function gRound() {
  gCur = GEST[Math.floor(Math.random() * GEST.length)]; gDone = false;
  $('#gImg').src = `ing-imgs/3tri/${gCur[0]}.svg`; $('#gImg').alt = 'Which gesture is this?';
  const opts = shuffle([gCur, ...shuffle(GEST.filter(g => g !== gCur)).slice(0, 3)]);
  $('#gOpts').innerHTML = opts.map(g => `<button type="button" data-f="${g[0]}">${g[1]}</button>`).join('');
  $('#gMsg').textContent = '';
}
$('#gOpts').onclick = e => {
  const b = e.target.closest('button'); if (!b || gDone) return;
  gDone = true; gTotal++;
  if (b.dataset.f === gCur[0]) { gRight++; b.classList.add('ok'); $('#gMsg').textContent = `Correct! To ${gCur[1]} = ${gCur[3]}.`; }
  else { b.classList.add('no'); $('#gOpts').querySelector(`[data-f="${gCur[0]}"]`).classList.add('ok'); $('#gMsg').textContent = `Not quite. It's "${gCur[1]}": ${gCur[3]}.`; }
  $('#gScore').textContent = `${gRight}/${gTotal}`;
};
$('#gNext').onclick = gRound; gRound();
flipCards($('#bodyIdioms'), [
  ['get in over your head', 'assumir mais do que dá conta', 'He agreed to lead three projects and got in over his head.'],
  ['get cold feet', 'amarelar: ficar nervoso e pensar em desistir', 'Nina got cold feet just before going on stage.'],
  ['give sb the cold shoulder', 'ignorar alguém de propósito', 'After the argument, she gave him the cold shoulder.'],
  ['keep your chin up', 'não desanimar', 'Keep your chin up: one defeat does not erase your progress.'],
  ['turn your nose up at sth', 'desprezar algo por achar que não está à altura', 'She turned her nose up at the second-hand jacket.'],
  ['off the top of my head', 'de cabeça, sem conferir', "I can't tell you the exact figure off the top of my head."],
  ['my lips are sealed', 'não vou contar a ninguém', "You can trust me with the surprise. My lips are sealed."],
  ['get off my back', 'pare de me criticar e pressionar', 'Get off my back! I am doing my best.'],
]);

/* ── Tenses ── */
gapExercise($('#tenseGaps'), [
  { s: 'Thousands of students ___ to the streets since the protests began.', a: 'have taken', o: ['have taken', 'took', 'had taken', 'are taken'], w: '<b>since</b> → present perfect.' },
  { s: 'The student action ___ in late September last year.', a: 'began', o: ['began', 'has begun', 'had began', 'has been beginning'], w: 'Data fechada no passado → simple past.' },
  { s: 'More than 1,000 schools ___ by protests so far.', a: 'have been affected', o: ['have been affected', 'have affected', 'had affecting', 'are affect'], w: '<b>so far</b> + passiva → have been + particípio.' },
  { s: 'By the time the minister spoke, police ___ several people earlier that week.', a: 'had arrested', o: ['had arrested', 'have arrested', 'are arresting', 'arrest'], w: 'Ação anterior a outra no passado → past perfect.' },
  { s: 'The students described what they perceived ___ unfair treatment.', a: 'as', o: ['as', 'like', 'for', 'with'], w: '<b>perceive sth as</b> sth.' },
  { s: 'There are 35 pupils ___ class.', a: 'per', o: ['per', 'by', 'at', 'with'], w: '<b>per</b> class = em cada sala.' },
  { s: 'Students are calling ___ greater investment in education.', a: 'for', o: ['for', 'to', 'with', 'at'], w: '<b>call for</b> = exigir, pedir.' },
  { s: '___ particular, they want more spending on schools in poorer suburbs.', a: 'In', o: ['In', 'On', 'At', 'For'], w: '<b>In particular</b> = principalmente.' },
]);
