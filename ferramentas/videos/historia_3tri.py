"""
historia_3tri.py — Roteiros dos vídeos de História do 3º trimestre.

    python ferramentas/videos/historia_3tri.py            # todos
    python ferramentas/videos/historia_3tri.py italia     # só um
    python ferramentas/videos/historia_3tri.py --capas    # só os pôsteres

Saída: hist-videos/*.mp4 (com narração, ver narracao.py) e hist-videos/*.jpg (pôster).
Precisa de pycairo, shapely, pillow, piper-tts e ffmpeg. Os mapas históricos vêm do projeto
aourednik/historical-basemaps e o relevo/rios do Natural Earth.
"""

import math
import subprocess
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from motor import *  # noqa: E402,F401,F403
from motor import geo, feicao, poligono, unary_union, box  # noqa: E402

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SAIDA = os.path.join(RAIZ, 'hist-videos')
IMGS = os.path.join(RAIZ, 'hist-imgs')


def img(nome):
    return os.path.join(IMGS, nome + '.jpg')

# Cores de destaque (com transparência para o mapa aparecer por baixo)
C_FRANCA = hexcor('#2f5d9e', 0.55)
C_LIBERAL = hexcor('#c9953c', 0.60)
C_REVOLTA = hexcor('#b8322a', 0.50)
C_REPRIME = hexcor('#6b6b6b', 0.45)
C_AUSTRIA = hexcor('#d9b44a', 0.55)
C_PRUSSIA = hexcor('#3b4a6b', 0.60)
C_RUSSIA = hexcor('#7a8f6a', 0.45)
C_PIEMONTE = hexcor('#2e7d4f', 0.62)
C_PAPA = hexcor('#e3c86a', 0.65)
C_SICILIAS = hexcor('#c26b3a', 0.55)
C_DUCADOS = hexcor('#8b6bb0', 0.50)
C_UNIAO = hexcor('#2f5d9e', 0.60)
C_CONFED = hexcor('#a3352b', 0.60)
C_FRONT = hexcor('#c9953c', 0.60)


def austria_1815():
    """Império Austríaco com o Reino Lombardo-Vêneto (a base separa os dois e
    deixa um resto dos Países Baixos austríacos, que em 1815 já não existiam)."""
    a = feicao('world_1815', 'Austrian Empire', 'Lombardy', 'Venetia')
    return a.difference(BELGICA_1815)


def paises_baixos_1815():
    """Reino Unido dos Países Baixos (Holanda + Bélgica)."""
    return unary_union([feicao('world_1815', '       '), feicao('world_1815', 'Austrian Empire').intersection(BELGICA_1815)])


BELGICA_1815 = box(-10, 40, 7.5, 60)


def cidade(nome):
    return CIDADES[nome]


CIDADES = {
    'Paris': (2.35, 48.86), 'Bruxelas': (4.35, 50.85), 'Varsóvia': (21.01, 52.23), 'Modena': (10.93, 44.65),
    'Bolonha': (11.34, 44.49), 'Palermo': (13.36, 38.12), 'Viena': (16.37, 48.21), 'Berlim': (13.40, 52.52),
    'Milão': (9.19, 45.46), 'Veneza': (12.33, 45.44), 'Budapeste': (19.04, 47.50), 'Praga': (14.42, 50.08),
    'Frankfurt': (8.68, 50.11), 'Roma': (12.50, 41.90), 'Nápoles': (14.27, 40.85), 'Londres': (-0.13, 51.51),
    'Waterloo': (4.40, 50.68), 'Turim': (7.69, 45.07), 'Gênova': (8.93, 44.41), 'Florença': (11.26, 43.77),
    'Marsala': (12.44, 37.80), 'Messina': (15.55, 38.19), 'Teano': (14.07, 41.25), 'Magenta': (8.88, 45.46),
    'Solferino': (10.57, 45.37), 'Sedan': (4.94, 49.70), 'Versalhes': (2.13, 48.80), 'Sadowa': (15.67, 50.37),
    'Ems': (7.71, 50.33), 'Copenhague': (12.57, 55.68), 'Munique': (11.58, 48.14), 'Estrasburgo': (7.75, 48.58),
    'Metz': (6.18, 49.12), 'Nice': (7.27, 43.70), 'Chambéry': (5.92, 45.57), 'Calatafimi': (12.86, 37.92),
    'Custoza': (10.80, 45.38), 'Novara': (8.62, 45.45), 'Aspromonte': (15.92, 38.17), 'Montmartre': (2.34, 48.89),
    'Reggio': (15.65, 38.11), 'Mentana': (12.64, 42.03),
}


# ═══════════════════════════════════════════════════════════
#  1. Revoluções de 1830 e 1848
# ═══════════════════════════════════════════════════════════

def video_revolucoes():
    proj = Projecao((11, 47), 26)
    caixa = proj.caixa()
    pol = [g for _, g in geo('world_1815') if g.intersects(caixa)]
    reg = {
        'franca': feicao('world_1815', 'France'),
        'austria': austria_1815(),
        'prussia': feicao('world_1815', 'Prussia'),
        'russia': feicao('world_1815', 'Russian Empire'),
        'paises_baixos': paises_baixos_1815(),
        'italia': feicao('world_1815', 'Kingdom of Sardinia', 'Lombardy', 'Venetia', 'Parma', 'Modena', 'Tuscany',
                         'Lucca', 'Papal States', 'Kingdom of the Two Sicilies', 'Massa', 'Fivizzano', 'Pontremoli'),
        'alemanha': feicao('world_1815', 'Bavaria', 'Württemberg', 'Baden', 'Saxony', 'Hanover', 'Electoral Hesse',
                           'Grand Duchy of Hesse', 'Nassau', 'Thuringia', 'Palatinate', 'Mecklenburg-Schwerin',
                           'Mecklenburg-Strelitz', 'Oldenburg', 'Brunswick', 'Anhalt', 'Lippe-Detmold', 'Waldeck',
                           'Hohenzollern', 'Holstein', 'Hamburg', 'Bremen', 'Lübeck', 'Schaumburg-Lippe', 'Wetzlar'),
    }
    m = Mapa(proj, pol, reg)
    nome = 'Revoluções de 1830 e 1848'
    restaurados = {'franca': C_FRANCA, 'austria': C_AUSTRIA, 'prussia': C_PRUSSIA, 'russia': C_RUSSIA}
    leg_viena = [(C_FRANCA, 'França (Bourbons restaurados)'), (C_AUSTRIA, 'Império Austríaco'),
                 (C_PRUSSIA, 'Prússia'), (C_RUSSIA, 'Império Russo')]

    p1848 = [('Palermo', 'jan'), ('Paris', 'fev'), ('Viena', 'mar'), ('Milão', 'mar'), ('Veneza', 'mar'),
             ('Berlim', 'mar'), ('Budapeste', 'mar'), ('Frankfurt', 'mai'), ('Praga', 'jun'), ('Roma', 'nov')]
    lados = {'Palermo': 'd', 'Paris': 'e', 'Viena': 'b', 'Milão': 'e', 'Veneza': 'd', 'Berlim': 'd',
             'Budapeste': 'd', 'Frankfurt': 'e', 'Praga': 'a', 'Roma': 'd'}

    def marcadores_1848(atraso=0.6, cor=RED, tipo='pulso'):
        return [Marcador(*cidade(c), c, em=atraso * i, cor=cor, tipo=tipo, lado=lados[c], sub=mes + '/1848')
                for i, (c, mes) in enumerate(p1848)]

    cenas = [
        cartao_titulo('As Revoluções de 1830 e 1848', 'Da Restauração à Primavera dos Povos',
                      extra='Livro: Cap. 34, p. 472–476'),
        Cena(m, restaurados, ('Ponto de partida', 'Napoleão cai em **Waterloo (1815)**. No **Congresso de Viena**, as potências '
             'vencedoras restauram as monarquias (**legitimidade**) e buscam o **equilíbrio de poder**. Ideias liberais e '
             'nacionalistas passam a ser reprimidas.'), ano='1815', legenda_mapa=leg_viena,
             itens=[Marcador(*cidade('Waterloo'), 'Waterloo', tipo='batalha', em=0.8, lado='a'),
                    Marcador(*cidade('Viena'), 'Congresso de Viena', tipo='capital', em=1.6, cor=NAVY)]),
        Cena(m, {'franca': C_FRANCA}, ('França restaurada · Luís XVIII (1814–1824)', 'Os **Bourbons** voltam ao trono. '
             'A **Carta de 1814** mantém alguns direitos civis da Revolução, mas preserva privilégios aristocráticos e o poder do rei. '
             'Liberais querem mais participação; **ultrarrealistas** querem a volta do absolutismo.'), ano='1814',
             itens=[Marcador(*cidade('Paris'), 'Paris', tipo='capital', cor=NAVY, lado='e')]),
        Cena(m, {'franca': hexcor('#1f3d6b', 0.7)}, ('Carlos X (1824–1830) endurece o regime', 'Perfil **absolutista**: '
             'reforça privilégios da aristocracia e censura a imprensa. As **Ordenações de Julho (1830)** dissolvem a Câmara, '
             'restringem ainda mais o voto e censuram a imprensa. É o estopim.'), ano='1830',
             itens=[Marcador(*cidade('Paris'), 'Paris', tipo='capital', cor=NAVY, lado='e')]),
        Cena(m, {'franca': C_REVOLTA}, ('Revolução de Julho · os "Três Dias Gloriosos"', '**Barricadas** em Paris unem '
             '**operários, estudantes e burguesia**. Carlos X abdica e foge; a Câmara entrega a coroa a **Luís Filipe de Orléans**. '
             'É a cena do quadro "A Liberdade guiando o povo", de Delacroix.'), ano='1830',
             itens=[Marcador(*cidade('Paris'), 'Paris', lado='e', sub='barricadas, 27 a 29 de julho')]),
        cena_obra(img('delacroix'), 'A Liberdade guiando o povo · Eugène Delacroix, 1830 · Museu do Louvre',
                  ('A Liberdade guiando o povo', 'Marianne, alegoria da **República e da Liberdade**, ergue a tricolor '
                   'sobre a barricada à frente de **burgueses, operários e estudantes**: os "Três Dias Gloriosos" de 1830.')),
        Cena(m, {'franca': C_LIBERAL, 'paises_baixos': C_REVOLTA, 'russia': C_RUSSIA, 'italia': hexcor('#b8322a', 0.25)},
             ('O exemplo francês se espalha', 'A **Bélgica** se separa dos Países Baixos e vira monarquia liberal. '
              '**Poloneses** se levantam contra o domínio russo e **italianos** contra a Áustria, mas são esmagados (1831).'),
             ano='1830–31', itens=[Seta([cidade('Paris'), (3.4, 50.2), cidade('Bruxelas')], em=0.4, dur=1.0),
                                   Seta([cidade('Paris'), (12, 52.5), cidade('Varsóvia')], em=1.0, dur=1.6),
                                   Seta([cidade('Paris'), (7, 46.5), cidade('Modena')], em=1.6, dur=1.3),
                                   Marcador(*cidade('Bruxelas'), 'Bruxelas', em=1.4, lado='a', sub='independência belga'),
                                   Marcador(*cidade('Varsóvia'), 'Varsóvia', em=2.6, lado='a', sub='revolta esmagada'),
                                   Marcador(*cidade('Modena'), 'Modena e Bolonha', em=2.9, lado='d', sub='revoltas reprimidas')]),
        Cena(m, {'franca': C_LIBERAL}, ('Monarquia de Julho (1830–1848)', '**Luís Filipe**, o "rei burguês" ou "rei dos franceses", '
             'governa para a alta burguesia: bancos e indústria crescem, mas o **voto censitário** deixa só cerca de **1% da população** '
             'votar. Republicanos, socialistas e legitimistas atacam o "reino dos ricos".'), ano='1830–48',
             legenda_mapa=[(C_LIBERAL, 'Monarquia constitucional liberal')],
             itens=[Marcador(*cidade('Paris'), 'Paris', tipo='capital', cor=NAVY, lado='e'),
                    retrato(img('luisfilipe'), 'Luís Filipe I', em=0.8)]),
        Cena(m, {'franca': C_REVOLTA}, ('Fevereiro de 1848 · causas', '**Crise econômica** (más colheitas, carestia, desemprego) + '
             '**exclusão política** + choque entre o mundo agrário do Antigo Regime e o **capitalismo industrial** com seu proletariado. '
             'A proibição dos **banquetes republicanos** leva às barricadas: Luís Filipe abdica e nasce a **2ª República**.'),
             ano='1848', itens=[Marcador(*cidade('Paris'), 'Paris', lado='e', sub='22 a 24 de fevereiro')]),
        cena_obra(img('lamartine'), 'Lamartine recusa a bandeira vermelha (25/fev/1848) · Félix Philippoteaux',
                  ('Liberais × operários já em fevereiro', 'O poeta **Lamartine**, do governo provisório da 2ª República, '
                   'recusa a **bandeira vermelha** dos socialistas e mantém a tricolor. A disputa pelos rumos da revolução '
                   'já começava.')),
        Cena(m, {'franca': C_REVOLTA}, ('2ª República: conquistas e limites', 'O governo provisório adota o **sufrágio '
             'universal masculino**, **abole a escravidão nas colônias francesas** (abril de 1848) e cria as **Oficinas '
             'Nacionais**, inspiradas no socialista **Louis Blanc**, para garantir o "direito ao trabalho". Mas o voto do '
             'campo elege uma Assembleia conservadora, que fecha as Oficinas em junho.'), ano='1848',
             itens=[Marcador(*cidade('Paris'), 'Paris', tipo='capital', cor=NAVY, lado='e')]),
        Cena(m, {'franca': C_REVOLTA, 'austria': hexcor('#b8322a', 0.30), 'alemanha': hexcor('#b8322a', 0.30),
                 'prussia': hexcor('#b8322a', 0.25), 'italia': hexcor('#b8322a', 0.30)},
             ('A Primavera dos Povos', 'Revoltas quase simultâneas pedem **constituições** (liberalismo), **unificação ou '
              'independência nacional** (nacionalismo) e direitos para os trabalhadores. Metternich foge de Viena; '
              '**Frankfurt** reúne um parlamento para unificar a Alemanha.'), ano='1848',
             dur=13, itens=marcadores_1848()),
        Cena(m, {'austria': hexcor('#b8322a', 0.45), 'russia': C_RUSSIA}, ('1848 no Império Austríaco', 'Em Viena, '
             '**Metternich** cai e foge. Os **húngaros** de **Lajos Kossuth** chegam a proclamar a independência (1849), '
             'esmagada com a ajuda do **exército russo**. Em Praga, o Congresso Pan-eslavo é dissolvido a tiros. O que '
             'fica: o **fim da servidão camponesa** no Império.'), ano='1848–49',
             itens=[Marcador(*cidade('Viena'), 'Viena', lado='b', em=0.3, sub='Metternich foge'),
                    Marcador(*cidade('Budapeste'), 'Budapeste', lado='d', em=0.9, sub='Kossuth'),
                    Marcador(*cidade('Praga'), 'Praga', lado='a', em=1.5),
                    Seta([(25.5, 49.5), (22.5, 48.6), (19.6, 47.7)], em=2.4, dur=1.6, cor=hexcor('#4f6b3a'), larg=5),
                    Rotulo(26.0, 50.3, 'exército russo', 2.6, 15, hexcor('#3d5530'))]),
        Cena(m, {'prussia': hexcor('#b8322a', 0.40), 'alemanha': hexcor('#b8322a', 0.30)}, ('1848 na Alemanha', 'O rei da '
             'Prússia, **Frederico Guilherme IV**, concede uma constituição. O **Parlamento de Frankfurt** debate quem faz '
             'parte da nação: **Grande Alemanha** (com a Áustria) ou **Pequena Alemanha** (sem ela, sob a Prússia). Vence a '
             'segunda, mas em 1849 o rei recusa a coroa "vinda da rua" e o parlamento é dissolvido.'), ano='1848–49',
             itens=[Marcador(*cidade('Berlim'), 'Berlim', lado='d', em=0.3),
                    Marcador(*cidade('Frankfurt'), 'Frankfurt', lado='e', em=0.8, sub='parlamento')]),
        Cena(m, {'italia': hexcor('#b8322a', 0.40), 'austria': C_AUSTRIA}, ('1848 na Itália', '**Carlos Alberto**, rei do '
             'Piemonte, concede o **Estatuto Albertino** e declara guerra à Áustria, mas perde em **Custoza (1848)** e '
             '**Novara (1849)** e abdica em favor de **Vítor Emanuel II**. A **República Romana** de Mazzini e Garibaldi e a '
             '**República de São Marcos**, em Veneza, também caem. O Estatuto sobrevive: será a constituição da Itália unida.'),
             ano='1848–49', itens=[Marcador(*cidade('Custoza'), 'Custoza', tipo='batalha', lado='d', em=0.5),
                                   Marcador(*cidade('Novara'), 'Novara', tipo='batalha', lado='e', em=1.0),
                                   Marcador(*cidade('Roma'), 'Roma', lado='d', em=1.6, sub='República Romana'),
                                   Marcador(*cidade('Veneza'), 'Veneza', lado='d', em=2.0, sub='República de São Marcos')]),
        Cena(m, {'franca': C_REPRIME, 'austria': C_AUSTRIA, 'prussia': C_PRUSSIA, 'russia': C_RUSSIA,
                 'italia': hexcor('#6b6b6b', 0.25), 'alemanha': hexcor('#6b6b6b', 0.25)},
             ('Por que "Primavera"? E por que ela acaba?', 'O nome evoca **renascimento político**, como a primavera depois do inverno '
              '(e inspirou "Primavera de Praga", 1968, e "Primavera Árabe", 2010). Mas os exércitos da **Áustria, Prússia e Rússia** '
              'restauram a ordem; na França, as **Jornadas de Junho** esmagam os operários.'), ano='1849',
             itens=[Marcador(*cidade(c), c, em=0, cor=(0.4, 0.4, 0.4), tipo='ponto', lado=lados[c]) for c, _ in p1848]),
        cena_obra(img('barricada1848'), 'Barricada na rua Soufflot, Paris, 25 de junho de 1848 · Horace Vernet',
                  ('As Jornadas de Junho de 1848', 'O fechamento das **Oficinas Nacionais** leva os operários de Paris às '
                   'barricadas. A própria **República** os esmaga: milhares de mortos e presos.')),
        Cena(None, None, ('Por que 1848 fracassou?', 'Em pouco mais de um ano, quase tudo voltou ao lugar. Mas a Europa '
             'de depois não é a de antes: a burguesia e os operários seguem caminhos separados, e o nacionalismo passa a '
             'ser usado também por governos conservadores.'), dur=13,
             itens=[Desenho(lambda c, t: cartoes(c, t, [
                 ('Medo da burguesia', 'Depois das **Jornadas de Junho**, os liberais preferem a **ordem** e se aliam aos '
                  'conservadores contra os operários.', C_REVOLTA),
                 ('Nacionalismos rivais', 'Os revoltosos se dividem: **alemães × tchecos**, **húngaros × croatas**. As '
                  'dinastias jogam um povo contra o outro.', C_LIBERAL),
                 ('Exércitos fiéis', 'Exércitos e aristocracia rural continuam leais aos reis; o **campesinato** quase '
                  'não adere.', C_PRUSSIA),
                 ('O que fica', '**Sufrágio universal masculino** na França, **fim da servidão** na Áustria, o **Estatuto '
                  'Albertino** e o operariado como força política própria.', C_PIEMONTE)]))]),
        Cena(m, {'franca': hexcor('#5b3f8a', 0.6)}, ('E depois?', '**Dez/1848**: Luís Bonaparte, sobrinho de Napoleão, é eleito '
             'presidente pelo **sufrágio universal masculino**. **1851**: dá um golpe de Estado. **1852**: plebiscito com mais de 90% '
             'de "sim" cria o **Segundo Império** e ele vira **Napoleão III**.'), ano='1852',
             itens=[Marcador(*cidade('Paris'), 'Paris', tipo='capital', cor=(0.36, 0.25, 0.54), lado='e'),
                    retrato(img('napoleao3'), 'Napoleão III (Winterhalter)', em=0.8)]),
        cena_retratos([(img('marx'), 'Karl Marx'), (img('napoleao3'), 'Napoleão III')],
                      ('Tragédia e farsa', 'Em **O 18 de Brumário de Luís Bonaparte** (1852), Marx compara o golpe do sobrinho '
                       'ao do tio: a história se repete, "a primeira vez como **tragédia**, a segunda como **farsa**". Para '
                       'ele, Napoleão III se apoiou nos **camponeses** e no medo que a burguesia tinha dos operários.')),
        Cena(None, None, ('O nacionalismo muda de lado', 'Antes de 1848, o nacionalismo era bandeira de revolucionários. '
             'Depois, governos conservadores aprendem a usá-lo: as unificações da Itália e da Alemanha serão feitas **de '
             'cima para baixo**, por reis, ministros e exércitos.'), dur=12,
             itens=[Desenho(lambda c, t: quadro_comparativo(c, t, [
                 ('Antes de 1848', ['Liberal e revolucionário', 'Feito pelo povo nas ruas', 'Mazzini, Kossuth, Frankfurt'], C_REVOLTA),
                 ('Depois de 1848', ['Conservador e autoritário', 'Feito por Estados e exércitos', 'Cavour, Bismarck, Napoleão III'], C_PRUSSIA),
             ], topo=110))]),
        Cena(None, None, ('Para a prova', '**1830** = revolução liberal: a **burguesia** toma o poder e mantém o voto censitário. '
             '**1848** = liberal + **nacional** + **social**: os **operários** entram em cena, mas são derrotados. As duas espalham '
             'o nacionalismo que levará às **unificações da Itália e da Alemanha**.'), dur=11,
             itens=[Desenho(lambda ctx, t: quadro_comparativo(ctx, t, [
                 ('1830', ['França: Carlos X cai', 'Luís Filipe, "rei burguês"', 'Bélgica independente', 'Polônia e Itália: derrota'], C_LIBERAL),
                 ('1848', ['França: 2ª República', 'Primavera dos Povos', 'Liberal + nacional + social', 'Quase tudo reprimido'], C_REVOLTA),
             ]))]),
    ]
    return Video(nome, cenas)


def quadro_comparativo(ctx, t, colunas, topo=130, alt=None, tam=21):
    """Cartões lado a lado com lista (cena sem mapa)."""
    n = len(colunas)
    larg = min(380, (W - 120 - (n - 1) * 24) / n)
    x0 = (W - (n * larg + (n - 1) * 24)) / 2
    if alt is None:
        alt = 90 + max(sum(medir_texto_rico('• ' + it, tam, larg - 40) + 6 for it in itens) for _, itens, _ in colunas)
    for i, (tit, itens, cor) in enumerate(colunas):
        a = janela(t, 0.2 + i * 0.35, 0.5)
        x = x0 + i * (larg + 24)
        y = topo + (1 - a) * 20
        retangulo_arredondado(ctx, x, y, larg, alt, 18)
        ctx.set_source_rgba(1, 1, 1, a)
        ctx.fill_preserve()
        ctx.set_source_rgba(*cor[:3], a)
        ctx.set_line_width(2)
        ctx.stroke()
        retangulo_arredondado(ctx, x, y, larg, 54, 18)
        ctx.rectangle(x, y + 30, larg, 24)
        ctx.set_source_rgba(*cor[:3], a)
        ctx.fill()
        fonte(ctx, 26, 'bold', FONTE_TIT)
        e = ctx.text_extents(tit)
        ctx.set_source_rgba(1, 1, 1, a)
        ctx.move_to(x + larg / 2 - e.x_advance / 2, y + 37)
        ctx.show_text(tit)
        yy = y + 70
        for j, it in enumerate(itens):
            b = janela(t, 0.5 + i * 0.35 + j * 0.15, 0.4)
            yy += texto_rico(ctx, x + 22, yy, '• ' + it, tam, (*INK, b), larg - 40) + 6


# ── Diagramas (cenas sem mapa) ─────────────────────────────

def cartoes(ctx, t, itens, cols=2, topo=96, base=480, gap=20, atraso=0.35, tam=22):
    """Grade de cartões (título colorido + texto com **negrito**), na altura do conteúdo."""
    linhas = math.ceil(len(itens) / cols)
    larg = (W - 120 - (cols - 1) * gap) / cols
    conteudo = max(medir_texto_rico(txt, tam, larg - 44) for _, txt, _ in itens) + 66
    alt = min((base - topo - (linhas - 1) * gap) / linhas, conteudo)
    topo += ((base - topo) - (linhas * alt + (linhas - 1) * gap)) / 2
    for i, (tit, txt, cor) in enumerate(itens):
        a = janela(t, 0.2 + i * atraso, 0.5)
        if a <= 0:
            continue
        x = 60 + (i % cols) * (larg + gap)
        y = topo + (i // cols) * (alt + gap) + (1 - a) * 16
        retangulo_arredondado(ctx, x, y, larg, alt, 16)
        ctx.set_source_rgba(1, 1, 1, a)
        ctx.fill_preserve()
        ctx.set_source_rgba(*cor[:3], 0.9 * a)
        ctx.set_line_width(2)
        ctx.stroke()
        ctx.rectangle(x, y + 16, 6, alt - 32)
        ctx.set_source_rgba(*cor[:3], a)
        ctx.fill()
        fonte(ctx, 25, 'bold', FONTE_TIT)
        ctx.set_source_rgba(*cor[:3], a)
        ctx.move_to(x + 24, y + 38)
        ctx.show_text(tit)
        texto_rico(ctx, x + 24, y + 50, txt, tam, (*INK, a), larg - 44, negrito_cor=(*NAVY, a))


def titulo_diagrama(ctx, t, texto, y=72):
    a = janela(t, 0, 0.5)
    fonte(ctx, 30, 'bold', FONTE_TIT)
    e = ctx.text_extents(texto)
    ctx.set_source_rgba(*NAVY, a)
    ctx.move_to(W / 2 - e.x_advance / 2, y)
    ctx.show_text(texto)


def grade_votos(ctx, t):
    """100 pessoas, 1 vota (Monarquia de Julho)."""
    titulo_diagrama(ctx, t, 'Monarquia de Julho: quem votava?')
    lado, gap = 30, 10
    x0 = W / 2 - (10 * lado + 9 * gap) / 2
    y0 = 110
    for i in range(100):
        a = janela(t, 0.2 + i * 0.02, 0.3)
        x = x0 + (i % 10) * (lado + gap) + lado / 2
        y = y0 + (i // 10) * (lado + gap) + lado / 2
        eleitor = i == 0
        cor = GOLD if eleitor else (0.72, 0.72, 0.72)
        ctx.arc(x, y - 6, 6, 0, 2 * math.pi)
        ctx.set_source_rgba(*cor, a)
        ctx.fill()
        ctx.arc(x, y + 12, 11, math.pi, 2 * math.pi)
        ctx.fill()
    b = janela(t, 2.8, 0.6)
    fonte(ctx, 20, 'bold')
    e = ctx.text_extents('1 eleitor')
    ctx.set_source_rgba(*GOLD, b)
    ctx.move_to(x0 - 26 - e.x_advance, y0 + 21)
    ctx.show_text('1 eleitor')
    ctx.move_to(x0 + 10 * (lado + gap) + 6, y0 + 200)
    ctx.set_source_rgba(0.45, 0.45, 0.45, b)
    ctx.show_text('99 sem voto')


def barras_mais_valia(ctx, t, fase):
    """fase 1: visão liberal (lucro); 2: mais-valia; 3: divisão socialista."""
    titulo_diagrama(ctx, t, {1: 'A fábrica de roupas: de onde vem o lucro?', 2: 'Na leitura de Marx: a mais-valia',
                             3: 'Na proposta socialista'}[fase])
    escala = 340 / 30000
    chao = 470
    larg = 150

    def barra(x, y_base, valor, cor, texto, a, sub=''):
        h = valor * escala * a
        retangulo_arredondado(ctx, x, y_base - h, larg, max(h, 1), 8)
        ctx.set_source_rgba(*cor[:3], 0.95)
        ctx.fill()
        if a > 0.6 and h > 30:
            fonte(ctx, 19, 'bold')
            for k, ln in enumerate([texto] + ([sub] if sub else [])):
                e = ctx.text_extents(ln)
                ctx.set_source_rgb(1, 1, 1)
                ctx.move_to(x + larg / 2 - e.x_advance / 2, y_base - h / 2 + 6 + (k - (0.5 if sub else 0)) * 22)
                ctx.show_text(ln)
        return y_base - h

    xa, xb = W / 2 - 260, W / 2 + 110
    a1 = janela(t, 0.3, 0.8)
    a2 = janela(t, 1.0, 0.8)
    a3 = janela(t, 2.0, 1.0)
    y = barra(xa, chao, 3000, (0.45, 0.45, 0.48), '$ 3.000', a1)
    if fase == 3:
        barra(xb, chao, 3000, (0.45, 0.45, 0.48), '$ 3.000', a1)
        barra(xb, chao - 3000 * escala, 27000, C_PIEMONTE, '$ 27.000', a3, '10 × $ 2.700')
        barra(xa, y, 5000, C_FRANCA, '$ 5.000', a2)
    else:
        barra(xa, y, 5000, C_FRANCA, '$ 5.000', a2, '10 × $ 500')
        barra(xb, chao, 8000, (0.6, 0.6, 0.6), 'custos', a1)
        barra(xb, chao - 8000 * escala, 22000, GOLD if fase == 1 else RED, '$ 22.000', a3,
              'lucro' if fase == 1 else 'mais-valia')
    fonte(ctx, 18, 'bold')
    for x, tx in ((xa, 'Gasto: matéria-prima + salários'), (xb, 'Venda das roupas: $ 30.000')):
        e = ctx.text_extents(tx)
        ctx.set_source_rgba(*INK, a1)
        ctx.move_to(x + larg / 2 - e.x_advance / 2, chao + 26)
        ctx.show_text(tx)
    ctx.set_source_rgba(*NAVY, 0.4)
    ctx.rectangle(xa - 40, chao, xb + larg + 40 - (xa - 40), 2)
    ctx.fill()
    leg = [((0.45, 0.45, 0.48), 'Matéria-prima, energia, máquinas'), (C_FRANCA, 'Salários (10 operários)')]
    yy = 140
    for cor, tx in leg:
        retangulo_arredondado(ctx, 60, yy, 18, 16, 4)
        ctx.set_source_rgba(*cor[:3], a1)
        ctx.fill()
        fonte(ctx, 16)
        ctx.set_source_rgba(*INK, a1)
        ctx.move_to(86, yy + 13)
        ctx.show_text(tx)
        yy += 26


def fluxo(ctx, t, caixas, topo=150, alt=250):
    """Caixas em sequência ligadas por setas."""
    n = len(caixas)
    gap = 70
    larg = (W - 120 - (n - 1) * gap) / n
    for i, (tit, txt, cor) in enumerate(caixas):
        a = janela(t, 0.3 + i * 0.9, 0.6)
        x = 60 + i * (larg + gap)
        retangulo_arredondado(ctx, x, topo, larg, alt, 18)
        ctx.set_source_rgba(*cor[:3], a)
        ctx.fill()
        fonte(ctx, 26, 'bold', FONTE_TIT)
        e = ctx.text_extents(tit)
        ctx.set_source_rgba(1, 1, 1, a)
        ctx.move_to(x + larg / 2 - e.x_advance / 2, topo + 44)
        ctx.show_text(tit)
        texto_rico(ctx, x + 20, topo + 60, txt, 18, (1, 1, 1, a), larg - 40, negrito_cor=(1, 0.88, 0.62, a))
        if i < n - 1:
            b = janela(t, 0.8 + i * 0.9, 0.4)
            xs = x + larg + 10
            ctx.move_to(xs, topo + alt / 2)
            ctx.line_to(xs + (gap - 20) * b, topo + alt / 2)
            ctx.set_source_rgba(*NAVY, b)
            ctx.set_line_width(4)
            ctx.stroke()
            if b > 0.9:
                xe = xs + gap - 20
                ctx.move_to(xe + 4, topo + alt / 2)
                ctx.line_to(xe - 10, topo + alt / 2 - 9)
                ctx.line_to(xe - 10, topo + alt / 2 + 9)
                ctx.close_path()
                ctx.fill()


def linha_do_tempo(ctx, t, eventos, y=270):
    """Eventos: (ano, título, texto, cor)."""
    n = len(eventos)
    x0, x1 = 110, W - 110
    p = janela(t, 0.2, 1.2)
    ctx.rectangle(x0, y - 2, (x1 - x0) * p, 4)
    ctx.set_source_rgba(*NAVY, 0.7)
    ctx.fill()
    larg = (x1 - x0) / n
    for i, (ano, tit, txt, cor) in enumerate(eventos):
        a = janela(t, 0.5 + i * 0.6, 0.5)
        x = x0 + larg * (i + 0.5)
        ctx.arc(x, y, 11, 0, 2 * math.pi)
        ctx.set_source_rgba(*cor[:3], a)
        ctx.fill()
        fonte(ctx, 22, 'bold', FONTE_TIT)
        e = ctx.text_extents(ano)
        ctx.set_source_rgba(*cor[:3], a)
        ctx.move_to(x - e.x_advance / 2, y - 26)
        ctx.show_text(ano)
        fonte(ctx, 20, 'bold')
        e = ctx.text_extents(tit)
        ctx.set_source_rgba(*INK, a)
        ctx.move_to(x - e.x_advance / 2, y - 60)
        ctx.show_text(tit)
        bx = x - larg / 2 + 10
        texto_rico(ctx, bx, y + 26, txt, 20, (*INK, a), larg - 20, negrito_cor=(*NAVY, a))


# ═══════════════════════════════════════════════════════════
#  2. Ideologias do século XIX
# ═══════════════════════════════════════════════════════════

def video_ideologias():
    nome = 'Ideologias do século XIX'
    proj = Projecao((8, 50.5), 20)
    caixa = proj.caixa()
    mapa_int = Mapa(proj, [g for _, g in geo('world_1815') if g.intersects(caixa)],
                    {'reino_unido': feicao('world_1815', 'United Kingdom of Great Britain and Ireland')})
    C_LIB, C_NAC, C_SOC, C_ANA = hexcor('#2f5d9e'), hexcor('#2e7d4f'), hexcor('#b8322a'), hexcor('#2b2b2b')
    D = lambda f: [Desenho(f)]
    cenas = [
        cartao_titulo('Ideologias do Século XIX', 'Liberalismo, Nacionalismo, Socialismo e Anarquismo',
                      extra='Livro: Cap. 36, p. 499–503'),
        Cena(None, None, ('Liberalismo clássico', 'É a base da nova **ordem burguesa** depois da Revolução Francesa e das '
             'independências na América: **propriedade privada**, **liberdades civis** e **igualdade jurídica**.'),
             itens=D(lambda c, t: cartoes(c, t, [
                 ('Política', 'O Estado garante **vida, liberdade e propriedade**, mas não interfere nas escolhas individuais. '
                  '**Constituição** e **divisão dos poderes**.', C_LIB),
                 ('Economia', '**Livre iniciativa** e **concorrência**. O mercado se autorregula; o Estado não intervém.', C_LIB),
                 ('Sociedade', 'Todos são **iguais perante a lei** e sobem na vida pelo **mérito**.', C_LIB),
                 ('Mentalidades', 'O ser humano é **racional** e decide para maximizar o próprio bem-estar.', C_LIB)]))),
        Cena(None, None, ('Os pensadores do liberalismo', 'O liberalismo tem várias faces: dos **direitos naturais** de Locke '
             'à **economia de mercado** de Smith e Ricardo, do pessimismo de Malthus ao liberalismo mais **social** de '
             'Stuart Mill, que defendia até o voto feminino.'), dur=14,
             itens=[Desenho(lambda c, t: cartoes(c, t, [
                 ('John Locke', 'Séc. XVII. **Direitos naturais**: vida, liberdade e propriedade. Governo por consentimento.', hexcor('#2f5d9e')),
                 ('Adam Smith', '**A Riqueza das Nações** (1776): divisão do trabalho e a "mão invisível" do mercado.', hexcor('#2f5d9e')),
                 ('Thomas Malthus', 'A população cresce mais rápido que os alimentos; era **contra a ajuda aos pobres**.', hexcor('#2f5d9e')),
                 ('David Ricardo', 'Livre-comércio e **vantagens comparativas**; salários tendem ao mínimo de subsistência.', hexcor('#2f5d9e')),
                 ('John Stuart Mill', 'Liberdade individual, mas com **reformas sociais**; defende o **voto feminino** (1869).', hexcor('#2f5d9e')),
                 ('Em comum', '**Propriedade privada**, Estado limitado e confiança no indivíduo e no mercado.', GOLD)], cols=3))]),
        Cena(None, None, ('A contradição', 'Se o liberalismo defendia liberdade e igualdade, por que limitava o voto? Na '
             '**Monarquia de Julho** (França, 1830–48), o **voto censitário** só deixava votar quem pagava altos impostos: '
             'cerca de **1% da população**. A igualdade era **formal** (perante a lei), não econômica nem política.'),
             itens=D(grade_votos)),
        Cena(None, None, ('Liberalismo econômico', '**Estado mínimo**, livre concorrência, oferta e demanda: a **"mão invisível"** '
             'do mercado transformaria o interesse individual em bem coletivo. A pobreza seria culpa do próprio indivíduo. '
             'Exemplo: em **1846** a Inglaterra revoga as **Corn Laws** (tarifas sobre grãos importados).'),
             itens=D(lambda c, t: (titulo_diagrama(c, t, 'Revogação das Corn Laws (1846): quem ganha, quem perde?'),
                                   quadro_comparativo(c, t, [
                                       ('Ganham', ['Industriais', 'Trabalhadores urbanos: pão mais barato',
                                                   'O livre-comércio'], C_PIEMONTE),
                                       ('Perdem', ['Aristocracia fundiária', 'Trabalhadores do campo: instabilidade',
                                                   'Dependência do mercado externo'], C_REVOLTA)])))),
        Cena(None, None, ('Nacionalismo', 'Defende o **Estado-nação** baseado na soberania popular. Exemplo: o **plebiscito de '
             '1852** aprova o Segundo Império de Napoleão III com mais de 90% dos votos, com propaganda que tratava obedecer ao '
             'imperador como servir à pátria. Quando a nação é "unânime", ainda há espaço para divergir?'),
             itens=D(lambda c, t: cartoes(c, t, [
                 ('Política', '**Unificação** ou **independência** de povos com identidade comum é um direito legítimo.', C_NAC),
                 ('Economia', '**Protecionismo** e **indústria nacional** para não depender do exterior.', C_NAC),
                 ('Sociedade', 'A nação é uma comunidade de **língua, cultura, história e tradições**.', C_NAC),
                 ('Mentalidades', 'Passado heroico, **bandeiras, hinos e heróis**: emoção e pertencimento.', C_NAC)]))),
        Cena(None, None, ('A questão social', 'Nas cidades industriais, jornadas de **14 a 16 horas**, **trabalho infantil**, '
             'salários de fome e bairros sem esgoto. Engels descreveu Manchester em **A situação da classe trabalhadora na '
             'Inglaterra** (1845). É dessa realidade que nascem os movimentos operários e as críticas ao capitalismo.'),
             itens=[Desenho(lambda c, t: (titulo_diagrama(c, t, 'A vida operária na Revolução Industrial'), cartoes(c, t, [
                 ('Jornada', '**14 a 16 horas** por dia, sem descanso semanal garantido.', C_REVOLTA),
                 ('Crianças e mulheres', 'Trabalho infantil nas minas e tecelagens; mulheres e crianças **ganham menos**.', C_REVOLTA),
                 ('Moradia', 'Cortiços superlotados, sem esgoto: **cólera** e tuberculose.', C_REVOLTA),
                 ('Sem direitos', 'Sem voto, sem sindicato legal (até 1824), sem aposentadoria nem seguro.', C_REVOLTA)], topo=100)))]),
        Cena(None, None, ('Movimentos operários na Inglaterra', 'Com a Revolução Industrial, os trabalhadores passam de '
             'destruir máquinas a exigir **direitos políticos** e formar **sindicatos**. Atenção às datas: o Cartismo é dos '
             'anos **1838–1848**.'),
             itens=D(lambda c, t: linha_do_tempo(c, t, [
                 ('1811–1816', 'Ludismo', 'Operários **quebram máquinas**, vistas como causa do desemprego e da exploração.', C_REVOLTA),
                 ('1824 →', 'Trade Unions', 'Sindicatos legalizados (1824) e fortes a partir de 1840: **salários, greves, ajuda mútua**.', C_FRANCA),
                 ('1838–1848', 'Cartismo', 'A **Carta do Povo** pede **sufrágio universal masculino** e eleições justas.', C_LIBERAL),
             ]))),
        cena_obra(img('ludismo'), '"O líder dos luditas", gravura de 1812',
                  ('Ludismo', 'O nome vem de um líder lendário, **"Ned Ludd"**. A gravura satiriza os operários que quebravam '
                   'teares mecânicos à noite.'), dur=7),
        cena_obra(img('cartismo'), 'Comício cartista em Kennington Common, Londres, 10 de abril de 1848 · fotografia',
                  ('Cartismo', 'Uma das primeiras fotografias de uma multidão: o grande comício de **1848** para entregar a '
                   '**Carta do Povo** ao Parlamento, que a rejeitou.'), dur=8),
        Cena(None, None, ('Socialismo utópico (1ª metade do séc. XIX)', 'Criticavam o capitalismo, mas imaginavam **sociedades '
             'ideais** construídas pelo exemplo e pela persuasão, sem luta de classes. Marx e Engels os chamaram de "utópicos".'),
             itens=D(lambda c, t: cartoes(c, t, [
                 ('Saint-Simon', 'Sociedade **sem ociosos** (nobres, clero, militares) e sem exploração, governada por **sábios**.', C_LIBERAL),
                 ('Fourier', '"O homem é bom, a sociedade o corrompe": **falanstérios**, comunidades agroindustriais coletivas.', C_LIBERAL),
                 ('Robert Owen', 'Industrial galês: comunidade-modelo em **New Lanark** (Escócia; jornada de 10h, escola) e '
                  '**New Harmony** (EUA). Depois apoia as **trade unions**.', C_LIBERAL)], cols=3))),
        cena_retratos([(img('owen'), 'Robert Owen'), (img('newlanark'), 'New Lanark (Escócia), hoje')],
                      ('New Lanark', 'A vila operária de **Owen**: escola para os filhos dos operários, jornada reduzida e '
                       'cooperativa. Hoje é patrimônio mundial da UNESCO.'), dur=8),
        cena_retratos([(img('marx'), 'Karl Marx (1818–1883)'), (img('engels'), 'Friedrich Engels (1820–1895)'),
                       (img('manifesto'), 'Manifesto Comunista, 1ª ed. (1848)')],
                      ('Marx e Engels', 'Os autores do **Manifesto do Partido Comunista**, publicado em Londres em '
                       'fevereiro de **1848**, às vésperas da Primavera dos Povos.'), dur=8),
        Cena(None, None, ('Socialismo científico · Marx e Engels', 'Em vez de imaginar sociedades ideais, analisar o capitalismo '
             '**como ele é**, com história e economia. A história é a **luta de classes**; o capitalismo não é natural nem eterno. '
             '**Manifesto Comunista (1848)**: "Trabalhadores do mundo, uni-vos!". **O Capital (1867)**: a exploração pela **mais-valia**.'),
             itens=D(lambda c, t: cartoes(c, t, [
                 ('Karl Marx (1818–1883)', 'Alemão, filósofo e jornalista. Exilado em **Paris, Bruxelas e Londres**, se aproxima '
                  'dos movimentos operários.', C_SOC),
                 ('Friedrich Engels (1820–1895)', 'Filho de industrial, crítico do capitalismo. Parceiro de Marx na teoria '
                  'voltada à **emancipação do proletariado**.', C_SOC)], cols=2, base=300))),
        Cena(None, None, ('Os conceitos de Marx', 'Para Marx, não são as ideias que movem a história, mas as **condições '
             'materiais**: quem é dono dos meios de produção domina também o Estado e as ideias. Por isso a transformação '
             'exige mudar a **base econômica**.'), dur=14,
             itens=[Desenho(lambda c, t: cartoes(c, t, [
                 ('Materialismo histórico', 'A **base econômica** (forças e relações de produção) condiciona a '
                  '**superestrutura**: leis, Estado, religião, ideias.', C_SOC),
                 ('Luta de classes', '"A história de todas as sociedades até hoje é a história da **luta de classes**."', C_SOC),
                 ('Alienação', 'O operário não controla nem se reconhece no que produz: o trabalho vira **mercadoria**.', C_SOC),
                 ('Ideologia', '"As ideias dominantes de uma época são as **ideias da classe dominante**."', C_SOC)]))]),
        Cena(None, None, ('Visão liberal', 'O dono gastou **$ 8.000** (matéria-prima + salários) e vendeu por **$ 30.000**. '
             'Para o liberal, os **$ 22.000** de lucro são legítimos: ele é dono dos meios de produção, **assume os riscos**, '
             'investe e reinveste, e é recompensado pelo **mérito** da iniciativa.'), dur=13,
             itens=D(lambda c, t: barras_mais_valia(c, t, 1))),
        Cena(None, None, ('Visão marxista', 'A matéria-prima só **transfere** seu valor ($ 3.000). Quem cria valor novo é o '
             '**trabalho**: os operários produzem $ 27.000 de valor, mas recebem só $ 5.000. A diferença, **$ 22.000**, é a '
             '**mais-valia**: trabalho não pago, apropriado pelo burguês.'), dur=13,
             itens=D(lambda c, t: barras_mais_valia(c, t, 2))),
        Cena(None, None, ('Proposta socialista', 'Com os **meios de produção coletivos**, o valor criado pelo trabalho ($ 27.000) '
             'seria repartido entre quem o produziu: **$ 2.700** para cada um dos 10 trabalhadores, em vez de $ 500.'), dur=10,
             itens=D(lambda c, t: barras_mais_valia(c, t, 3))),
        Cena(None, None, ('Do capitalismo ao comunismo (segundo Marx)', 'O **socialismo** é a fase de **transição**: o proletariado '
             'toma o poder (**ditadura do proletariado**), socializa os meios de produção e **planifica** a economia. O '
             '**comunismo** é o ponto de chegada: sem classes, sem Estado, "a cada um segundo suas necessidades".'),
             itens=D(lambda c, t: fluxo(c, t, [
                 ('Capitalismo', '**Propriedade privada** dos meios de produção, busca do **lucro**, sociedade dividida em '
                  '**burguesia × proletariado**.', hexcor('#3b4a6b')),
                 ('Socialismo', 'Trabalhadores no poder, **coletivização** e **economia planificada**. Ainda há Estado.', C_SOC),
                 ('Comunismo', '**Sem classes, sem Estado** e sem propriedade privada. Distribuição conforme as necessidades.',
                  hexcor('#7a1f1f'))]))),
        cena_retratos([(img('proudhon'), 'Pierre-Joseph Proudhon'), (img('bakunin'), 'Mikhail Bakunin (foto de Nadar)')],
                      ('Os anarquistas', '**Proudhon** (francês) e **Bakunin** (russo): contra o capitalismo e também contra '
                       'qualquer Estado, inclusive o "operário" proposto por Marx.'), dur=7),
        Cena(None, None, ('Anarquismo', 'Também anticapitalista, mas rejeita **toda forma de dominação**: Estado, Igreja, patrão. '
             'Diferença-chave para os marxistas: os anarquistas querem **abolir o Estado imediatamente**, sem fase de transição, '
             'pela **ação direta** (greves, boicotes, educação popular).'),
             itens=D(lambda c, t: cartoes(c, t, [
                 ('Proudhon', 'Francês, crítico da propriedade capitalista ("a propriedade é um roubo") e do poder centralizado. '
                  'Defende **mutualismo** e cooperativas.', C_ANA),
                 ('Bakunin', 'Russo, rival de Marx na 1ª Internacional. **Contra qualquer Estado**, inclusive o "operário"; '
                  'aposta na **revolta das bases**.', C_ANA),
                 ('Princípios', '**Liberdade, igualdade e autogestão**: associações livres, cooperativas, sem hierarquias fixas.', C_ANA),
                 ('Métodos', 'Recusa a via parlamentar: **greves, boicotes, sabotagens**, propaganda e educação popular.', C_ANA)]))),
        Cena(None, None, ('Correntes do anarquismo e o Brasil', 'O anarquismo chega ao Brasil com **imigrantes italianos e '
             'espanhóis** no fim do século XIX: jornais operários, ligas e a **Greve Geral de 1917** em São Paulo. É uma ponte '
             'entre este tema, a imigração italiana e a História do Brasil.'), dur=13,
             itens=[Desenho(lambda c, t: cartoes(c, t, [
                 ('Mutualismo', '**Proudhon**: troca justa entre produtores, crédito gratuito e cooperativas.', C_ANA),
                 ('Coletivismo', '**Bakunin**: meios de produção coletivos; cada um recebe pelo que trabalha.', C_ANA),
                 ('Anarcocomunismo', '**Kropotkin**: tudo em comum; distribuição segundo as **necessidades**.', C_ANA),
                 ('Anarcossindicalismo', 'O **sindicato** como arma e a **greve geral** como revolução.', C_ANA)]))]),
        Cena(mapa_int, {'reino_unido': hexcor('#b8322a', 0.35)}, ('1864 · Primeira Internacional', 'O apoio de operários ingleses e '
             'franceses aos poloneses reprimidos pela Rússia leva à fundação, em **Londres**, da **Associação Internacional dos '
             'Trabalhadores**. Ela reúne **marxistas, anarquistas e sindicalistas** contra o capitalismo (e racha em 1872, Marx × Bakunin).'),
             ano='1864', itens=[Seta([CIDADES['Paris'], (1.0, 50.3), CIDADES['Londres']], em=0.6, dur=1.2),
                                Seta([CIDADES['Berlim'], (6, 53.2), CIDADES['Londres']], em=1.0, dur=1.5),
                                Seta([CIDADES['Varsóvia'], (10, 54.5), CIDADES['Londres']], em=1.4, dur=1.8),
                                Marcador(*CIDADES['Londres'], 'Londres', tipo='capital', cor=RED, lado='a', em=2.4),
                                Marcador(*CIDADES['Varsóvia'], 'Varsóvia', tipo='ponto', cor=NAVY, lado='b', em=0.4),
                                Marcador(*CIDADES['Paris'], 'Paris', tipo='ponto', cor=NAVY, lado='b', em=0.4),
                                Marcador(*CIDADES['Berlim'], 'Berlim', tipo='ponto', cor=NAVY, lado='b', em=0.4)]),
        Cena(None, None, ('Depois da Primeira Internacional', 'O movimento operário cresce e se divide. Os **social-democratas** '
             'apostam em eleições e reformas; os **revolucionários** mantêm a ruptura; os anarquistas seguem fora dos partidos. '
             'O **1º de Maio** nasce da luta pela jornada de 8 horas em Chicago.'), dur=14,
             itens=[Desenho(lambda c, t: linha_do_tempo(c, t, [
                 ('1871', 'Comuna', 'Primeiro **governo operário**, em Paris.', C_REVOLTA),
                 ('1872', 'Racha', '**Marx × Bakunin** divide a Internacional.', C_ANA),
                 ('1886', 'Chicago', 'Greve pelas **8 horas**: origem do 1º de Maio.', C_LIBERAL),
                 ('1889', '2ª Internacional', '**Reformistas** (Bernstein) × **revolucionários**.', C_SOC),
                 ('1891', 'Rerum Novarum', 'A **Igreja** responde à questão social.', C_FRANCA)]))]),
        Cena(None, None, ('A resposta da Igreja', 'Na encíclica **Rerum Novarum** (1891), o papa **Leão XIII** condena o '
             '**socialismo**, por atacar a propriedade privada, mas também critica a **exploração** do liberalismo: defende '
             'salário justo, limites à jornada e associações operárias católicas. Nasce a **Doutrina Social da Igreja**, uma '
             '"terceira via".'), dur=14,
             itens=[Desenho(lambda c, t: quadro_comparativo(c, t, [
                 ('Contra o socialismo', ['Propriedade privada é direito natural', 'Recusa a luta de classes', 'Patrões e operários devem colaborar'], C_REVOLTA),
                 ('Contra o liberalismo', ['Salário justo, não só o de mercado', 'Limite à jornada e ao trabalho infantil', 'Direito de associação'], C_FRANCA),
             ], topo=110))]),
        Cena(None, None, ('E as mulheres?', 'Liberdade e igualdade também foram reivindicadas pelas mulheres, excluídas do voto '
             'tanto por liberais quanto por muitos socialistas. O livro trata dos **feminismos** no mesmo capítulo das '
             'ideologias.'), dur=12,
             itens=[Desenho(lambda c, t: cartoes(c, t, [
                 ('Seneca Falls (1848)', 'Nos EUA, a primeira convenção pelos **direitos das mulheres**, incluindo o voto.', hexcor('#8b6bb0')),
                 ('Flora Tristan', 'Franco-peruana que uniu **socialismo e feminismo**: "a mulher é a proletária do proletário".', hexcor('#8b6bb0')),
                 ('Stuart Mill (1869)', '**A sujeição das mulheres**: um liberal defendendo a igualdade e o voto feminino.', hexcor('#8b6bb0')),
                 ('Sufragistas', 'Fim do século: campanhas pelo voto. A **Nova Zelândia** é a primeira a concedê-lo (1893).', hexcor('#8b6bb0'))]))]),
        Cena(None, None, ('Para a prova', 'Saiba comparar: **o que fazer com o Estado** e **com a propriedade** é a pergunta que '
             'separa as três correntes. Liberais e socialistas aceitam algum Estado; anarquistas, nenhum.'), dur=12,
             itens=D(lambda c, t: quadro_comparativo(c, t, [
                 ('Liberalismo', ['Estado mínimo, garante a propriedade', 'Propriedade privada é direito natural',
                                  'Reformas por lei e Constituição'], C_LIB),
                 ('Socialismo', ['Estado operário de transição', 'Coletivizar os meios de produção',
                                 'Revolução do proletariado (Marx)'], C_SOC),
                 ('Anarquismo', ['Fim imediato do Estado', 'Autogestão e cooperativas', 'Ação direta, sem partidos'], C_ANA),
             ], topo=110))),
    ]
    return Video(nome, cenas)


# ═══════════════════════════════════════════════════════════
#  3. Unificação da Itália
# ═══════════════════════════════════════════════════════════

LACIO = poligono([(11.3, 42.5), (11.9, 42.75), (12.4, 42.5), (12.8, 42.1), (13.3, 42.0), (13.9, 41.7), (13.9, 41.3),
                  (13.1, 41.1), (11.3, 41.6)])
ROMANHA = box(11.0, 43.75, 12.8, 45.2)
# Saboia e condado de Nice (cedidos à França em 1860); a base de 1880 não os traz na França
SABOIA_NICE = unary_union([poligono([(5.6, 45.0), (5.6, 46.5), (6.8, 46.5), (7.2, 45.9), (7.2, 45.25), (6.6, 45.0)]),
                           poligono([(6.85, 43.5), (6.85, 44.4), (7.7, 44.2), (7.55, 43.6)])])


def regioes_italia():
    sardenha = feicao('world_1815', 'Kingdom of Sardinia')
    franca80 = feicao('world_1880', 'France')
    saboia = sardenha.intersection(SABOIA_NICE)
    papa = feicao('world_1815', 'Papal States')
    lacio = papa.intersection(LACIO)
    romanha = papa.intersection(ROMANHA)
    ilha = sardenha.intersection(box(7.5, 38.5, 10.5, 41.5))
    return {
        'piemonte': sardenha.difference(saboia).difference(ilha),
        'ilha': ilha,
        'saboia_nice': saboia,
        'lombardia': feicao('world_1815', 'Lombardy'),
        'veneto': feicao('world_1815', 'Venetia'),
        'ducados': feicao('world_1815', 'Parma', 'Modena', 'Tuscany', 'Lucca', 'Massa', 'Fivizzano', 'Pontremoli'),
        'romanha': romanha,
        'lacio': lacio,
        'marche_umbria': papa.difference(lacio).difference(romanha),
        'sicilias': feicao('world_1815', 'Kingdom of the Two Sicilies'),
        'austria': austria_1815().difference(feicao('world_1815', 'Lombardy', 'Venetia')),
        'franca': franca80.difference(sardenha),
    }


def video_italia():
    nome = 'Unificação da Itália'
    proj = Projecao((12.6, 42.2), 15)
    caixa = proj.caixa()
    pol = [g for _, g in geo('world_1815') if g.intersects(caixa)]
    m = Mapa(proj, pol, regioes_italia())
    C_ITALIA = hexcor('#2e7d4f', 0.62)
    C_GARI = hexcor('#c0392b', 0.60)
    inicio = {'piemonte': C_PIEMONTE, 'ilha': C_PIEMONTE, 'saboia_nice': C_PIEMONTE, 'lombardia': C_AUSTRIA, 'veneto': C_AUSTRIA,
              'austria': hexcor('#d9b44a', 0.35), 'ducados': C_DUCADOS, 'romanha': C_PAPA, 'lacio': C_PAPA,
              'marche_umbria': C_PAPA, 'sicilias': C_SICILIAS}
    leg0 = [(C_PIEMONTE, 'Reino de Piemonte-Sardenha'), (C_AUSTRIA, 'Domínio austríaco'),
            (C_DUCADOS, 'Ducados (Parma, Modena, Toscana)'), (C_PAPA, 'Estados Pontifícios'),
            (C_SICILIAS, 'Reino das Duas Sicílias')]
    rot0 = [Rotulo(8.0, 44.9, 'Piemonte', 0.6, 15), Rotulo(9.0, 40.1, 'Sardenha', 0.6, 14),
            Rotulo(9.9, 45.7, 'Lombardia', 0.8, 14), Rotulo(12.1, 45.9, 'Vêneto', 0.8, 14),
            Rotulo(11.1, 43.35, 'Toscana', 1.0, 13), Rotulo(12.9, 42.85, 'Est. Pontifícios', 1.2, 13),
            Rotulo(15.6, 40.9, 'Duas Sicílias', 1.4, 14)]
    s1859 = dict(inicio, lombardia=C_PIEMONTE, saboia_nice=hexcor('#2f5d9e', 0.55))
    s1860a = dict(s1859, ducados=C_PIEMONTE, romanha=C_PIEMONTE)
    s1860b = dict(s1860a, sicilias=C_GARI)
    s1860c = dict(s1860b, marche_umbria=C_PIEMONTE)
    s1861 = {k: (C_ITALIA if v in (C_PIEMONTE, C_GARI) and k != 'saboia_nice' else v) for k, v in s1860c.items()}
    s1866 = dict(s1861, veneto=C_ITALIA)
    s1870 = dict(s1866, lacio=C_ITALIA)
    garibaldi = [CIDADES['Gênova'], (9.6, 41.5), (11.3, 38.4), CIDADES['Marsala'], CIDADES['Calatafimi'],
                 CIDADES['Palermo'], (14.6, 38.0), CIDADES['Messina'], CIDADES['Reggio'], (16.2, 39.4), (15.6, 40.4),
                 CIDADES['Nápoles']]
    cenas = [
        cartao_titulo('A Unificação da Itália', 'Risorgimento · 1859–1870', extra='Livro: Cap. 34, p. 477–481'),
        Cena(m, inicio, ('A Itália depois de Viena (1815)', 'A península está dividida em vários Estados. A **Áustria** domina '
             'diretamente **Lombardia e Vêneto** e influencia os ducados. Para o chanceler austríaco **Metternich**, "a Itália é '
             'uma mera **expressão geográfica**".'), ano='1815', legenda_mapa=leg0, itens=rot0),
        Cena(m, inicio, ('O nacionalismo italiano', 'Os **Carbonários** (sociedade secreta) defendem uma Itália unida e são '
             'reprimidos. **Mazzini** funda a **Jovem Itália (1831)**: república democrática pela ação popular. A **República '
             'Romana (1849)** cai diante das tropas francesas. O coro "Va, pensiero", da ópera **Nabucco** (Verdi, 1842), vira hino.'),
             ano='1831–49', itens=[Marcador(*CIDADES['Roma'], 'Roma', em=0.5, lado='d',
                                            sub='República Romana, 1849'),
                                   Marcador(*CIDADES['Gênova'], 'Gênova', tipo='ponto', cor=NAVY, em=0.3, lado='e',
                                            sub='terra de Mazzini'),
                                   retrato(img('mazzini'), 'Giuseppe Mazzini', em=0.9)]),
        Cena(m, dict(inicio, piemonte=hexcor('#2e7d4f', 0.75)), ('1848–1849 · a primeira tentativa', 'Na Primavera dos Povos, '
             'o rei **Carlos Alberto** declara guerra à Áustria e perde em **Custoza** e **Novara**. Abdica em favor de '
             '**Vítor Emanuel II**, que mantém o **Estatuto Albertino**: o Piemonte vira o único Estado italiano com '
             'constituição e parlamento, polo de atração dos liberais de toda a península.'), ano='1848–49',
             itens=[Marcador(*CIDADES['Custoza'], 'Custoza', tipo='batalha', lado='a', em=0.5),
                    Marcador(*CIDADES['Novara'], 'Novara', tipo='batalha', lado='e', em=1.0)]),
        Cena(m, inicio, ('A saída moderada: Piemonte e Cavour', 'Depois de 1848, as elites burguesas preferem unificar sob a '
             '**monarquia** liberal do **Piemonte-Sardenha** (rei **Vítor Emanuel II**). O ministro **Conde de Cavour** moderniza a '
             'economia, as **ferrovias**, a indústria e o **exército**.'), ano='1850',
             legenda_mapa=[(C_PIEMONTE, 'Piemonte-Sardenha')],
             itens=[Marcador(*CIDADES['Turim'], 'Turim', tipo='capital', cor=hexcor('#1d5a37'), lado='e'),
                    retrato(img('cavour'), 'Conde de Cavour', em=0.8)]),
        Cena(m, inicio, ('A diplomacia de Cavour', 'Em **1855**, o Piemonte manda tropas à **Guerra da Crimeia**, ao lado de '
             'França e Reino Unido, sem ter nenhum interesse direto nela: queria um lugar no **Congresso de Paris (1856)** para '
             'expor a "questão italiana". Dali sai a aliança com **Napoleão III**.'), ano='1855',
             itens=[Seta([CIDADES['Gênova'], (11.0, 41.0), (16.5, 38.5), (20.5, 38.8), (23.5, 40.0)], em=0.6, dur=3.0,
                         cor=hexcor('#1d5a37'), larg=5, tracejada=True),
                    Rotulo(22.0, 41.4, 'rumo à Crimeia', 2.8, 15, hexcor('#1d5a37'))]),
        Cena(m, s1859, ('1859 · Guerra contra a Áustria', 'Pelo acordo secreto de **Plombières (1858)**, **Napoleão III** apoia o '
             'Piemonte. Vitórias em **Magenta e Solferino** dão a **Lombardia** ao Piemonte; o **Vêneto** continua austríaco. '
             'O preço: a França recebe **Saboia e Nice** (1860).'), ano='1859',
             legenda_mapa=[(C_PIEMONTE, 'Piemonte'), (C_AUSTRIA, 'Áustria'), (hexcor('#2f5d9e', 0.55), 'Cedido à França')],
             itens=[Marcador(*CIDADES['Magenta'], 'Magenta', tipo='batalha', em=0.5, lado='a'),
                    Marcador(*CIDADES['Solferino'], 'Solferino', tipo='batalha', em=1.0, lado='a'),
                    Rotulo(6.4, 44.6, 'Saboia e Nice\n→ França', 1.6, 13, NAVY)]),
        Cena(m, s1859, ('Julho de 1859 · Armistício de Villafranca', '**Napoleão III** faz a paz com a Áustria sem consultar '
             'Cavour: temia uma Itália forte demais e a reação dos **católicos franceses** em defesa do Papa. Cavour se '
             'demite em protesto. O que reabre o caminho são os levantes e plebiscitos no centro da península.'), ano='1859'),
        Cena(m, s1860a, ('Março de 1860 · plebiscitos', 'Votações populares anexam ao Piemonte os ducados de **Parma, Modena e '
             'Toscana** e a **Romanha**, parte norte dos Estados Pontifícios.'), ano='1860',
             itens=[Marcador(*CIDADES['Florença'], 'Florença', tipo='ponto', cor=hexcor('#1d5a37'), lado='d'),
                    Marcador(*CIDADES['Bolonha'], 'Bolonha', tipo='ponto', cor=hexcor('#1d5a37'), lado='d')]),
        cena_retratos([(img('garibaldi'), 'Giuseppe Garibaldi')],
                      ('O herói de dois mundos', 'Antes da Itália, **Garibaldi** lutou na América do Sul. Na **Revolução '
                       'Farroupilha** ajudou a proclamar a **República Juliana**, em Laguna (1839), e conheceu **Anita '
                       'Garibaldi**. No Uruguai comandou a Legião Italiana, que já usava **camisas vermelhas**.')),
        cena_obra(img('mil'), 'A partida dos Mil de Quarto, perto de Gênova, 5 de maio de 1860',
                  ('Os camisas vermelhas', 'Cerca de **mil voluntários** embarcam com **Garibaldi** rumo à Sicília, '
                   'onde uma revolta contra os Bourbon tinha começado.'), dur=7),
        Cena(m, s1860b, ('Maio de 1860 · Expedição dos Mil', 'Os **"camisas vermelhas"** do republicano **Giuseppe Garibaldi** '
             'saem de **Gênova**, desembarcam em **Marsala**, tomam a **Sicília** e sobem até **Nápoles**: cai o Reino das '
             'Duas Sicílias.'), ano='1860', dur=12,
             itens=[Seta(garibaldi, em=0.6, dur=7.5, cor=hexcor('#c0392b'), larg=5),
                    Marcador(*CIDADES['Gênova'], 'Gênova', tipo='ponto', cor=RED, lado='e', em=0.3),
                    Marcador(*CIDADES['Marsala'], 'Marsala', tipo='ponto', cor=RED, lado='e', em=2.8, sub='11 de maio'),
                    Marcador(*CIDADES['Palermo'], 'Palermo', tipo='ponto', cor=RED, lado='a', em=3.8),
                    Marcador(*CIDADES['Nápoles'], 'Nápoles', tipo='pulso', cor=RED, lado='d', em=8.1, sub='7 de setembro')]),
        Cena(m, s1860c, ('Outubro de 1860 · Teano', 'O exército piemontês ocupa **Marche e Úmbria** e desce ao encontro de '
             'Garibaldi. Em **Teano**, ele entrega suas conquistas a **Vítor Emanuel II**: a **unificação** fala mais alto que a '
             '**república**.'), ano='1860',
             itens=[Seta([CIDADES['Bolonha'], (13.3, 43.6), (13.9, 42.4), CIDADES['Teano']], em=0.5, dur=2.5,
                         cor=hexcor('#1d5a37'), larg=5),
                    Seta([CIDADES['Nápoles'], CIDADES['Teano']], em=0.8, dur=1.5, cor=hexcor('#c0392b'), larg=5),
                    Marcador(*CIDADES['Teano'], 'Teano', em=3.0, lado='d', cor=NAVY, sub='26 de outubro'),
                    retrato(img('garibaldi'), 'Giuseppe Garibaldi', em=1.2)]),
        Cena(m, s1861, ('17 de março de 1861 · Reino da Itália', 'Nasce o **Reino da Itália**, monarquia constitucional no modelo '
             'piemontês, capital em Turim. Ficam de fora o **Vêneto** (Áustria) e **Roma e o Lácio** (Papa, protegido por tropas '
             'francesas).'), ano='1861',
             legenda_mapa=[(C_ITALIA, 'Reino da Itália'), (C_AUSTRIA, 'Vêneto (Áustria)'), (C_PAPA, 'Roma (Papa)')],
             itens=[Marcador(*CIDADES['Turim'], 'Turim', tipo='capital', cor=hexcor('#1d5a37'), lado='e')]),
        Cena(m, s1861, ('"Roma ou morte!"', '**Garibaldi** tenta tomar Roma duas vezes por conta própria: em **Aspromonte '
             '(1862)** é ferido pelo próprio exército italiano, que não queria guerra com a França; em **Mentana (1867)** é '
             'derrotado por tropas francesas e papais.'), ano='1862–67',
             itens=[Marcador(*CIDADES['Aspromonte'], 'Aspromonte', tipo='batalha', lado='e', em=0.5, sub='1862'),
                    Marcador(*CIDADES['Mentana'], 'Mentana', tipo='batalha', lado='d', em=1.2, sub='1867'),
                    retrato(img('garibaldi'), 'Garibaldi', em=0.8)]),
        Cena(m, s1866, ('1866 · Vêneto', 'Aliada da **Prússia** na guerra contra a Áustria, a Itália recebe o **Vêneto**.'),
             ano='1866', itens=[Marcador(*CIDADES['Veneza'], 'Veneza', tipo='ponto', cor=hexcor('#1d5a37'), lado='d', em=0.6)]),
        Cena(m, s1870, ('1870 · Roma capital', 'Com a **guerra franco-prussiana**, as tropas francesas deixam Roma, que é '
             '**anexada** e vira capital (1871). O Papa **Pio IX** se declara "prisioneiro no Vaticano": começa a **Questão '
             'Romana**, resolvida só em **1929** pelo **Tratado de Latrão** (Mussolini reconhece o Estado do Vaticano).'), ano='1870',
             itens=[Marcador(*CIDADES['Roma'], 'Roma', tipo='capital', cor=hexcor('#1d5a37'), lado='d', em=0.6)]),
        Cena(m, dict(s1870, piemonte=hexcor('#2f5d9e', 0.55), lombardia=hexcor('#2f5d9e', 0.55),
                     veneto=hexcor('#2f5d9e', 0.55), ducados=hexcor('#2f5d9e', 0.40), romanha=hexcor('#2f5d9e', 0.40),
                     sicilias=hexcor('#c26b3a', 0.65), ilha=hexcor('#c26b3a', 0.45), marche_umbria=hexcor('#c9953c', 0.4), lacio=hexcor('#c9953c', 0.4)),
             ('Consequências', 'Uma unificação "de cima para baixo": o **Norte industrializado** se impõe ao **Sul rural**, com '
              'pobreza, banditismo e revoltas. Milhões de italianos **emigram** para a América, sobretudo **Brasil, Argentina e '
              'Estados Unidos**.'), ano='',
             legenda_mapa=[(hexcor('#2f5d9e', 0.55), 'Norte: indústria'), (hexcor('#c26b3a', 0.65), 'Sul: agrário, pobre')],
             itens=[Seta([CIDADES['Gênova'], (6.5, 42.0), (2.0, 39.0)], em=0.8, dur=1.6, tracejada=True),
                    Seta([CIDADES['Nápoles'], (11.5, 39.0), (4.0, 37.6)], em=1.2, dur=1.8, tracejada=True),
                    Rotulo(2.5, 38.2, 'rumo à América', 2.6, 15, RED)]),
        Cena(None, None, ('"Fizemos a Itália; agora é preciso fazer os italianos"', 'A frase, atribuída a **Massimo '
             'd\'Azeglio**, resume o problema: a unificação foi política, não social nem cultural. O novo reino precisou '
             'inventar uma identidade comum.'), dur=12,
             itens=[Desenho(lambda c, t: cartoes(c, t, [
                 ('Língua', 'Cada região falava seu **dialeto**; o italiano padrão era de uma pequena minoria.', C_PIEMONTE),
                 ('Voto', 'Censitário: só cerca de **2%** da população votava em 1861.', C_PIEMONTE),
                 ('Sul', 'O **brigantaggio**: guerrilha camponesa contra impostos e serviço militar, reprimida pelo exército.', C_SICILIAS),
                 ('Igreja', 'O Papa proíbe os católicos de participar da política do novo reino (**non expedit**).', C_PAPA)]))]),
        Cena(None, None, ('Os italianos no Brasil', 'Entre **1880 e 1920**, mais de **1 milhão** de italianos chegam ao Brasil, '
             'a maioria para as **fazendas de café** de São Paulo, com passagem paga pelo governo, para substituir a mão de '
             'obra escravizada. Muitos trazem ideias **socialistas e anarquistas**.'), dur=11,
             itens=[Desenho(lambda c, t: quadro_comparativo(c, t, [
                 ('Na Itália', ['Miséria no Sul e no campo', 'Terra concentrada', 'Unificação sem reforma social'], C_SICILIAS),
                 ('No Brasil', ['Colonos nas fazendas de café', 'Operários em São Paulo', 'Greves e anarquismo (1917)'], C_PIEMONTE),
             ], topo=110))]),
    ]
    return Video(nome, cenas)


# ═══════════════════════════════════════════════════════════
#  4. Unificação da Alemanha e Comuna de Paris
# ═══════════════════════════════════════════════════════════

FORA_CONFED_PRUSSIA = poligono([(16.0, 52.0), (16.0, 53.3), (17.6, 54.0), (17.6, 55.2), (24, 55.5), (24, 51.6), (16, 51.6)])
CONFED_AUSTRIA = poligono([(9.5, 47.2), (9.5, 48.6), (12.0, 50.3), (14.0, 51.1), (15.0, 51.0), (16.5, 50.4), (18.9, 49.8),
                           (18.8, 49.5), (17.1, 48.1), (16.5, 47.4), (16.0, 46.4), (14.5, 45.5), (13.5, 45.6), (12.4, 46.3),
                           (10.5, 46.3), (9.5, 47.2)])
ALSACIA_LORENA = poligono([(5.85, 49.5), (6.5, 49.48), (7.0, 49.15), (7.6, 49.08), (8.25, 48.98), (7.55, 47.6),
                           (7.15, 47.45), (6.9, 47.9), (6.85, 48.3), (6.65, 48.6), (6.3, 48.75), (5.95, 49.0), (5.75, 49.3)])
NORTE = ['Saxony', 'Mecklenburg-Schwerin', 'Mecklenburg-Strelitz', 'Oldenburg', 'Brunswick', 'Thuringia', 'Anhalt',
         'Lippe-Detmold', 'Waldeck', 'Schaumburg-Lippe', 'Hamburg', 'Bremen', 'Lübeck', 'Cuxhaven', 'Wetzlar']
SUL = ['Bavaria', 'Palatinate', 'Württemberg', 'Baden', 'Grand Duchy of Hesse']
ANEXADOS = ['Hanover', 'Electoral Hesse', 'Nassau']


def regioes_alemanha():
    franca15 = feicao('world_1815', 'France')
    alsacia = franca15.intersection(ALSACIA_LORENA)
    prussia = unary_union([feicao('world_1815', 'Prussia'), feicao('world_1815', 'Hohenzollern')])
    return {
        'prussia': prussia,
        'ducados': feicao('world_1815', 'Schleswig', 'Holstein'),
        'anexados': feicao('world_1815', *ANEXADOS),
        'norte': feicao('world_1815', *NORTE),
        'sul': feicao('world_1815', *SUL),
        'alsacia': alsacia,
        'austria': austria_1815(),
        'franca': franca15.difference(alsacia),
        'dinamarca': feicao('world_1815', 'Denmark'),
    }


def video_alemanha():
    nome = 'Unificação da Alemanha · Comuna de Paris'
    proj = Projecao((10.5, 50.6), 15.5)
    caixa = proj.caixa()
    pol = [g for _, g in geo('world_1815') if g.intersects(caixa)]
    reg = regioes_alemanha()
    m = Mapa(proj, pol, reg)
    confed = unary_union([reg['prussia'].difference(FORA_CONFED_PRUSSIA), reg['ducados'].intersection(box(0, 0, 30, 54.4)),
                          reg['anexados'], reg['norte'], reg['sul'], reg['austria'].intersection(CONFED_AUSTRIA),
                          feicao('world_1815', 'Luxembourg')]).buffer(0.05).buffer(-0.05)
    C_IMP = hexcor('#3b4a6b', 0.62)
    C_IMP2 = hexcor('#5d6f96', 0.55)
    base = {'prussia': C_PRUSSIA, 'austria': C_AUSTRIA}
    zoll = dict(base, norte=hexcor('#c9953c', 0.45), sul=hexcor('#c9953c', 0.45), anexados=hexcor('#c9953c', 0.45),
                prussia=C_PRUSSIA)
    s1864 = dict(base, ducados=C_REVOLTA, dinamarca=hexcor('#b8322a', 0.25))
    s1866 = dict(base, ducados=C_PRUSSIA, anexados=C_PRUSSIA, norte=C_IMP2, austria=C_REPRIME)
    s1870 = dict(s1866, sul=C_IMP2, franca=hexcor('#2f5d9e', 0.45))
    s1871 = {'prussia': C_IMP, 'ducados': C_IMP, 'anexados': C_IMP, 'norte': C_IMP, 'sul': C_IMP, 'alsacia': C_REVOLTA,
             'franca': hexcor('#2f5d9e', 0.45), 'austria': C_REPRIME}
    comuna = {'franca': hexcor('#b8322a', 0.35), 'alsacia': hexcor('#3b4a6b', 0.5)}
    cenas = [
        cartao_titulo('A Unificação da Alemanha e a Comuna de Paris', '1834–1871', extra='Livro: Cap. 34, p. 477–481'),
        Cena(m, base, ('Confederação Germânica (1815–1866)', 'O Congresso de Viena cria uma **união fraca de 39 Estados** '
             'alemães, disputada por duas potências: a **Áustria** (católica, multiétnica) e a **Prússia** (protestante, em '
             'industrialização).'), ano='1815',
             legenda_mapa=[(C_PRUSSIA, 'Prússia'), (C_AUSTRIA, 'Império Austríaco'), (NAVY, '- - Confederação Germânica')],
             itens=[Contorno(confed, em=0.6, cor=NAVY, larg=3),
                    Marcador(*CIDADES['Berlim'], 'Berlim', tipo='capital', cor=NAVY, lado='d'),
                    Marcador(*CIDADES['Viena'], 'Viena', tipo='capital', cor=hexcor('#8a6d1d'), lado='d')]),
        Cena(m, zoll, ('1834 · Zollverein', '**União alfandegária** liderada pela **Prússia**, **sem a Áustria**: acaba com '
             'tarifas internas, integra o mercado, ajuda a industrializar e faz da Prússia a líder econômica alemã.'),
             ano='1834', legenda_mapa=[(C_PRUSSIA, 'Prússia'), (hexcor('#c9953c', 0.45), 'Estados do Zollverein (aprox.)'),
                                        (C_AUSTRIA, 'Áustria: fora')]),
        Cena(m, base, ('1848 · Parlamento de Frankfurt', 'Na Primavera dos Povos, liberais tentam criar uma **Alemanha unida e '
             'democrática**. Sem apoio das elites, o projeto fracassa: o rei da Prússia recusa a coroa oferecida pelo parlamento '
             '(1849) e os conservadores reprimem o movimento.'), ano='1848',
             itens=[Marcador(*CIDADES['Frankfurt'], 'Frankfurt', em=0.4, lado='e')]),
        Cena(m, {'prussia': C_PRUSSIA, 'norte': hexcor('#5d6f96', 0.5), 'sul': hexcor('#5d6f96', 0.5),
                 'anexados': hexcor('#5d6f96', 0.5), 'ducados': hexcor('#5d6f96', 0.5), 'austria': hexcor('#d9b44a', 0.35)},
             ('Grande ou Pequena Alemanha?', 'Em Frankfurt, a dúvida era quem fazia parte da nação. A **Grande Alemanha** '
              'incluiria a Áustria, mas também seus povos não alemães; a **Pequena Alemanha** deixaria a Áustria de fora, sob '
              'a liderança da **Prússia**. Foi esse o modelo que Bismarck realizou.'), ano='1848',
             legenda_mapa=[(hexcor('#5d6f96', 0.5), 'Pequena Alemanha'), (hexcor('#d9b44a', 0.35), '+ Áustria = Grande Alemanha')]),
        Cena(m, {'prussia': C_PRUSSIA}, ('Otto von Bismarck', 'Primeiro-ministro prussiano a partir de **1862**, apoiado pelos '
             '**junkers** (aristocracia rural). Pratica a **Realpolitik**: força militar e diplomacia fria, sem idealismos liberais '
             'ou republicanos. Unificar "a **ferro e sangue**", com três guerras.'), ano='1862',
             itens=[Marcador(*CIDADES['Berlim'], 'Berlim', tipo='capital', cor=NAVY, lado='d'),
                    retrato(img('bismarck'), 'Otto von Bismarck', em=0.8)]),
        Cena(m, {'prussia': C_PRUSSIA}, ('1862 · "Ferro e sangue"', 'O parlamento prussiano, de maioria liberal, recusa o '
             'dinheiro da reforma do exército. **Bismarck** governa sem orçamento aprovado e declara: "As grandes questões '
             'da época não se decidem por discursos e votos da maioria, mas pelo **ferro e pelo sangue**".'), ano='1862',
             itens=[retrato(img('bismarck'), 'Otto von Bismarck', em=0.5)]),
        Cena(m, s1864, ('1864 · Guerra dos Ducados', '**Prússia e Áustria** derrotam a **Dinamarca** e tomam os ducados de '
             '**Schleswig e Holstein**. A disputa sobre como dividi-los vira pretexto para a próxima guerra.'), ano='1864',
             itens=[Marcador(*CIDADES['Copenhague'], 'Copenhague', tipo='capital', cor=RED, lado='d'),
                    Rotulo(9.5, 54.6, 'Schleswig-\nHolstein', 0.8, 13, INK)]),
        Cena(m, s1866, ('1866 · Guerra Austro-Prussiana', 'A "**Guerra das Sete Semanas**" termina com vitória prussiana em '
             '**Sadowa**. A Áustria sai do jogo alemão; a Prússia anexa Hanôver e outros Estados e forma a **Confederação Germânica '
             'do Norte**. (A Itália, aliada, ganha o Vêneto.)'), ano='1866',
             legenda_mapa=[(C_PRUSSIA, 'Prússia ampliada'), (C_IMP2, 'Confederação do Norte'), (C_REPRIME, 'Áustria derrotada')],
             itens=[Marcador(*CIDADES['Sadowa'], 'Sadowa', tipo='batalha', em=0.5, lado='d')]),
        Cena(m, s1866, ('Depois de 1866', 'Excluída da Alemanha, a Áustria se reorganiza como **Império Austro-Húngaro** '
             '(1867). A Confederação do Norte já tem constituição, parlamento eleito por **sufrágio universal masculino** e o '
             'rei da Prússia como presidente. Faltavam os **Estados católicos do sul**, que desconfiavam da Prússia protestante.'),
             ano='1867'),
        Cena(m, s1870, ('1870 · Guerra Franco-Prussiana', '**Napoleão III** não quer uma grande potência na fronteira. Na crise '
             'pelo trono da Espanha, Bismarck **edita o Despacho de Ems** para soar ofensivo e a França declara guerra. Os Estados '
             'do sul se unem à Prússia. Em **Sedan**, Napoleão III é **capturado**.'), ano='1870',
             itens=[Seta([(8.0, 50.0), (6.5, 49.9), CIDADES['Sedan']], em=0.6, dur=1.6, cor=NAVY, larg=5),
                    Seta([(7.6, 48.8), (5.2, 48.7), (3.5, 48.8), CIDADES['Paris']], em=1.2, dur=2.2, cor=NAVY, larg=5),
                    Marcador(*CIDADES['Ems'], 'Ems', tipo='ponto', cor=NAVY, lado='d', em=0.2),
                    Marcador(*CIDADES['Sedan'], 'Sedan', tipo='batalha', em=2.2, lado='a', sub='set/1870'),
                    Marcador(*CIDADES['Paris'], 'Paris', em=3.4, lado='e', sub='cercada')]),
        cena_obra(img('sedan'), 'A Batalha de Sedan, setembro de 1870 · pintura do séc. XIX',
                  ('Sedan', 'O exército prussiano, maior e mais organizado, cerca os franceses. **Napoleão III** se rende '
                   'com mais de 100 mil soldados e é feito prisioneiro: fim do Segundo Império.'), dur=8),
        Cena(m, s1871, ('18 de janeiro de 1871 · II Reich', 'No **Salão dos Espelhos de Versalhes**, **Guilherme I** é coroado '
             '**Kaiser** do **Império Alemão**. A França perde a **Alsácia-Lorena**: nasce o **revanchismo** francês, uma das raízes '
             'da Primeira Guerra Mundial.'), ano='1871',
             legenda_mapa=[(C_IMP, 'Império Alemão'), (C_REVOLTA, 'Alsácia-Lorena (tomada da França)')],
             itens=[Marcador(*CIDADES['Versalhes'], 'Versalhes', tipo='capital', cor=NAVY, lado='e', em=0.5),
                    Marcador(*CIDADES['Berlim'], 'Berlim', tipo='capital', cor=NAVY, lado='d', em=0.3)]),
        cena_obra(img('werner'), 'A Proclamação do Império Alemão · Anton von Werner, 1885',
                  ('Versalhes, 18 de janeiro de 1871', '**Guilherme I** é aclamado Kaiser no Salão dos Espelhos. De branco, '
                   'no centro, **Bismarck**. Só há militares e príncipes: a unificação foi feita "de cima", sem o povo.'), dur=9),
        Cena(m, s1871, ('Tratado de Frankfurt (maio de 1871)', 'A França cede a **Alsácia-Lorena**, rica em **ferro e '
             'carvão**, e paga **5 bilhões de francos** de indenização, com tropas alemãs ocupando o norte do país até o '
             'pagamento. A nova Alemanha vira a maior potência industrial do continente.'), ano='1871',
             legenda_mapa=[(C_IMP, 'Império Alemão'), (C_REVOLTA, 'Alsácia-Lorena')]),
        Cena(None, None, ('Como funcionava o II Reich', 'Uma fachada parlamentar sobre um Estado **autoritário e militarista**, '
             'dominado pela Prússia e pelos junkers. O chanceler não dependia do parlamento, só do Kaiser.'), dur=11,
             itens=[Desenho(lambda c, t: cartoes(c, t, [
                 ('Kaiser', 'O **rei da Prússia**. Comanda o exército e a política externa e nomeia o chanceler.', C_PRUSSIA),
                 ('Chanceler', 'Chefe do governo. Responde **ao Kaiser**, não ao parlamento.', C_PRUSSIA),
                 ('Reichstag', 'Eleito por **sufrágio universal masculino**, mas com pouco poder: vota leis e orçamento.', C_FRANCA),
                 ('Bundesrat', 'Conselho dos Estados; a **Prússia** tem votos suficientes para vetar mudanças.', C_FRANCA)]))]),
        Cena(None, None, ('Bismarck: o porrete e a cenoura', 'Bismarck **reprime** os socialistas e, ao mesmo tempo, cria '
             '**direitos sociais** para tirar deles o apoio operário. É a origem do **Estado de bem-estar social**.'), dur=12,
             itens=[Desenho(lambda c, t: cartoes(c, t, [
                 ('Kulturkampf', '1871–1878: ofensiva contra a **Igreja Católica** e o partido católico do Centro.', C_PRUSSIA),
                 ('Leis antissocialistas', '1878: proíbe o partido **social-democrata**, seus jornais e reuniões.', C_REVOLTA),
                 ('Leis sociais', 'Seguro-doença (1883), acidentes (1884) e **aposentadoria** (1889): o primeiro sistema estatal.', C_PIEMONTE),
                 ('Potência', 'Aço, química e ferrovias; na **Conferência de Berlim** (1884–85) a Europa partilha a África.', GOLD)]))]),
        Cena(m, comuna, ('A Comuna de Paris (18/mar – 28/mai/1871)', 'Com Paris sitiada e o governo da **3ª República** instalado '
             'em **Versalhes**, visto como traidor, **trabalhadores, socialistas, anarquistas e a Guarda Nacional** tomam a '
             'cidade e criam um governo **autogerido, popular e anticlerical**.'), ano='1871',
             itens=[Marcador(*CIDADES['Paris'], 'Paris', em=0.3, lado='d', sub='Comuna × Versalhes (Thiers)')]),
        Cena(m, comuna, ('Como a Comuna começou', 'Em **18 de março de 1871**, o governo de **Thiers** manda retirar os '
             '**canhões da Guarda Nacional** em **Montmartre**. A população impede, soldados se recusam a atirar e o governo '
             'foge para Versalhes. Em 26 de março, eleições criam o **Conselho da Comuna**.'), ano='1871',
             itens=[Marcador(*CIDADES['Paris'], 'Montmartre', em=0.4, lado='d', sub='18 de março')]),
        cena_obra(img('comuna'), 'Barricada da Comuna de Paris, 1871 · fotografia',
                  ('A Comuna nas ruas', 'Guardas nacionais e moradores de Paris posam numa barricada. A Comuna foi uma das '
                   'primeiras revoluções **fotografadas**.'), dur=7),
        Cena(None, None, ('72 dias de governo operário', 'Por isso a Comuna virou referência para **socialistas e anarquistas**: '
             'foi a primeira experiência de **governo dos trabalhadores**.'), dur=10,
             itens=[Desenho(lambda c, t: (titulo_diagrama(c, t, 'Medidas da Comuna de Paris'), cartoes(c, t, [
                 ('Estado laico', '**Separação Igreja-Estado** e **ensino gratuito e laico**.', C_REVOLTA),
                 ('Trabalho', 'Fim do **trabalho noturno** nas padarias; **fábricas abandonadas autogeridas** pelos operários.', C_REVOLTA),
                 ('Direitos', 'Fim da **censura**; salário de funcionário limitado ao de um operário qualificado.', C_REVOLTA),
                 ('Proteção social', '**Pensões para viúvas e órfãos**; igualdade civil entre homens e mulheres.', C_REVOLTA)],
                 topo=100)))]),
        Cena(None, None, ('Mulheres e memória da Comuna', 'Marx analisou a Comuna em **A Guerra Civil na França** (1871) como o '
             'primeiro "governo da classe operária". Ela virou mito fundador do socialismo e do anarquismo.'), dur=11,
             itens=[Desenho(lambda c, t: cartoes(c, t, [
                 ('Louise Michel', 'Professora anarquista que lutou nas barricadas; deportada para a **Nova Caledônia**.', C_REVOLTA),
                 ('União das Mulheres', 'Organizou **enfermarias, cooperativas** de trabalho e a defesa dos bairros.', C_REVOLTA),
                 ('Muro dos Federados', 'No cemitério **Père-Lachaise**, onde communards foram fuzilados: lugar de memória.', C_REPRIME),
                 ('A Internacional', 'Canção escrita por **Eugène Pottier** em 1871; virou o hino do movimento operário.', C_REVOLTA)]))]),
        Cena(m, {'franca': hexcor('#6b6b6b', 0.4), 'alsacia': hexcor('#3b4a6b', 0.5)}, ('Semana Sangrenta (21–28/mai/1871)',
             'O governo de Versalhes, com **prisioneiros libertados por Bismarck**, cerca e bombardeia Paris. Estimativas de **10 a '
             '20 mil mortos** em combate e execuções; dezenas de milhares de presos e milhares **deportados para a Nova Caledônia**.'),
             ano='1871', itens=[Seta([(-0.3, 48.2), (1.0, 48.4), CIDADES['Paris']], em=0.4, dur=1.4, cor=NAVY, larg=6),
                                Rotulo(-0.4, 47.85, 'tropas de Versalhes', 1.2, 14, NAVY),
                                Marcador(*CIDADES['Paris'], 'Paris', em=1.6, lado='d', cor=(0.3, 0.3, 0.3))]),
    ]
    return Video(nome, cenas)


# ═══════════════════════════════════════════════════════════
#  5. Estados Unidos no século XIX
# ═══════════════════════════════════════════════════════════

def video_eua():
    import regioes_eua as R
    nome = 'Estados Unidos no século XIX'
    proj = Projecao((-90, 37.5), 38, 'albers', cy=290)
    aq = R.aquisicoes()
    reg = dict(aq)
    reg['confederados'] = R.estados(R.CONFEDERADOS)
    reg['fronteira'] = R.estados(R.FRONTEIRA)
    reg['livres'] = R.estados(R.LIVRES)
    reg['territorios'] = R.contiguos().difference(unary_union([reg['confederados'], reg['fronteira'], reg['livres']]))
    pol = [g for p, g in geo('world_1880') if p.get('NAME') in ('Mexico', 'United States of America', 'Spain')
           or (g.intersects(box(-130, 15, -55, 60)))]
    m = Mapa(proj, pol, reg, nomes_rios={'Mississippi', 'Missouri', 'Rio Grande', 'Ohio', 'Arkansas', 'Columbia'})

    cores = {'eua1783': hexcor('#2f5d9e', 0.62), 'luisiana': hexcor('#c9953c', 0.62), 'florida': hexcor('#2e7d4f', 0.62),
             'texas': hexcor('#b8322a', 0.55), 'oregon': hexcor('#8b6bb0', 0.55), 'mexico_cessao': hexcor('#c26b3a', 0.60),
             'gadsden': hexcor('#3b4a6b', 0.60)}
    nomes = {'eua1783': '1783 · Treze Colônias + oeste até o Mississippi', 'luisiana': '1803 · Compra da Luisiana (França)',
             'florida': '1819 · Flórida (comprada da Espanha)', 'texas': '1845 · Anexação do Texas',
             'oregon': '1846 · Oregon (acordo com o Reino Unido)', 'mexico_cessao': '1848 · Cessão Mexicana (guerra)',
             'gadsden': '1853 · Compra Gadsden (México)'}

    def ate(*chaves):
        return {k: cores[k] for k in chaves}

    def leg(*chaves):
        return [(cores[k], nomes[k]) for k in chaves]

    todos = list(cores)
    cidades_eua = {'Washington': (-77.04, 38.9), 'St. Louis': (-90.2, 38.63), 'Nova Orleans': (-90.07, 29.95),
                   'San Antonio': (-98.49, 29.43), 'Sacramento': (-121.5, 38.58), 'Omaha': (-95.93, 41.26),
                   'Promontory': (-112.55, 41.62), 'Richmond': (-77.44, 37.54), 'Fort Sumter': (-79.87, 32.75),
                   'Gettysburg': (-77.23, 39.83), 'Appomattox': (-78.8, 37.37), 'Coloma': (-120.9, 38.8)}
    lewis = [(-90.2, 38.63), (-94.6, 39.1), (-96.0, 41.3), (-100.8, 46.8), (-104.0, 48.0), (-111.3, 47.5), (-113.4, 45.0),
             (-115.5, 46.5), (-117.0, 46.4), (-120.5, 45.7), (-123.9, 46.15)]
    lagrimas = [(-84.9, 34.5), (-86.8, 36.2), (-89.0, 37.3), (-91.5, 37.6), (-93.3, 37.2), (-94.97, 35.9)]
    ferrovia = [(-95.93, 41.26), (-100.8, 41.1), (-104.8, 41.1), (-108.5, 41.6), (-112.55, 41.62), (-117.0, 40.8),
                (-119.8, 39.5), (-121.5, 38.58)]
    guerra = {'livres': hexcor('#2f5d9e', 0.60), 'fronteira': hexcor('#7d8fb3', 0.55), 'confederados': hexcor('#a3352b', 0.60),
              'territorios': hexcor('#bfb8a6', 0.45)}
    escravidao = {'livres': hexcor('#2f5d9e', 0.60), 'fronteira': hexcor('#a3352b', 0.45), 'confederados': hexcor('#a3352b', 0.60),
                  'territorios': hexcor('#bfb8a6', 0.45)}

    # mapa do Caribe para o imperialismo
    proj2 = Projecao((-78, 17.5), 26)
    cx2 = proj2.caixa()
    pol2 = [g for p, g in geo('world_1880') if g.intersects(cx2)]
    m2 = Mapa(proj2, pol2, {'eua': R.contiguos(), 'cuba': box(-85.2, 19.6, -74.0, 23.4).intersection(
        unary_union([g for g in pol2])), 'porto_rico': box(-67.4, 17.8, -65.5, 18.6).intersection(unary_union(pol2))})

    cenas = [
        cartao_titulo('Os Estados Unidos no Século XIX', 'Expansão para o Oeste, Guerra Civil e Imperialismo',
                      extra='Livro: Cap. 35'),
        Cena(m, ate('eua1783'), ('Um país novo e contraditório', 'Independentes em **1783**, os EUA pregam liberdade, mas mantêm a '
             '**escravidão** e expulsam os **indígenas**. Dois projetos: **Jefferson** (república agrária e descentralizada, base do '
             'futuro Partido Democrata) × **Hamilton** (Estado forte e industrial).'), ano='1783', legenda_mapa=leg('eua1783'),
             itens=[Marcador(*cidades_eua['Washington'], 'Washington', tipo='capital', cor=NAVY, lado='d', em=0.5)]),
        Cena(m, ate('eua1783', 'luisiana'), ('1803 · Compra da Luisiana', 'Comprada de **Napoleão Bonaparte**, **dobra o território** '
             'até as Montanhas Rochosas. A **expedição de Lewis e Clark** (1804–1806), guiada pela shoshone **Sacagawea**, explora e '
             'mapeia a região até o Pacífico.'), ano='1803', legenda_mapa=leg('eua1783', 'luisiana'),
             itens=[Seta(lewis, em=0.8, dur=6, cor=NAVY, larg=4, tracejada=True),
                    Marcador(*cidades_eua['St. Louis'], 'St. Louis', tipo='ponto', cor=NAVY, lado='b', em=0.5),
                    Marcador(*cidades_eua['Nova Orleans'], 'Nova Orleans', tipo='ponto', cor=NAVY, lado='e', em=0.5),
                    retrato(img('lewis'), 'Meriwether Lewis e William Clark', em=1.0, lado='e')]),
        Cena(m, ate('eua1783', 'luisiana'), ('1812–1815 · "Segunda Independência"', 'Guerra contra o **Reino Unido**, acusado de '
             'restringir o comércio e armar indígenas. Sem ganhos territoriais (Tratado de Ghent, 1814), mas reforça o **orgulho '
             'nacional** e a ideia de uma potência em ascensão.'), ano='1812'),
        Cena(m, ate('eua1783', 'luisiana', 'florida'), ('1819 · Flórida', 'Comprada da **Espanha**: controle do sudeste e do '
             'acesso ao Golfo do México.'), ano='1819', legenda_mapa=leg('eua1783', 'luisiana', 'florida')),
        Cena(m, ate('eua1783', 'luisiana', 'florida'), ('1823 · Doutrina Monroe', '"**A América para os americanos**": nada de novas '
             'colônias europeias nem de intervenção europeia no continente (e os EUA ficam fora dos assuntos da Europa). Inaugura '
             'o **nacionalismo expansionista**.'), ano='1823', itens=[retrato(img('monroe'), 'James Monroe', em=0.6, lado='e')]),
        Cena(m, ate('eua1783', 'luisiana', 'florida'), ('Por que Monroe?', 'Em 1823 as colônias espanholas tinham acabado de '
             'se tornar independentes, e a **Santa Aliança** ameaçava ajudar a Espanha a recolonizá-las. O **Reino Unido**, '
             'interessado nesses mercados, apoiava a doutrina com sua marinha: na prática, os EUA ainda não tinham força para '
             'impô-la sozinhos.'), ano='1823'),
        Cena(m, ate('eua1783', 'luisiana', 'florida'), ('1830 · Trilha das Lágrimas', 'O **Indian Removal Act** força os povos do '
             'sudeste, como os **Cherokee**, a marchar para o oeste do Mississippi (atual Oklahoma). Milhares morrem: o "progresso" '
             'se apoiou na violência contra os indígenas.'), ano='1830',
             itens=[Seta(lagrimas, em=0.5, dur=4, cor=RED, larg=5),
                    Rotulo(-89.5, 34.4, 'Trilha das Lágrimas', 2.5, 15, RED)]),
        Cena(m, ate('eua1783', 'luisiana', 'florida', 'texas'), ('Texas: do Álamo à anexação', 'Colonos americanos no Texas mexicano '
             'exigem autonomia. Na **Batalha do Álamo (1836)** são massacrados, e o episódio vira símbolo patriótico. O Texas se '
             'declara independente e é **anexado em 1845**.'), ano='1836–45', legenda_mapa=leg('eua1783', 'luisiana', 'florida', 'texas'),
             itens=[Marcador(*cidades_eua['San Antonio'], 'Álamo', tipo='batalha', lado='e', em=0.5, sub='San Antonio, 1836'),
                    retrato(img('alamo'), 'A missão do Álamo (gravura)', em=1.0, lado='e')]),
        Cena(m, ate('eua1783', 'luisiana', 'florida', 'texas', 'oregon'), ('1846 · Oregon', 'Acordo com o **Reino Unido** fixa a '
             'fronteira no paralelo 49° e dá aos EUA a saída para o **Pacífico** no noroeste.'), ano='1846',
             legenda_mapa=leg('eua1783', 'luisiana', 'florida', 'texas', 'oregon')),
        Cena(m, ate('eua1783', 'luisiana', 'florida', 'texas', 'oregon', 'mexico_cessao'), ('1846–1848 · Guerra contra o México',
             'Pelo **Tratado de Guadalupe-Hidalgo (1848)**, os EUA tomam quase **metade do México**: Califórnia, Nevada, Utah, '
             'Arizona, Novo México. No mesmo ano começa a **corrida do ouro** na Califórnia.'), ano='1848',
             legenda_mapa=leg('eua1783', 'luisiana', 'florida', 'texas', 'oregon', 'mexico_cessao'),
             itens=[Marcador(*cidades_eua['Coloma'], 'Ouro!', em=1.5, cor=GOLD, lado='d', sub='Califórnia, 1848')]),
        Cena(m, ate(*todos), ('1853 · Compra Gadsden e o Destino Manifesto', 'Com a faixa comprada do México, o território '
             'continental se completa. O **Destino Manifesto** dizia que os americanos tinham um **direito moral e divino** de '
             'levar "liberdade, fé e progresso" do Atlântico ao Pacífico, mesmo à custa de guerras e expulsões.'), ano='1853',
             legenda_mapa=leg(*todos)),
        cena_obra(img('gast'), 'American Progress · John Gast, 1872',
                  ('A imagem do Destino Manifesto', 'A "América" flutua para o Oeste levando um **livro** e o **fio do '
                   'telégrafo**; atrás vêm ferrovias e colonos. Indígenas e bisões fogem para a sombra.'), dur=9),
        Cena(m, ate(*todos), ('Quem inventou o Destino Manifesto', 'A expressão é do jornalista **John O\'Sullivan** (1845), '
             'defendendo a anexação do Texas. Também houve oposição: o escritor **Henry Thoreau** foi preso por se recusar a '
             'pagar impostos que financiavam a guerra contra o México e escreveu **A Desobediência Civil** (1849).'), ano='1845'),
        Cena(m, escravidao, ('1820 · Compromisso do Missouri', 'Para manter o equilíbrio no Senado, o **Missouri** entra como '
             'estado escravista e o **Maine** como livre. No resto da antiga Luisiana, a escravidão fica proibida ao norte da '
             'linha **36°30\'**. Cada novo território passa a reabrir a disputa.'), ano='1820', herdar=False,
             legenda_mapa=[(hexcor('#2f5d9e', 0.6), 'Estados livres (1860)'), (hexcor('#a3352b', 0.6), 'Estados escravistas (1860)')],
             itens=[Seta([(-89.6, 36.5), (-95.0, 36.5), (-100.0, 36.5)], em=0.8, dur=2.0, cor=(0.1, 0.1, 0.1), larg=4,
                         tracejada=True, ponta=False),
                    Rotulo(-97.5, 37.6, "linha 36°30'", 2.4, 16, (0.1, 0.1, 0.1))]),
        Cena(m, escravidao, ('Expansão reabre a ferida da escravidão', 'A **Cláusula Wilmot (1846)** propunha proibir a escravidão '
             'nas terras tomadas do México. Foi rejeitada, mas polarizou o **Norte** (industrial, abolicionista) e o **Sul** '
             '(agrário, escravista, algodão para exportação).'), ano='1846–60', herdar=False,
             legenda_mapa=[(hexcor('#2f5d9e', 0.6), 'Estados livres'), (hexcor('#a3352b', 0.6), 'Estados escravistas'),
                           (hexcor('#bfb8a6', 0.45), 'Territórios')]),
        Cena(None, None, ('O caminho até a guerra', 'Cada acordo durava pouco. Nos anos 1850, a disputa saiu do Congresso e foi '
             'para as ruas, os jornais e a Suprema Corte, até que, em 1860, o Sul não aceitou a vitória de um presidente '
             'contrário à expansão da escravidão.'), dur=15,
             itens=[Desenho(lambda c, t: linha_do_tempo(c, t, [
                 ('1850', 'Compromisso', 'Califórnia livre + **Lei do Escravo Fugitivo**.', C_FRONT),
                 ('1852', 'Pai Tomás', 'Romance **abolicionista** de Harriet Beecher Stowe.', C_UNIAO),
                 ('1854', 'Kansas-Nebraska', '**Soberania popular**: o "Kansas sangrento".', C_CONFED),
                 ('1857', 'Dred Scott', 'Suprema Corte: negros **não são cidadãos**.', C_CONFED),
                 ('1859', 'John Brown', 'Ataque a **Harpers Ferry** para armar escravizados.', C_UNIAO)]))]),
        Cena(m, guerra, ('1860–1861 · Secessão', '**Abraham Lincoln** (Partido Republicano) é eleito prometendo conter a expansão '
             'da escravidão. A **Carolina do Sul** se separa e outros dez estados a seguem: os **Estados Confederados da América**, '
             'capital em **Richmond**.'), ano='1861',
             legenda_mapa=[(guerra['livres'], 'União (Norte)'), (guerra['fronteira'], 'Estados de fronteira (escravistas na União)'),
                           (guerra['confederados'], 'Confederação (Sul)'), (guerra['territorios'], 'Territórios')],
             itens=[Marcador(*cidades_eua['Washington'], 'Washington', tipo='capital', cor=NAVY, lado='d'),
                    Marcador(*cidades_eua['Richmond'], 'Richmond', tipo='capital', cor=RED, lado='e'),
                    retrato(img('lincoln'), 'Abraham Lincoln, 1863', em=0.8, lado='e')]),
        Cena(m, guerra, ('1861–1865 · Guerra de Secessão', 'O **Norte** vence pela superioridade industrial e logística: '
             '**ferrovias, telégrafo**, estaleiros. Em 1865 a Confederação se rende e a **13ª Emenda** abole a escravidão: cerca de '
             '**4 milhões** de libertos, sem terra nem educação. Cinco dias após a rendição, **Lincoln é assassinado**.'), ano='1865',
             itens=[Marcador(*cidades_eua['Fort Sumter'], 'Fort Sumter', tipo='batalha', lado='d', em=0.4, sub='abr/1861'),
                    Marcador(*cidades_eua['Gettysburg'], 'Gettysburg', tipo='batalha', lado='a', em=1.2, sub='1863'),
                    Marcador(*cidades_eua['Appomattox'], 'Appomattox', tipo='pulso', cor=NAVY, lado='e', em=2.0, sub='rendição, 1865')]),
        Cena(m, guerra, ('1863 · Emancipação e Gettysburg', 'A **Proclamação de Emancipação** liberta os escravizados dos '
             '**estados rebeldes** (não os das fronteiras, aliados da União) e permite o alistamento de negros: cerca de '
             '**180 mil** lutam pelo Norte. Em Gettysburg, Lincoln define a guerra como luta por um "governo **do povo, pelo '
             'povo, para o povo**".'), ano='1863',
             itens=[Marcador(*cidades_eua['Gettysburg'], 'Gettysburg', tipo='batalha', lado='a', em=0.4),
                    retrato(img('lincoln'), 'Abraham Lincoln', em=0.8, lado='e')]),
        Cena(m, {'confederados': hexcor('#6b6b6b', 0.5), 'fronteira': hexcor('#6b6b6b', 0.3)},
             ('Reconstrução (1865–1877) e Jim Crow', 'O Norte ocupa o Sul e cria leis de direitos civis, sabotadas pelo racismo e por '
              'grupos como a **Ku Klux Klan**. O **Acordo de 1877** retira as tropas federais: começam as **Leis de Jim Crow** '
              '(segregação legal), nome tirado de um personagem racista dos shows de **blackface**.'), ano='1877', herdar=False),
        Cena(None, None, ('As emendas da Reconstrução', 'No papel, os libertos ganham **cidadania e voto**. Na prática, os '
             'estados do Sul inventam barreiras e a Suprema Corte legaliza a segregação em **1896** (Plessy contra Ferguson: '
             '"separados, mas iguais").'), dur=13,
             itens=[Desenho(lambda c, t: cartoes(c, t, [
                 ('13ª Emenda (1865)', '**Abole** a escravidão em todo o país.', C_UNIAO),
                 ('14ª Emenda (1868)', '**Cidadania** a quem nasce nos EUA e igualdade perante a lei.', C_UNIAO),
                 ('15ª Emenda (1870)', 'O voto não pode ser negado por **raça** (só homens).', C_UNIAO),
                 ('Como burlaram', 'Imposto para votar, teste de alfabetização, "cláusula do avô" e o terror da **KKK**.', C_CONFED)]))]),
        Cena(m, {'livres': hexcor('#c9953c', 0.25), 'fronteira': hexcor('#c9953c', 0.25), 'confederados': hexcor('#c9953c', 0.25),
                 'territorios': hexcor('#c9953c', 0.45)}, ('Ferrovias e ocupação do Oeste', 'O **Homestead Act (1862)** dá terras '
             'a colonos que as cultivem. A **ferrovia transcontinental (1869)** liga as costas e integra o mercado nacional. O '
             'pós-guerra acelera o **capitalismo industrial e financeiro**.'), ano='1869',
             itens=[Seta(ferrovia, em=0.5, dur=4.5, cor=(0.2, 0.2, 0.2), larg=4),
                    Marcador(*cidades_eua['Omaha'], 'Omaha', tipo='ponto', cor=NAVY, lado='d', em=0.3),
                    Marcador(*cidades_eua['Promontory'], 'Promontory', tipo='pulso', cor=GOLD, lado='a', em=3.3, sub='trilhos se unem'),
                    Marcador(*cidades_eua['Sacramento'], 'Sacramento', tipo='ponto', cor=NAVY, lado='e', em=0.3)]),
        cena_obra(img('golden_spike'), 'Promontory (Utah), 10 de maio de 1869 · fotografia de Andrew J. Russell',
                  ('O último trilho', 'Os trabalhadores da **Union Pacific** e da **Central Pacific** se encontram: a ferrovia '
                   'liga o Atlântico ao Pacífico. Boa parte dos trilhos foi assentada por **imigrantes chineses e irlandeses**.'), dur=9),
        Cena(m, {'territorios': hexcor('#c26b3a', 0.45)}, ('As guerras indígenas no Oeste', 'Ferrovias, colonos e o '
             '**extermínio dos bisões**, base da vida nas planícies, empurram os povos indígenas para **reservas**. Os **lakota '
             'e cheyenne** derrotam o general Custer em **Little Bighorn** (1876), mas o massacre de **Wounded Knee** (1890) '
             'marca o fim da resistência armada.'), ano='1876–90', herdar=False,
             itens=[Marcador(-107.43, 45.57, 'Little Bighorn', tipo='batalha', lado='d', em=0.6, sub='1876'),
                    Marcador(-102.16, 43.14, 'Wounded Knee', em=1.4, lado='d', sub='massacre, 1890')]),
        Cena(None, None, ('Comparação que cai em prova: EUA × Brasil', 'A **Lei de Terras** (1850) fechou o acesso à terra para '
             'pobres, libertos e imigrantes; o **Homestead Act** (1862) abriu o Oeste a pequenos proprietários. Curiosidade: '
             'depois da guerra, milhares de **confederados** emigraram para o Brasil, ainda escravista, e ajudaram a fundar a '
             'cidade de **Americana** (SP).'), dur=15,
             itens=[Desenho(lambda c, t: quadro_comparativo(c, t, [
                 ('EUA', ['Homestead Act (1862): terra para quem cultiva', 'Abolição pela guerra (1865) e emendas',
                          'Pequena propriedade no Oeste'], C_UNIAO),
                 ('Brasil', ['Lei de Terras (1850): terra só por compra', 'Abolição gradual: Lei Áurea (1888), sem integração',
                             'Latifúndio; imigrantes como colonos'], C_PIEMONTE)], topo=110))]),
        Cena(m2, {'eua': hexcor('#2f5d9e', 0.5)}, ('Imperialismo no Caribe', 'A Doutrina Monroe ganha novo sentido: os EUA se veem '
             'como "polícia" do continente. **1898**: guerra contra a Espanha (Cuba, Porto Rico, Filipinas). **1901**: **Emenda '
             'Platt** (base de Guantánamo). **1903**: apoiam a separação do **Panamá** e ficam com o canal.'), ano='1898–1903',
             itens=[Seta([(-80.6, 25.4), (-81.6, 24.2), (-82.36, 23.13)], em=0.5, dur=1.0, cor=NAVY),
                    Seta([(-80.2, 25.6), (-72.0, 22.0), (-66.5, 18.4)], em=1.0, dur=1.4, cor=NAVY),
                    Seta([(-80.4, 25.2), (-83.5, 17.0), (-79.8, 9.4)], em=1.6, dur=1.6, cor=NAVY),
                    Marcador(-82.36, 23.13, 'Cuba', em=1.4, lado='a', sub='protetorado (1901)'),
                    Marcador(-75.15, 19.9, 'Guantánamo', tipo='ponto', cor=NAVY, em=2.0, lado='b'),
                    Marcador(-66.5, 18.25, 'Porto Rico', em=2.2, lado='a', sub='anexado (1898)'),
                    Marcador(-79.7, 9.1, 'Panamá', em=3.0, lado='d', sub='canal (1903–1914)')]),
        Cena(m2, {'eua': hexcor('#2f5d9e', 0.5), 'cuba': hexcor('#b8322a', 0.4), 'porto_rico': hexcor('#b8322a', 0.4)},
             ('1904 · Corolário Roosevelt', 'Theodore Roosevelt declara o direito de **intervir** em países latino-americanos '
              'instáveis ou endividados. É a política do **Big Stick**: "fale com suavidade e carregue um grande porrete".'),
             ano='1904', itens=[Marcador(-79.7, 9.1, 'Panamá', tipo='ponto', cor=RED, lado='d')]),
        cena_obra(img('bigstick'), '"The Big Stick in the Caribbean Sea" · charge de W. A. Rogers, 1904',
                  ('Big Stick', '**Theodore Roosevelt** com o porrete passeia pelo Caribe puxando navios de guerra: a charge '
                   'resume o **Corolário Roosevelt**.'), dur=8),
        Cena(None, None, ('Além do Caribe', 'Em **1898** os EUA também anexam o **Havaí** e, depois da guerra com a Espanha, ficam '
             'com as **Filipinas**, onde enfrentam uma guerra de independência (1899–1902). O país que nasceu de uma revolta '
             'anticolonial termina o século como **potência imperialista**.'), dur=11,
             itens=[Desenho(lambda c, t: linha_do_tempo(c, t, [
                 ('1823', 'Monroe', 'A Europa **não** intervém na América.', C_UNIAO),
                 ('1845', 'Destino Manifesto', 'Expansão **continental**.', C_FRONT),
                 ('1898', 'Guerra hispano-americana', 'Cuba, Porto Rico, **Filipinas**, Havaí.', C_CONFED),
                 ('1904', 'Roosevelt', 'Os EUA **intervêm** na América Latina.', C_CONFED)]))]),
    ]
    for c in cenas:
        c.legenda_lado = 'd'
    return Video(nome, cenas)


# ═══════════════════════════════════════════════════════════

VIDEOS = {
    'revolucoes-1830-1848': video_revolucoes,
    'ideologias-seculo-xix': video_ideologias,
    'unificacao-italia': video_italia,
    'unificacao-alemanha-comuna': video_alemanha,
    'eua-seculo-xix': video_eua,
}


def video_completo_extras():
    abertura = Video('', [cartao_titulo('História · 3º trimestre', 'Revisão completa em mapas: 1830/1848 · Ideologias · '
                                        'Itália · Alemanha e Comuna · EUA', topo='CADERNO DIGITAL · 2ª SÉRIE · 2026',
                                        dur=5, extra='Avaliação intermediária · 12 testes')])
    fim = Video('', [cartao_titulo('Bons estudos!', 'Revise os mapas, faça o quiz e mande seu resumo pelo botão da página.',
                                   topo='CADERNO DIGITAL', dur=4.5)])
    return abertura, fim


def principal(args):
    so_capas = '--capas' in args
    pedidos = [a for a in args if not a.startswith('--')]
    nomes = [k for k in VIDEOS if not pedidos or any(p in k for p in pedidos)]
    for chave in nomes:
        v = VIDEOS[chave]()
        if not so_capas:
            dur = renderizar([v], os.path.join(SAIDA, chave + '.mp4'))
            print(f'{chave}.mp4  {dur:.0f}s', flush=True)
        png = os.path.join(SAIDA, chave + '.png')
        capa(v, png)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', png, '-q:v', '4',
                        os.path.join(SAIDA, chave + '.jpg')], check=True)
        os.remove(png)
    if not pedidos or 'completo' in pedidos:
        abertura, fim = video_completo_extras()
        renderizar([abertura], os.path.join(SAIDA, '_abertura.mp4'))
        renderizar([fim], os.path.join(SAIDA, '_fim.mp4'))
        lista = os.path.join(SAIDA, '_lista.txt')
        with open(lista, 'w') as f:
            for nome in ['_abertura'] + list(VIDEOS) + ['_fim']:
                f.write(f"file '{nome}.mp4'\n")
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy',
                        '-movflags', '+faststart', os.path.join(SAIDA, 'historia-3tri-completo.mp4')], check=True)
        for nome in ('_abertura.mp4', '_fim.mp4', '_lista.txt'):
            os.remove(os.path.join(SAIDA, nome))
        print('historia-3tri-completo.mp4')


if __name__ == '__main__':
    principal(sys.argv[1:])
