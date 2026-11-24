# Encaixa os capítulos 4 a 6 (caps-4-6.html) e as questões 39 a 50 em sociologia-3tri.html.
# Uso (na raiz): python ferramentas/sociologia/inserir-caps.py   (roda uma vez; recusa se já tiver o Cap. 4)
import json, os

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAG = os.path.join(RAIZ, 'sociologia-3tri.html')
s = open(PAG, encoding='utf-8', newline='').read()
crlf = '\r\n' in s
s = s.replace('\r\n', '\n')
if 'id="espetaculo"' in s:
    raise SystemExit('A página já tem o Cap. 4.')

caps = open(os.path.join(os.path.dirname(__file__), 'caps-4-6.html'), encoding='utf-8').read()

Q = [
    ('cap4', 'Uma bolsa de grife custa vinte vezes mais que uma bolsa comum, mas carrega as mesmas coisas. Mesmo assim, muita gente faz de tudo para comprá-la.',
     'Na leitura que Debord faz de Marx, esse comportamento é um exemplo de',
     ['valor de uso, pois a bolsa é escolhida apenas pela sua utilidade prática.',
      'relativismo cultural, pois cada pessoa julga a bolsa pelos próprios valores.',
      'fetichização da mercadoria, pois o produto vale pela imagem e pelo status, e não pela utilidade.',
      'tabu do incesto, pois a escolha cria alianças entre famílias diferentes.',
      'relação direta, pois a compra depende apenas da experiência do próprio indivíduo.'], 'c',
     'Fetichização da mercadoria: valor adicionado ao produto pela idealização, imagem e status social. Debord critica a sobreposição do status sobre a utilidade.'),
    ('cap4', 'Ao rolar o feed, um estudante vê um influencer muito rico exibindo viagens, roupas e uma vida sem problemas, e fica frustrado com a própria rotina.',
     'Segundo Debord, essa situação mostra que',
     ['as redes sociais mostram a realidade como ela é, sem nenhuma idealização.',
      'a frustração vem só de problemas pessoais, sem relação com a mídia e o mercado.',
      'o espetáculo acabou com o consumo, pois as pessoas só olham e não compram.',
      'a relação com o influencer é direta, sem mediação da mídia ou do mercado.',
      'mídia e mercado criam um mundo fictício idealizado que, confundido com o real, gera frustração, consumo e conformidade.'], 'e',
     'O espetáculo cria um "mundo fictício" idealizado; as pessoas o confundem com a realidade, se frustram, e isso promove consumo desenfreado e conformidade social.'),
    ('cap4', 'Debord usa as ideias de Bakunin para analisar os dois grandes sistemas do século XX.',
     'Para ele, a partir de Bakunin,',
     ['capitalismo e socialismo usam as imagens e o consumo para controlar a população, e a saída seria a autonomia total do anarquismo.',
      'só o capitalismo usa imagens; o socialismo libertaria a população do espetáculo.',
      'só o socialismo usa imagens; o capitalismo é a solução por garantir a liberdade de escolha.',
      'o Estado forte é a única forma de proteger as pessoas do espetáculo.',
      'as imagens não têm nenhuma relação com o poder político ou econômico.'], 'a',
     'Capitalismo exalta as "maravilhas" do mercado; socialismo, as do controle estatal. Os dois usam imagens como controle; Bakunin aponta a liberdade total do anarquismo.'),
    ('cap4', 'Para Debord, as relações humanas continuam diretas: a mídia e o mercado apenas registram as experiências, sem interferir nelas.',
     None, None, 'b',
     'É o contrário: as relações deixam de ser diretas e passam a ser mediadas pela mídia e pelo mercado (ex.: a viagem influenciada pelas fotos dos outros).'),
    ('cap5', 'Diante do mesmo sangue, o humano vê morte e algo ruim; a onça vê alimento e algo bom.',
     'Pelo perspectivismo ameríndio, isso acontece porque',
     ['a onça é inferior ao humano e não tem cultura.',
      'humanos e onças vivem em culturas diferentes, sem nada em comum.',
      'a onça age só por instinto, enquanto o humano age pela razão.',
      'corpos diferentes produzem perspectivas diferentes sobre o mesmo mundo.',
      'o sangue tem um significado único e verdadeiro, que só o humano conhece.'], 'd',
     'Só existe uma cultura entre todos os seres; o que muda é a natureza (o corpo). Corpos diferentes = perspectivas diferentes.'),
    ('cap5', 'O Ocidente costuma falar em "uma natureza e muitas culturas". O pensamento ameríndio inverte essa ideia.',
     'O multinaturalismo ameríndio afirma que existe',
     ['uma única natureza e várias culturas, cada uma superior em algo.',
      'uma única cultura, comum a todos os seres, e várias naturezas, expressas por corpos diferentes.',
      'uma cultura superior, a humana, e naturezas inferiores, a dos animais.',
      'nenhuma cultura entre os animais, só entre os humanos.',
      'uma natureza fixa, que a cultura europeia deve dominar e explorar.'], 'b',
     'Multinaturalismo: múltiplas naturezas expressas por diferentes corpos e mundos, e uma só cultura entre animais, humanos e espíritos.'),
    ('cap5', 'No primeiro contato, os indígenas viviam nus, sem escrita e sem acúmulo material, contrariando os padrões europeus.',
     'A conclusão dos europeus foi que os indígenas',
     ['tinham uma cultura igual à europeia, só com outra língua.',
      'eram superiores, por viverem de modo complementar à natureza.',
      'estavam mais próximos do corpo e da matéria, "sem alma" e "não humanos", o que serviu para justificar a escravidão.',
      'deviam ser compreendidos pelo relativismo cultural, sem julgamento.',
      'eram mediadores entre os mundos, como os xamãs.'], 'c',
     'Pelo dualismo corpo × alma, os europeus viram os indígenas como próximos do corpo imperfeito, "sem alma" = "não humanos", justificando a escravidão.'),
    ('cap5', 'Para os povos ameríndios, ninguém nasce "pessoa" completamente: a pessoa se constrói pelas relações e pelas experiências do corpo.',
     None, None, 'a',
     'É a noção de corporalidade: a condição de pessoa depende do corpo e das relações que ele estabelece, ao contrário do Ocidente, que a define pelo interior (alma, razão).'),
    ('cap6', 'Para Jean-William Lapierre, a essência do poder político está na relação de comando e obediência, no poder coercitivo e no uso legítimo da violência.',
     'Por essa concepção tradicional, as sociedades indígenas seriam',
     ['contrárias ao Estado, recusando formas de poder separado e autoritário.',
      'a forma mais desenvolvida de organização política.',
      'iguais ao Estado ocidental, só que com outros nomes.',
      'exemplos de poder não coercitivo, tão válido quanto o coercitivo.',
      'sociedades "sem poder" ou "pré-políticas", que falharam em chegar ao Estado, visto como destino final.'], 'e',
     'Lapierre toma o Estado ocidental como norma e destino final; sem coerção, as sociedades indígenas seriam "sem poder" e "pré-políticas". É isso que Clastres critica.'),
    ('cap6', 'Pierre Clastres propõe uma "revolução copernicana" na antropologia política.',
     'Uma das ideias centrais dessa revolução é que',
     ['só existe poder político onde há polícia, governo e leis escritas.',
      'o poder político é universal e pode ser coercitivo ou não coercitivo; o coercitivo é só um dos jeitos.',
      'as sociedades indígenas são "fetos culturais" a caminho do Estado.',
      'o poder coercitivo é o único verdadeiro e deve ser levado a todos os povos.',
      'os povos indígenas não têm nenhuma forma de organização política.'], 'b',
     'Para Clastres, o poder é universal, aparece de dois jeitos (coercitivo e não coercitivo) e o coercitivo não é o "verdadeiro". "Fetos culturais" é o vocabulário que ele denuncia.'),
    ('cap6', 'Em muitas sociedades ameríndias, o chefe (mburuvicha) tem um papel muito diferente do de um governante ocidental.',
     'Os deveres desse chefe são',
     ['dar ordens, cobrar impostos e punir quem desobedece.',
      'comandar a polícia e escrever as leis do grupo.',
      'acumular riquezas para mostrar o seu poder sobre os demais.',
      'apaziguar conflitos pela persuasão e pelo prestígio, doar bens ao grupo e falar diariamente com ele.',
      'decidir sozinho sobre a guerra e a paz, sem ouvir a comunidade.'], 'd',
     'O chefe não tem poder de dar ordens: apazigua pela persuasão e pelo prestígio, é generoso e tem o dever da palavra. Se tenta impor ordens fora da guerra, é abandonado ou eliminado.'),
    ('cap6', 'Para Clastres, as sociedades indígenas são "sem Estado" porque ainda não se desenvolveram o suficiente para chegar a ele.',
     None, None, 'b',
     'Para Clastres, elas não são "sem Estado" por atraso: são contrárias ao Estado, recusam formas de poder separado e autoritário.'),
]

cards, ans, exp = [], [], []
for i, (cap, fonte, enun, alts, certa, ex) in enumerate(Q, start=39):
    q = f'q{i}'
    if alts is None:
        enun = 'Verdadeiro ou falso?'
        alts = ['Verdadeiro', 'Falso']
    botoes = '\n'.join(f'      <button class="option-btn" onclick="checkQuiz(\'{q}\',\'{l}\')">{l}) {t}</button>' for l, t in zip('abcde', alts))
    cards.append(f'''  <!-- Q{i} -->
  <div class="question-card" data-chapter="{cap}" id="{q}">
    <p class="q-fonte">{fonte}</p>
    <h4>{i}. {enun}</h4>
    <div class="options">
{botoes}
    </div>
  </div>
''')
    ans.append(f"{q}:'{certa}'")
    exp.append(f'  {q}: {json.dumps(ex, ensure_ascii=False)}')

def troca(a, b, n=1):
    global s
    if s.count(a) < n:
        raise SystemExit('Não achei: ' + a[:70])
    s = s.replace(a, b)

N = 38 + len(Q)
troca('<!-- ══════════════════════════════════════════════\n     QUIZ', caps + '<!-- ══════════════════════════════════════════════\n     QUIZ')
troca('  <!-- Result -->', '\n'.join(cards) + '\n  <!-- Result -->')
troca("q38:'b'};", "q38:'b', " + ', '.join(ans) + '};')
troca('  q38: "A cultura pop pode reforçar ou contestar valores, padrões e identidades; por isso tem impacto político."\n};',
      '  q38: "A cultura pop pode reforçar ou contestar valores, padrões e identidades; por isso tem impacto político.",\n' + ',\n'.join(exp) + '\n};')
troca('    <a href="#industria-cultural">Indústria Cultural</a>\n',
      '    <a href="#industria-cultural">Indústria Cultural</a>\n    <a href="#espetaculo">Sociedade do Espetáculo</a>\n    <a href="#perspectivismo">Perspectivismo Ameríndio</a>\n    <a href="#sociedade-estado">Sociedade × Estado</a>\n')
troca('<span class="badge">História da Antropologia · Cultura Popular, Erudita e Contracultura · Indústria Cultural</span>',
      '<span class="badge">Antropologia · Culturas e Contracultura · Indústria Cultural · Espetáculo · Perspectivismo Ameríndio · Sociedade × Estado</span>')
troca('  Escola de Frankfurt e Indústria Cultural de Adorno e Horkheimer · Walter Benjamin e a aura · cultura de massa e cultura pop.\n',
      '  Escola de Frankfurt e Indústria Cultural de Adorno e Horkheimer · Walter Benjamin e a aura · cultura de massa e cultura pop ·\n'
      '  Sociedade do Espetáculo de Guy Debord (Marx, Freud e Bakunin) · perspectivismo ameríndio, multinaturalismo e corpo ·\n'
      '  Sociedade × Estado: Lapierre, Pierre Clastres e o chefe ameríndio.\n')
troca('<title>Sociologia 3º Tri — Antropologia, Cultura e Indústria Cultural 2026</title>',
      '<title>Sociologia 3º Tri — Antropologia, Cultura, Espetáculo e Sociedade contra o Estado 2026</title>')
troca('<p>38 questões (múltipla escolha e verdadeiro ou falso) sobre história da antropologia, cultura popular e erudita, contracultura e Indústria Cultural.</p>',
      f'<p>{N} questões (múltipla escolha e verdadeiro ou falso) sobre história da antropologia, cultura popular e erudita, contracultura, Indústria Cultural, Sociedade do Espetáculo, perspectivismo ameríndio e Sociedade × Estado.</p>')
troca('Placar: <strong>0 / 38</strong>', f'Placar: <strong>0 / {N}</strong>')
troca('<span class="donut-label">/ 38</span>', f'<span class="donut-label">/ {N}</span>')
troca('''    <button class="filter-btn" onclick="filterQuiz('cap3',this)">Cap. 3 — Indústria Cultural</button>\n''',
      '''    <button class="filter-btn" onclick="filterQuiz('cap3',this)">Cap. 3 — Indústria Cultural</button>
    <button class="filter-btn" onclick="filterQuiz('cap4',this)">Cap. 4 — Espetáculo</button>
    <button class="filter-btn" onclick="filterQuiz('cap5',this)">Cap. 5 — Perspectivismo</button>
    <button class="filter-btn" onclick="filterQuiz('cap6',this)">Cap. 6 — Sociedade × Estado</button>\n''')
troca('contracultura ou Indústria Cultural!</div>', 'contracultura, Indústria Cultural, Sociedade do Espetáculo, perspectivismo ameríndio ou Clastres!</div>')

if crlf:
    s = s.replace('\n', '\r\n')
open(PAG, 'w', encoding='utf-8', newline='').write(s)
print(f'ok: caps 4-6 e {len(Q)} questões ({N} no total)')
