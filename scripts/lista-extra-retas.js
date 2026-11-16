/* Lista Extra de Retas (Matemática 3º tri): dados, gráficos, conferência e passo a passo.
   A página matematica-3tri.html só tem a moldura; tudo dentro de #lista é montado aqui. */
/* ---------- helpers de matemática ---------- */
function conv(s){
  s = s.replace(/(?<![A-Za-z_])([a-z])(?:_([A-Za-z0-9]+))?(?![A-Za-z])/g,
      (_, v, sub) => `<i>${v}</i>` + (sub ? `<sub>${sub}</sub>` : ''));
  s = s.replace(/\[\[(.+?)\|\|(.+?)\]\]/g, '<span class="fr"><span>$1</span><span>$2</span></span>');
  return s;
}
const M = s => `<span class="m">${conv(s)}</span>`;

/* ---------- dados ---------- */
const TEMAS = [
  {id:'medio', nome:'Ponto médio', cola:[
    ['Ponto médio de AB', 'M = ([[x_A + x_B||2]], [[y_A + y_B||2]])'],
    ['Paralelogramo ABCD (x com x, y com y)', 'A + C = B + D'],
  ], extra:'As diagonais de um paralelogramo se cortam no ponto médio das duas.'},
  {id:'paralelas', nome:'Retas paralelas', cola:[
    ['Coeficiente angular de ax + by + c = 0', 'm = −[[a||b]]'],
    ['Por dois pontos', 'm = [[y_B − y_A||x_B − x_A]]'],
    ['Reta por P com coeficiente m', 'y − y_P = m(x − x_P)'],
    ['Paralelas', 'm_s = m_r'],
  ], extra:'Atalho: a paralela a ax + by + c = 0 é ax + by + k = 0. Você só descobre o k jogando o ponto.'},
  {id:'perp', nome:'Retas perpendiculares', cola:[
    ['Perpendiculares', 'm_s = −[[1||m_r]]'],
    ['Na prática', 'inverte e troca o sinal'],
    ['Perpendicular a ax + by + c = 0', 'bx − ay + k = 0'],
  ], extra:'Atalho: troque a com b, troque um dos sinais e descubra o k jogando o ponto.'},
];

const EX = [
{n:'06', tema:'medio', titulo:'Ponto médio com incógnitas',
 enun:`Sendo ${M('A(2a − 3, a + 3b)')}, ${M('B(b − 4a, 5a − 3b)')} e ${M('M(2b − 2a, 4a − 3b)')}, onde M é ponto médio de AB, determine M.`,
 parts:[{
  check:{type:'pt', val:[-4,9], ph:'ex.: (2, −5)'},
  steps:[
   `M é ponto médio, então cada coordenada de M é a média das coordenadas de A e B. Isso dá uma equação para x e outra para y.`,
   `Abscissas: ${M('[[(2a − 3) + (b − 4a)||2]] = 2b − 2a')} ⇒ ${M('−2a + b − 3 = 4b − 4a')} ⇒ ${M('2a − 3b = 3')}`,
   `Ordenadas: ${M('[[(a + 3b) + (5a − 3b)||2]] = 4a − 3b')} ⇒ ${M('3a = 4a − 3b')} ⇒ ${M('a = 3b')}`,
   `Substituindo na primeira: ${M('2(3b) − 3b = 3')} ⇒ ${M('3b = 3')} ⇒ ${M('b = 1')} e ${M('a = 3')}.`,
   `Agora é só trocar em M: ${M('M(2·1 − 2·3, 4·3 − 3·1) = M(−4, 9)')}. Conferindo: com esses valores, ${M('A(3, 6)')} e ${M('B(−11, 12)')}, e a média dá ${M('(−4, 9)')}.`,
  ],
  answer:'M(−4, 9)',
  tip:`<b>Pegadinha:</b> a pergunta pede M, não a e b. Muita gente para em ${M('a = 3, b = 1')} e perde a questão.`,
  fig:{view:[-13,5,-1,17], hideUntil:true, caption:'Com a = 3 e b = 1',
   items:[
    {t:'seg', p:[3,6,-11,12], ans:1},
    {t:'pt', x:3, y:6, l:'A', ans:1},
    {t:'pt', x:-11, y:12, l:'B', ans:1},
    {t:'pt', x:-4, y:9, l:'M', ans:1, res:1},
   ]}
 }]},

{n:'08', tema:'medio', titulo:'Circunferência e paralelogramo',
 enun:`Resolver:`,
 parts:[
 {label:'a', enun:`Se AB, com ${M('A(−5, 11)')} e ${M('B(−1, 3)')}, é um diâmetro de uma circunferência, determine o seu centro.`,
  check:{type:'pt', val:[-3,7], ph:'ex.: (1, 2)'},
  steps:[
   `O centro da circunferência fica no meio de qualquer diâmetro. Então o centro é o ponto médio de AB.`,
   `${M('C = ([[−5 + (−1)||2]], [[11 + 3||2]]) = ([[−6||2]], [[14||2]])')}`,
   `${M('C(−3, 7)')}`,
  ],
  answer:'C(−3, 7)',
  fig:{view:[-11,5,-1,15], items:[
    {t:'seg', p:[-5,11,-1,3]},
    {t:'circle', cx:-3, cy:7, r:Math.sqrt(20), ans:1},
    {t:'pt', x:-5, y:11, l:'A'},
    {t:'pt', x:-1, y:3, l:'B'},
    {t:'pt', x:-3, y:7, l:'C', ans:1, res:1},
  ]}},
 {label:'b', enun:`Determine o ponto de intersecção das diagonais de um paralelogramo ABCD dados ${M('B(−1, 8)')} e ${M('D(5, −2)')}.`,
  check:{type:'pt', val:[2,3], ph:'ex.: (1, 2)'},
  steps:[
   `Em ABCD, B e D são vértices opostos, então BD é uma diagonal. As diagonais se cortam no ponto médio de cada uma.`,
   `${M('M = ([[−1 + 5||2]], [[8 + (−2)||2]]) = ([[4||2]], [[6||2]])')}`,
   `${M('M(2, 3)')}. Não precisa de A nem de C.`,
  ],
  answer:'M(2, 3)',
  fig:{view:[-5,9,-4,10], items:[
    {t:'seg', p:[-1,8,5,-2], dash:1},
    {t:'pt', x:-1, y:8, l:'B'},
    {t:'pt', x:5, y:-2, l:'D'},
    {t:'pt', x:2, y:3, l:'M', ans:1, res:1},
  ]}},
 {label:'c', enun:`Determine o vértice D de um paralelogramo ABCD dados ${M('A(−3, −4)')}, ${M('B(−1, 4)')} e ${M('C(5, 6)')}.`,
  check:{type:'pt', val:[3,-2], ph:'ex.: (1, 2)'},
  steps:[
   `As diagonais de ABCD são AC e BD, e uma corta a outra bem no meio. Então o ponto médio de AC é o mesmo ponto médio de BD.`,
   `Só no x: ${M('[[x_A + x_C||2]] = [[x_B + x_D||2]]')}. Multiplicando por 2: ${M('x_A + x_C = x_B + x_D')}. No y é igual: ${M('y_A + y_C = y_B + y_D')}. O atalho ${M('A + C = B + D')} é só esse par de contas: x com x, y com y.`,
   `${M('A + C = (−3 + 5, −4 + 6) = (2, 2)')}. Então ${M('B + D')} também tem que dar ${M('(2, 2)')}.`,
   `Com ${M('B(−1, 4)')}: ${M('x_D = 2 − (−1) = 3')} e ${M('y_D = 2 − 4 = −2')}. Logo ${M('D(3, −2)')}, e as duas diagonais se encontram em ${M('(1, 1)')}.`,
  ],
  answer:'D(3, −2)',
  tip:`<b>Cuidado com a ordem:</b> em ABCD os vértices vão em sequência, então os opostos são A com C e B com D.`,
  fig:{view:[-6,8,-6,8], items:[
    {t:'seg', p:[-3,-4,-1,4]}, {t:'seg', p:[-1,4,5,6]},
    {t:'seg', p:[5,6,3,-2], ans:1, res:1}, {t:'seg', p:[3,-2,-3,-4], ans:1, res:1},
    {t:'seg', p:[-3,-4,5,6], dash:1, ans:1}, {t:'seg', p:[-1,4,3,-2], dash:1, ans:1},
    {t:'pt', x:-3, y:-4, l:'A'}, {t:'pt', x:-1, y:4, l:'B'}, {t:'pt', x:5, y:6, l:'C'},
    {t:'pt', x:3, y:-2, l:'D', ans:1, res:1},
  ]}},
 ]},

{n:'34', tema:'paralelas', titulo:'Paralela por um ponto',
 enun:`Dada a reta ${M('(r) 4x − 2y − 3 = 0')} e o ponto ${M('P(−1, 3)')}, determine a equação da reta s que passa por P e é paralela à r.`,
 parts:[{
  check:{type:'ln', val:[2,-1,5], ph:'ex.: 3x + y − 2 = 0'},
  steps:[
   `Paralelas têm o mesmo coeficiente angular. Em ${M('ax + by + c = 0')}, ${M('m = −[[a||b]]')}: ${M('m_r = −[[4||−2]] = 2')}.`,
   `Reta s por P com ${M('m = 2')}: ${M('y − 3 = 2(x − (−1))')}`,
   `${M('y − 3 = 2x + 2')} ⇒ ${M('2x − y + 5 = 0')}`,
  ],
  answer:'(s) 2x − y + 5 = 0',
  tip:`<b>Atalho:</b> a paralela é ${M('4x − 2y + k = 0')}. Com P: ${M('−4 − 6 + k = 0')} ⇒ ${M('k = 10')}. Fica ${M('4x − 2y + 10 = 0')}, que dividido por 2 é a mesma resposta.`,
  fig:{view:[-6,6,-5,7], items:[
    {t:'line', a:4, b:-2, c:-3, l:'r'},
    {t:'line', a:2, b:-1, c:5, l:'s', ans:1},
    {t:'pt', x:-1, y:3, l:'P'},
  ]}
 }]},

{n:'37', tema:'paralelas', titulo:'Paralela por um ponto',
 enun:`Determine a equação da reta s que passa por ${M('P(−3, 2)')} e é paralela à reta ${M('(r) 5x − 2y − 1 = 0')}.`,
 parts:[{
  check:{type:'ln', val:[5,-2,19], ph:'ex.: 3x + y − 2 = 0'},
  steps:[
   `${M('m_r = −[[5||−2]] = [[5||2]]')}. Como s é paralela, ${M('m_s = [[5||2]]')}.`,
   `Reta por P: ${M('y − 2 = [[5||2]](x + 3)')}`,
   `Multiplicando por 2: ${M('2y − 4 = 5x + 15')} ⇒ ${M('5x − 2y + 19 = 0')}`,
  ],
  answer:'(s) 5x − 2y + 19 = 0',
  tip:`<b>Atalho:</b> ${M('5x − 2y + k = 0')}. Com P: ${M('−15 − 4 + k = 0')} ⇒ ${M('k = 19')}. Uma linha só.`,
  fig:{view:[-8,4,-4,8], items:[
    {t:'line', a:5, b:-2, c:-1, l:'r'},
    {t:'line', a:5, b:-2, c:19, l:'s', ans:1},
    {t:'pt', x:-3, y:2, l:'P'},
  ]}
 }]},

{n:'41', tema:'paralelas', titulo:'Paralela à reta AB',
 enun:`Determinar a equação da reta que passa por ${M('P(−7, 2)')} e é paralela à reta AB dados ${M('A(−2, 3)')} e ${M('B(2, −3)')}.`,
 parts:[{
  check:{type:'ln', val:[3,2,17], ph:'ex.: 3x + y − 2 = 0'},
  steps:[
   `Aqui a reta não vem pronta. O coeficiente angular sai dos dois pontos: ${M('m_AB = [[−3 − 3||2 − (−2)]] = [[−6||4]] = −[[3||2]]')}`,
   `Reta por P com o mesmo m: ${M('y − 2 = −[[3||2]](x + 7)')}`,
   `Multiplicando por 2: ${M('2y − 4 = −3x − 21')} ⇒ ${M('3x + 2y + 17 = 0')}`,
  ],
  answer:'3x + 2y + 17 = 0',
  tip:`<b>Confira jogando P:</b> ${M('3(−7) + 2(2) + 17 = −21 + 4 + 17 = 0')}. Se der zero, a reta passa pelo ponto.`,
  fig:{view:[-10,4,-6,8], items:[
    {t:'line', a:3, b:2, c:0, l:'AB'},
    {t:'line', a:3, b:2, c:17, l:'s', ans:1},
    {t:'pt', x:-2, y:3, l:'A'}, {t:'pt', x:2, y:-3, l:'B'},
    {t:'pt', x:-7, y:2, l:'P'},
  ]}
 }]},

{n:'44', tema:'perp', titulo:'Perpendicular por um ponto',
 enun:`Dada a reta ${M('(r) 3x − 5y − 1 = 0')} e o ponto ${M('P(−3, 2)')}, determine a equação da reta s que passa por P e é perpendicular à r.`,
 parts:[{
  check:{type:'ln', val:[5,3,9], ph:'ex.: 3x + y − 2 = 0'},
  steps:[
   `${M('m_r = −[[3||−5]] = [[3||5]]')}`,
   `Perpendicular: inverte e troca o sinal. ${M('m_s = −[[5||3]]')}`,
   `Reta por P: ${M('y − 2 = −[[5||3]](x + 3)')}`,
   `Multiplicando por 3: ${M('3y − 6 = −5x − 15')} ⇒ ${M('5x + 3y + 9 = 0')}`,
  ],
  answer:'(s) 5x + 3y + 9 = 0',
  tip:`<b>Atalho:</b> de ${M('3x − 5y')} a perpendicular é ${M('5x + 3y + k = 0')} (troca os números de lugar e um sinal). Com P: ${M('−15 + 6 + k = 0')} ⇒ ${M('k = 9')}.`,
  fig:{view:[-7,5,-6,6], items:[
    {t:'line', a:3, b:-5, c:-1, l:'r'},
    {t:'line', a:5, b:3, c:9, l:'s', ans:1},
    {t:'right', l1:[3,-5,-1], l2:[5,3,9]},
    {t:'pt', x:-3, y:2, l:'P'},
  ]}
 }]},

{n:'47', tema:'perp', titulo:'Perpendicular por um ponto',
 enun:`Determinar a equação da reta que passa por ${M('P(3, −4)')} e é perpendicular à reta ${M('(s) 3x − 5y − 2 = 0')}.`,
 parts:[{
  check:{type:'ln', val:[5,3,-3], ph:'ex.: 3x + y − 2 = 0'},
  steps:[
   `${M('m_s = −[[3||−5]] = [[3||5]]')}, então a perpendicular tem ${M('m = −[[5||3]]')}.`,
   `Reta por P: ${M('y + 4 = −[[5||3]](x − 3)')}`,
   `Multiplicando por 3: ${M('3y + 12 = −5x + 15')} ⇒ ${M('5x + 3y − 3 = 0')}`,
  ],
  answer:'5x + 3y − 3 = 0',
  tip:`<b>Repare:</b> é o mesmo começo do 44, só muda o ponto. Por isso a resposta tem o mesmo ${M('5x + 3y')} e só o número final muda. Atalho: ${M('15 − 12 + k = 0')} ⇒ ${M('k = −3')}.`,
  fig:{view:[-4,8,-8,4], items:[
    {t:'line', a:3, b:-5, c:-2, l:'s'},
    {t:'line', a:5, b:3, c:-3, l:'t', ans:1},
    {t:'right', l1:[3,-5,-2], l2:[5,3,-3]},
    {t:'pt', x:3, y:-4, l:'P'},
  ]}
 }]},

{n:'51', tema:'perp', titulo:'Perpendicular à reta AB',
 enun:`Determine a equação da reta que passa por ${M('P(−4, 5)')} e é perpendicular à reta AB dados ${M('A(−1, 5)')} e ${M('B(5, 1)')}.`,
 parts:[{
  check:{type:'ln', val:[3,-2,22], ph:'ex.: 3x + y − 2 = 0'},
  steps:[
   `${M('m_AB = [[1 − 5||5 − (−1)]] = [[−4||6]] = −[[2||3]]')}`,
   `Perpendicular: ${M('m = [[3||2]]')}`,
   `Reta por P: ${M('y − 5 = [[3||2]](x + 4)')}`,
   `Multiplicando por 2: ${M('2y − 10 = 3x + 12')} ⇒ ${M('3x − 2y + 22 = 0')}`,
  ],
  answer:'3x − 2y + 22 = 0',
  tip:`<b>Erro comum:</b> usar ${M('−[[2||3]]')} direto. Esse é o m de AB; a reta pedida é perpendicular, então ainda falta inverter e trocar o sinal.`,
  fig:{view:[-9,7,-3,13], items:[
    {t:'line', a:2, b:3, c:-13, l:'AB'},
    {t:'line', a:3, b:-2, c:22, l:'s', ans:1},
    {t:'right', l1:[2,3,-13], l2:[3,-2,22]},
    {t:'pt', x:-1, y:5, l:'A'}, {t:'pt', x:5, y:1, l:'B'},
    {t:'pt', x:-4, y:5, l:'P', dx:-18},
  ]}
 }]},

{n:'52', tema:'perp', titulo:'Perpendicular por B e mediatriz',
 enun:`Resolver:`,
 parts:[
 {label:'a', enun:`Dados os pontos ${M('A(−6, −3)')} e ${M('B(2, −1)')}, determine a equação da reta perpendicular à reta AB, pelo ponto B.`,
  check:{type:'ln', val:[4,1,-7], ph:'ex.: 3x + y − 2 = 0'},
  steps:[
   `${M('m_AB = [[−1 − (−3)||2 − (−6)]] = [[2||8]] = [[1||4]]')}`,
   `Perpendicular: ${M('m = −4')}`,
   `Reta por B: ${M('y + 1 = −4(x − 2)')} ⇒ ${M('y = −4x + 7')} ⇒ ${M('4x + y − 7 = 0')}`,
  ],
  answer:'4x + y − 7 = 0',
  fig:{view:[-8,6,-8,6], items:[
    {t:'line', a:1, b:-4, c:-6, l:'AB'},
    {t:'line', a:4, b:1, c:-7, l:'s', ans:1},
    {t:'right', l1:[1,-4,-6], l2:[4,1,-7]},
    {t:'pt', x:-6, y:-3, l:'A'}, {t:'pt', x:2, y:-1, l:'B', dy:16},
  ]}},
 {label:'b', enun:`Dados os pontos ${M('A(−3, 4)')} e ${M('B(7, −2)')}, determine a equação da reta perpendicular à reta AB, pelo ponto médio de AB.`,
  check:{type:'ln', val:[5,-3,-7], ph:'ex.: 3x + y − 2 = 0'},
  steps:[
   `Primeiro o ponto médio: ${M('M = ([[−3 + 7||2]], [[4 + (−2)||2]]) = (2, 1)')}`,
   `${M('m_AB = [[−2 − 4||7 − (−3)]] = [[−6||10]] = −[[3||5]]')}`,
   `Perpendicular: ${M('m = [[5||3]]')}`,
   `Reta por M: ${M('y − 1 = [[5||3]](x − 2)')} ⇒ ${M('3y − 3 = 5x − 10')} ⇒ ${M('5x − 3y − 7 = 0')}`,
  ],
  answer:'5x − 3y − 7 = 0',
  tip:`<b>Nome dessa reta:</b> a perpendicular pelo ponto médio é a <b>mediatriz</b> de AB. Todo ponto dela fica à mesma distância de A e de B.`,
  fig:{view:[-5,9,-5,9], items:[
    {t:'line', a:3, b:5, c:-11, l:'AB'},
    {t:'line', a:5, b:-3, c:-7, l:'s', ans:1},
    {t:'right', l1:[3,5,-11], l2:[5,-3,-7]},
    {t:'pt', x:-3, y:4, l:'A'}, {t:'pt', x:7, y:-2, l:'B'},
    {t:'pt', x:2, y:1, l:'M', ans:1, res:1, dx:-20, dy:18},
  ]}},
 ]},
];

/* ---------- figura ---------- */
const SIZE = 400;
function figure(spec){
  const [x0,x1,y0,y1] = spec.view;
  const span = Math.max(x1-x0, y1-y0);
  const k = SIZE/span;
  const X = x => (x-x0)*k, Y = y => (y1-y)*k;
  const r2 = v => Math.round(v*100)/100;
  let g = '';
  const step = span > 30 ? 5 : span > 18 ? 2 : 1;
  const lab = span > 14 ? 5 : 2;
  for(let x=Math.ceil(x0); x<=x1; x++){ if(x%step===0 && x!==0) g += `<line class="gl" x1="${r2(X(x))}" y1="0" x2="${r2(X(x))}" y2="${SIZE}"/>`; }
  for(let y=Math.ceil(y0); y<=y1; y++){ if(y%step===0 && y!==0) g += `<line class="gl" x1="0" y1="${r2(Y(y))}" x2="${SIZE}" y2="${r2(Y(y))}"/>`; }
  if(x0<0 && x1>0) g += `<line class="axl" x1="${r2(X(0))}" y1="0" x2="${r2(X(0))}" y2="${SIZE}"/>`;
  if(y0<0 && y1>0) g += `<line class="axl" x1="0" y1="${r2(Y(0))}" x2="${SIZE}" y2="${r2(Y(0))}"/>`;
  const ax = Math.min(Math.max(X(0),2),SIZE-2), ay = Math.min(Math.max(Y(0),2),SIZE-2);
  for(let x=Math.ceil(x0+0.5); x<x1-0.3; x++){ if(x%lab===0 && x!==0) g += `<text class="tk" x="${r2(X(x))}" y="${r2(Math.min(ay+13,SIZE-4))}" text-anchor="middle">${String(x).replace('-','−')}</text>`; }
  for(let y=Math.ceil(y0+0.5); y<y1-0.3; y++){ if(y%lab===0 && y!==0) g += `<text class="tk" x="${r2(Math.max(ax-5,14))}" y="${r2(Y(y)+3.5)}" text-anchor="end">${String(y).replace('-','−')}</text>`; }
  if(x0<0 && x1>0 && y0<0 && y1>0) g += `<text class="tk" x="${r2(X(0)-5)}" y="${r2(Y(0)+13)}" text-anchor="end">0</text>`;

  let body = '', top = '';
  const cls = (it, base) => base + (it.ans ? ' ans' : '');
  for(const it of spec.items){
    if(it.t==='line'){
      const {a,b,c} = it, P = [];
      if(b!==0){ for(const x of [x0,x1]){ const y = -(a*x+c)/b; if(y>=y0-1e-9 && y<=y1+1e-9) P.push([x,y]); } }
      if(a!==0){ for(const y of [y0,y1]){ const x = -(b*y+c)/a; if(x>=x0-1e-9 && x<=x1+1e-9) P.push([x,y]); } }
      let best=null, d=-1;
      for(let i=0;i<P.length;i++) for(let j=i+1;j<P.length;j++){ const dd=(P[i][0]-P[j][0])**2+(P[i][1]-P[j][1])**2; if(dd>d){d=dd;best=[P[i],P[j]];} }
      if(!best) continue;
      let [p,q] = best;
      if(Y(p[1]) < Y(q[1])) [p,q] = [q,p];
      body += `<line class="${cls(it,'ln '+(it.ans?'res':'given'))}" pathLength="1" x1="${r2(X(p[0]))}" y1="${r2(Y(p[1]))}" x2="${r2(X(q[0]))}" y2="${r2(Y(q[1]))}"/>`;
      // rótulo perto da ponta de cima
      const lx = X(q[0]) + (X(p[0])-X(q[0]))*0.09, ly = Y(q[1]) + (Y(p[1])-Y(q[1]))*0.09;
      const dxp = Y(p[1])-Y(q[1]), dyp = -(X(p[0])-X(q[0])); const n = Math.hypot(dxp,dyp)||1;
      top += `<text class="${cls(it,'lbl lnl'+(it.ans?' res':''))}" x="${r2(lx+dxp/n*12)}" y="${r2(ly+dyp/n*12+5)}" text-anchor="middle">${it.l}</text>`;
    } else if(it.t==='seg'){
      const [ax1,ay1,ax2,ay2] = it.p;
      body += `<line class="${cls(it,'ln '+(it.res?'res':'given')+(it.dash?' dash':''))}" ${it.ans&&!it.dash?'pathLength="1"':''} x1="${r2(X(ax1))}" y1="${r2(Y(ay1))}" x2="${r2(X(ax2))}" y2="${r2(Y(ay2))}"/>`;
    } else if(it.t==='circle'){
      body += `<circle class="${cls(it,'circ')}" pathLength="1" cx="${r2(X(it.cx))}" cy="${r2(Y(it.cy))}" r="${r2(it.r*k)}"/>`;
    } else if(it.t==='right'){
      const [a1,b1,c1] = it.l1, [a2,b2,c2] = it.l2, det = a1*b2-a2*b1;
      const ix = (b1*c2-b2*c1)/det, iy = (a2*c1-a1*c2)/det;
      const u = [b1,a1], v = [b2,a2]; const nu = Math.hypot(...u), nv = Math.hypot(...v), s = 11;
      const U = [u[0]/nu*s,u[1]/nu*s], V = [v[0]/nv*s,v[1]/nv*s];
      const px = X(ix), py = Y(iy);
      body += `<path class="ra ans" d="M${r2(px+U[0])} ${r2(py+U[1])} L${r2(px+U[0]+V[0])} ${r2(py+U[1]+V[1])} L${r2(px+V[0])} ${r2(py+V[1])}"/>`;
    } else if(it.t==='pt'){
      const px = X(it.x), py = Y(it.y);
      top += `<g class="${it.ans?'ans':''}"><circle class="dot${it.res?' res':''}" cx="${r2(px)}" cy="${r2(py)}" r="5"/>`+
             `<text class="lbl${it.res?' res':''}" x="${r2(px+(it.dx??9))}" y="${r2(py+(it.dy??-9))}">${it.l}</text></g>`;
    }
  }
  if(spec.hideUntil) top += `<text class="placeholder" x="${SIZE/2}" y="${SIZE/2}" text-anchor="middle">A figura aparece com a resolução</text>`;
  const hasRes = spec.items.some(i=>i.t==='line'&&i.ans) || spec.items.some(i=>i.t==='seg'&&i.res) || spec.items.some(i=>i.t==='circle');
  const cap = `<figcaption>${spec.caption?`<span>${spec.caption}</span>`:''}<span class="key"><i></i>dado</span>${hasRes?'<span class="key a"><i></i>resposta</span>':''}</figcaption>`;
  return `<figure class="fig"><svg viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="Plano cartesiano do exercício">${g}${body}${top}</svg>${cap}</figure>`;
}

/* ---------- conferir respostas ---------- */
function norm(s){ return s.replace(/[−–—]/g,'-').replace(/\s+/g,''); }
function parseLine(str){
  let s = norm(str.toLowerCase()).replace(/[·×*]/g,'').replace(/,/g,'.');
  if(/[()]/.test(s)) return 'paren';
  const sides = s.split('=');
  if(sides.length>2) return null;
  if(sides.length===1) sides.push('0');
  const co = [0,0,0];
  for(let i=0;i<2;i++){
    const side = sides[i]; if(!side) return null;
    const terms = side.match(/[+-]?[^+-]+/g);
    if(!terms || terms.join('')!==side) return null;
    for(const t of terms){
      const m = t.match(/^([+-]?)(\d+(?:\.\d+)?)?(?:\/(\d+(?:\.\d+)?))?([xy])?$/);
      if(!m || (!m[2] && !m[4])) return null;
      const val = (m[1]==='-'?-1:1) * (m[2]?parseFloat(m[2]):1) / (m[3]?parseFloat(m[3]):1) * (i?-1:1);
      co[m[4]==='x'?0:m[4]==='y'?1:2] += val;
    }
  }
  if(Math.abs(co[0])<1e-12 && Math.abs(co[1])<1e-12) return null;
  return co;
}
function sameLine(u,v){
  const sc = Math.max(...u.map(Math.abs),...v.map(Math.abs));
  const e = 1e-7*sc*sc;
  return Math.abs(u[0]*v[1]-u[1]*v[0])<e && Math.abs(u[0]*v[2]-u[2]*v[0])<e && Math.abs(u[1]*v[2]-u[2]*v[1])<e;
}
function parsePt(str){
  const nums = norm(str).match(/-?\d+(?:\.\d+)?(?:\/\d+)?/g);
  if(!nums || nums.length!==2) return null;
  return nums.map(n => n.includes('/') ? n.split('/').reduce((a,b)=>parseFloat(a)/parseFloat(b)) : parseFloat(n));
}

/* ---------- estado salvo ---------- */
const KEY = 'cd-matematica-3tri-lista-extra';
let state = {};
try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e) { state = {}; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} };

/* ---------- render ---------- */
const main = document.getElementById('main');
const nav = document.getElementById('jump');
let navHTML = '';
for(const tema of TEMAS){
  const list = EX.filter(e=>e.tema===tema.id);
  navHTML += `<div class="grp"><span>${tema.nome}</span>${list.map(e=>`<a class="lx-pill" id="pill-${e.n}" href="#ex-${e.n}">${e.n}</a>`).join('')}</div>`;
  let html = `<section class="tema" id="${tema.id}" aria-labelledby="h-${tema.id}"><div class="tema-head"><h2 id="h-${tema.id}">${tema.nome}</h2>`+
    `<div class="cola">${tema.cola.map(([t,f])=>`<div><small>${t}</small>${/^[a-zà-ú ]+$/i.test(f)?`<span>${f}</span>`:M(f)}</div>`).join('')}</div>`+
    `<p class="lx-tip" style="margin:0">${tema.extra.replace(/(ax \+ by \+ c = 0|ax \+ by \+ k = 0)/g, x=>M(x))}</p></div>`;
  for(const ex of list){
    html += `<article class="ex" id="ex-${ex.n}"><div class="ex-head"><span class="lx-num">${ex.n}</span><h3>${ex.titulo}</h3>`+
      `<label class="done-toggle"><input type="checkbox" id="done-${ex.n}" ${state[ex.n]?'checked':''}> Feito</label></div>`+
      `<p class="enun">${ex.enun}</p>`;
    ex.parts.forEach((p,pi)=>{
      const id = `${ex.n}-${pi}`;
      html += `<div class="part" id="part-${id}"><div class="part-text">`+
        (p.label?`<p class="penun"><span class="plabel">${p.label})</span>${p.enun}</p>`:'')+
        `<form class="check" data-id="${id}" novalidate><label for="in-${id}">Tente primeiro: sua resposta</label>`+
        `<div class="row"><input id="in-${id}" autocomplete="off" spellcheck="false" placeholder="${p.check.ph}"><button type="submit">Conferir</button></div>`+
        `<p class="fb" id="fb-${id}" aria-live="polite"></p></form>`+
        `<ol class="steps" id="steps-${id}"></ol>`+
        `<div class="answer" id="ans-${id}" hidden><small>Resposta</small>${M(p.answer)}<em>bate com o gabarito</em></div>`+
        (p.tip?`<p class="lx-tip" id="tip-${id}" hidden>${p.tip}</p>`:'')+
        `<div class="controls"><button type="button" class="primary" data-act="next" data-id="${id}">Ver 1º passo</button>`+
        `<button type="button" data-act="all" data-id="${id}">Ver resolução inteira</button></div>`+
        `</div>${figure(p.fig)}</div>`;
    });
    html += `</article>`;
  }
  html += `</section>`;
  main.insertAdjacentHTML('beforeend', html);
}
nav.innerHTML = navHTML + `<div class="count" aria-live="polite"><b id="cnt">0</b> de ${EX.length} feitos<span class="lx-bar"><i id="barfill"></i></span></div>`;

const partOf = id => { const [n,pi] = id.split('-'); return EX.find(e=>e.n===n).parts[+pi]; };
const shown = {};
function renderSteps(id){
  const p = partOf(id), k = shown[id]||0, ol = document.getElementById('steps-'+id);
  while(ol.children.length < k){ const li = document.createElement('li'); li.innerHTML = `<div>${p.steps[ol.children.length]}</div>`; ol.appendChild(li); }
  while(ol.children.length > k) ol.lastChild.remove();
  const done = k >= p.steps.length;
  document.getElementById('part-'+id).classList.toggle('solved', done);
  document.getElementById('ans-'+id).hidden = !done;
  const tip = document.getElementById('tip-'+id); if(tip) tip.hidden = !done;
  const next = document.querySelector(`[data-act="next"][data-id="${id}"]`);
  const all = document.querySelector(`[data-act="all"][data-id="${id}"]`);
  if(done){ next.textContent = 'Esconder resolução'; next.classList.remove('primary'); all.hidden = true; }
  else { next.textContent = k===0 ? 'Ver 1º passo' : `Próximo passo (${k+1} de ${p.steps.length})`; next.classList.add('primary'); all.hidden = false; }
}
function updateProgress(){
  let c = 0;
  for(const e of EX){ const d = !!state[e.n]; if(d) c++; document.getElementById('pill-'+e.n).classList.toggle('done', d); document.getElementById('done-'+e.n).checked = d; }
  document.getElementById('cnt').textContent = c;
  document.getElementById('barfill').style.width = (c/EX.length*100)+'%';
}
document.addEventListener('click', ev => {
  const b = ev.target.closest('button[data-act]'); if(!b) return;
  const id = b.dataset.id, p = partOf(id), k = shown[id]||0;
  if(b.dataset.act==='all') shown[id] = p.steps.length;
  else shown[id] = k >= p.steps.length ? 0 : k+1;
  renderSteps(id);
});
const correct = {};
document.addEventListener('submit', ev => {
  const f = ev.target.closest('form.check'); if(!f) return;
  ev.preventDefault();
  const id = f.dataset.id, p = partOf(id), fb = document.getElementById('fb-'+id);
  const raw = document.getElementById('in-'+id).value.trim();
  fb.className = 'fb';
  if(!raw){ fb.textContent = 'Escreva sua resposta antes de conferir.'; return; }
  let ok = false;
  if(p.check.type==='pt'){
    const v = parsePt(raw);
    if(!v){ fb.textContent = 'Escreva o ponto com duas coordenadas, assim: (−4, 9).'; return; }
    ok = Math.abs(v[0]-p.check.val[0])<1e-9 && Math.abs(v[1]-p.check.val[1])<1e-9;
    fb.textContent = ok ? 'Certo. Bate com o gabarito.' : 'Ainda não. Refaça a conta coordenada por coordenada, com cuidado nos sinais.';
  } else {
    const v = parseLine(raw);
    if(v==='paren'){ fb.textContent = 'Tire os parênteses primeiro (faça a distributiva) e escreva como ax + by + c = 0.'; return; }
    if(!v){ fb.textContent = 'Não entendi. Escreva como ax + by + c = 0 ou y = mx + q.'; return; }
    ok = sameLine(v, p.check.val);
    if(ok) fb.textContent = 'Certo. É a mesma reta do gabarito (pode estar multiplicada por algum número, tudo bem).';
    else {
      const parallel = Math.abs(v[0]*p.check.val[1]-v[1]*p.check.val[0]) < 1e-7*Math.max(...v.map(Math.abs),...p.check.val.map(Math.abs))**2;
      fb.textContent = parallel ? 'Quase. A inclinação está certa, mas a reta não passa pelo ponto. Confira o termo independente.'
                                : 'Ainda não. A inclinação não bate: confira o coeficiente angular (e se era para inverter e trocar o sinal).';
    }
  }
  fb.classList.add(ok?'ok':'bad');
  correct[id] = ok;
  const n = id.split('-')[0], ex = EX.find(e=>e.n===n);
  if(ok && ex.parts.every((_,i)=>correct[`${n}-${i}`])){ state[n] = true; save(); updateProgress(); }
});
document.addEventListener('change', ev => {
  const t = ev.target; if(!t.id || !t.id.startsWith('done-')) return;
  state[t.id.slice(5)] = t.checked; save(); updateProgress();
});
for(const e of EX) e.parts.forEach((_,i)=>renderSteps(`${e.n}-${i}`));
updateProgress();
