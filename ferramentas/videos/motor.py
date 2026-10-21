"""
motor.py — Motor de vídeos com mapas animados do Caderno Digital.

Desenha cada quadro com Cairo e manda direto para o ffmpeg (sem arquivos
intermediários). Não é publicado no site; só gera os .mp4.

Um vídeo é uma lista de cenas. Cada cena tem duração, legenda e o "estado"
do mapa (cor de cada região). Entre uma cena e outra as cores mudam suavemente.
Marcadores, setas e rótulos aparecem dentro da cena com tempo próprio.
"""

import json
import math
import os
import subprocess
import urllib.request

import cairo
from shapely.geometry import shape, box, Polygon, MultiPolygon, LineString
from shapely.ops import unary_union

W, H, FPS = 1280, 720, 30

# Paleta do resumo de História (styles das páginas *-tri.html)
NAVY = (0.102, 0.153, 0.267)
GOLD = (0.788, 0.584, 0.235)
RED = (0.545, 0.180, 0.180)
PAPER = (0.980, 0.969, 0.949)
INK = (0.118, 0.118, 0.118)
SEA = (0.835, 0.874, 0.902)
LAND = (0.937, 0.910, 0.855)
BORDER = (0.62, 0.56, 0.46)

FONTE = 'Inter'
FONTE_TIT = 'Inter Display'

AQUI = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(AQUI, '.geo-cache')

FONTES_GEO = {
    'world_1783': 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1783.geojson',
    'world_1800': 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1800.geojson',
    'world_1815': 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1815.geojson',
    'world_1880': 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1880.geojson',
    'land': 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson',
    'rivers': 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_rivers_lake_centerlines.geojson',
    'lakes': 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_lakes.geojson',
    'us_states': 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json',
}

_geo = {}


def geo(nome):
    """GeoJSON (baixa uma vez para .geo-cache/)."""
    if nome not in _geo:
        os.makedirs(CACHE, exist_ok=True)
        caminho = os.path.join(CACHE, nome + '.geojson')
        if not os.path.exists(caminho):
            urllib.request.urlretrieve(FONTES_GEO[nome], caminho)
        with open(caminho, encoding='utf-8') as f:
            dados = json.load(f)
        _geo[nome] = [(ft['properties'], shape(ft['geometry']).buffer(0)) for ft in dados['features']]
    return _geo[nome]


def feicao(arquivo, *nomes, chave='NAME'):
    """União das feições com esses nomes (há países em vários pedaços)."""
    partes = [g for p, g in geo(arquivo) if p.get(chave) in nomes]
    if not partes:
        raise KeyError(f'{nomes} não está em {arquivo}')
    return unary_union(partes)


def poligono(pts):
    return Polygon(pts)


# ── Projeções ───────────────────────────────────────────────

class Projecao:
    """Equiretangular com correção de cos(lat) ou cônica de Albers.
    Enquadra o centro (lon, lat) com a altura 'span' em graus de latitude."""

    def __init__(self, centro, span, tipo='eq', paralelos=(29.5, 45.5), cy=H / 2 - 80):
        self.tipo, self.cy = tipo, cy
        self.lon0, self.lat0 = centro
        if tipo == 'albers':
            f1, f2 = (math.radians(p) for p in paralelos)
            self.n = (math.sin(f1) + math.sin(f2)) / 2
            self.C = math.cos(f1) ** 2 + 2 * self.n * math.sin(f1)
            self.r0 = math.sqrt(self.C - 2 * self.n * math.sin(math.radians(self.lat0))) / self.n
        else:
            self.k = math.cos(math.radians(self.lat0))
        # escala: 'span' graus de latitude cabem na altura
        self.s = H / math.radians(span) if tipo == 'albers' else H / span

    def _bruto(self, lon, lat):
        if self.tipo == 'albers':
            r = math.sqrt(max(self.C - 2 * self.n * math.sin(math.radians(lat)), 0)) / self.n
            th = self.n * math.radians(lon - self.lon0)
            return r * math.sin(th), self.r0 - r * math.cos(th)
        return (lon - self.lon0) * self.k, (lat - self.lat0)

    def __call__(self, lon, lat):
        x, y = self._bruto(lon, lat)
        return W / 2 + x * self.s, self.cy - y * self.s

    def caixa(self, folga=0.25):
        """Retângulo lon/lat que cobre a tela (para recortar as geometrias)."""
        if self.tipo == 'albers':
            span_lat = H / self.s * 180 / math.pi
            return box(self.lon0 - span_lat * 2.2, self.lat0 - span_lat, self.lon0 + span_lat * 2.2, self.lat0 + span_lat)
        span_lat = H / self.s
        span_lon = W / self.s / self.k
        return box(self.lon0 - span_lon * (0.5 + folga), self.lat0 - span_lat * (0.75 + folga),
                   self.lon0 + span_lon * (0.5 + folga), self.lat0 + span_lat * (0.5 + folga))


def aneis(geom, proj):
    """Geometria (lon/lat) → lista de anéis em pixels."""
    out = []
    if geom is None or geom.is_empty:
        return out
    if isinstance(geom, Polygon):
        geoms = [geom]
    elif isinstance(geom, MultiPolygon):
        geoms = list(geom.geoms)
    else:
        geoms = [g for g in getattr(geom, 'geoms', []) if isinstance(g, (Polygon, MultiPolygon))]
        return [a for g in geoms for a in aneis(g, proj)]
    for p in geoms:
        p = p.simplify(0.01)
        if p.is_empty:
            continue
        out.append([proj(x, y) for x, y in p.exterior.coords])
        for i in p.interiors:
            out.append([proj(x, y) for x, y in i.coords])
    return out


def caminho_aneis(ctx, rs):
    ctx.new_path()
    for r in rs:
        if len(r) < 3:
            continue
        ctx.move_to(*r[0])
        for p in r[1:]:
            ctx.line_to(*p)
        ctx.close_path()


# ── Utilidades ──────────────────────────────────────────────

def suave(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def janela(t, ini, dur):
    """0→1 entre ini e ini+dur."""
    return suave((t - ini) / dur) if dur > 0 else (1.0 if t >= ini else 0.0)


def mistura(a, b, p):
    if a is None and b is None:
        return None
    if a is None:
        a = (*b[:3], 0.0)
    if b is None:
        b = (*a[:3], 0.0)
    a = a if len(a) == 4 else (*a, 1.0)
    b = b if len(b) == 4 else (*b, 1.0)
    return tuple(a[i] + (b[i] - a[i]) * p for i in range(4))


def hexcor(h, a=1.0):
    h = h.lstrip('#')
    return (int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255, a)


def fonte(ctx, tam, peso='normal', fam=FONTE):
    ctx.select_font_face(fam, cairo.FONT_SLANT_NORMAL,
                         cairo.FONT_WEIGHT_BOLD if peso == 'bold' else cairo.FONT_WEIGHT_NORMAL)
    ctx.set_font_size(tam)


def quebrar(ctx, texto, largura):
    linhas = []
    for par in texto.split('\n'):
        atual = ''
        for palavra in par.split(' '):
            teste = (atual + ' ' + palavra).strip()
            if ctx.text_extents(teste).x_advance > largura and atual:
                linhas.append(atual)
                atual = palavra
            else:
                atual = teste
        linhas.append(atual)
    return linhas


def texto_rico(ctx, x, y, texto, tam, cor, largura, entrelinha=1.35, negrito_cor=None):
    """Texto com **negrito**. Devolve a altura usada."""
    # palavras = listas de trechos (texto, negrito); a pontuação gruda na palavra
    palavras, neg = [], False
    for linha_i, linha in enumerate(texto.split('\n')):
        if linha_i:
            palavras.append(None)
        for bruta in linha.split(' '):
            trechos = []
            for k, pedaco in enumerate(bruta.split('**')):
                if k:
                    neg = not neg
                if pedaco:
                    trechos.append((pedaco, neg))
            if trechos:
                palavras.append(trechos)
    linha_h = tam * entrelinha
    cx, cy = x, y + tam
    fonte(ctx, tam)
    espaco = ctx.text_extents('a a').x_advance - ctx.text_extents('aa').x_advance
    for palavra in palavras:
        if palavra is None:
            cx, cy = x, cy + linha_h
            continue
        larg_p = 0
        for txt, b in palavra:
            fonte(ctx, tam, 'bold' if b else 'normal')
            larg_p += ctx.text_extents(txt).x_advance
        if cx + larg_p > x + largura and cx > x:
            cx, cy = x, cy + linha_h
        for txt, b in palavra:
            fonte(ctx, tam, 'bold' if b else 'normal')
            ctx.set_source_rgba(*(negrito_cor if (b and negrito_cor) else cor))
            ctx.move_to(cx, cy)
            ctx.show_text(txt)
            cx += ctx.text_extents(txt).x_advance
        cx += espaco
    ctx.new_path()
    return cy - y + tam * 0.4


def medir_texto_rico(texto, tam, largura, entrelinha=1.35):
    s = cairo.ImageSurface(cairo.FORMAT_ARGB32, 4, 4)
    return texto_rico(cairo.Context(s), 0, 0, texto, tam, (0, 0, 0, 0), largura, entrelinha)


def retangulo_arredondado(ctx, x, y, w, h, r):
    ctx.new_sub_path()
    ctx.arc(x + w - r, y + r, r, -math.pi / 2, 0)
    ctx.arc(x + w - r, y + h - r, r, 0, math.pi / 2)
    ctx.arc(x + r, y + h - r, r, math.pi / 2, math.pi)
    ctx.arc(x + r, y + r, r, math.pi, 3 * math.pi / 2)
    ctx.close_path()


def rotulo(ctx, x, y, texto, tam=15, cor=INK, peso='bold', alfa=1.0, halo=True, centro=True, halo_cor=(1, 1, 1)):
    fonte(ctx, tam, peso)
    ext = ctx.text_extents(texto)
    if centro:
        x -= ext.x_advance / 2
    y += tam * 0.35
    if halo:
        ctx.move_to(x, y)
        ctx.text_path(texto)
        ctx.set_source_rgba(*halo_cor, 0.85 * alfa)
        ctx.set_line_width(3.5)
        ctx.set_line_join(cairo.LINE_JOIN_ROUND)
        ctx.stroke()
    ctx.move_to(x, y)
    ctx.set_source_rgba(*cor[:3], alfa)
    ctx.show_text(texto)
    ctx.new_path()


# ── Elementos de cena ───────────────────────────────────────

class Marcador:
    """Ponto no mapa com rótulo; 'pulso' desenha ondas; 'batalha' desenha um X."""

    def __init__(self, lon, lat, texto='', em=0.0, cor=RED, tipo='pulso', lado='d', tam=15, sub=''):
        self.lon, self.lat, self.texto, self.em = lon, lat, texto, em
        self.cor, self.tipo, self.lado, self.tam, self.sub = cor, tipo, lado, tam, sub

    def desenhar(self, ctx, proj, t):
        a = janela(t, self.em, 0.5)
        if a <= 0:
            return
        ctx.new_path()
        x, y = proj(self.lon, self.lat)
        cor = self.cor[:3]
        if self.tipo == 'pulso':
            for k in range(2):
                fase = ((t - self.em) * 0.8 + k * 0.5) % 1.0
                ctx.arc(x, y, 6 + fase * 26, 0, 2 * math.pi)
                ctx.set_source_rgba(*cor, 0.45 * (1 - fase) * a)
                ctx.set_line_width(2.5)
                ctx.stroke()
        if self.tipo == 'batalha':
            ctx.set_line_cap(cairo.LINE_CAP_ROUND)
            for dx in (-1, 1):
                ctx.move_to(x - 7, y - 7 * dx)
                ctx.line_to(x + 7, y + 7 * dx)
            ctx.set_source_rgba(1, 1, 1, a)
            ctx.set_line_width(6)
            ctx.stroke_preserve()
            ctx.set_source_rgba(*cor, a)
            ctx.set_line_width(3)
            ctx.stroke()
        else:
            r = 6 if self.tipo != 'capital' else 7
            ctx.arc(x, y, r * (0.6 + 0.4 * a), 0, 2 * math.pi)
            ctx.set_source_rgba(1, 1, 1, a)
            ctx.fill_preserve()
            ctx.set_source_rgba(*cor, a)
            ctx.set_line_width(3)
            ctx.stroke()
            if self.tipo == 'capital':
                ctx.arc(x, y, 2.5, 0, 2 * math.pi)
                ctx.set_source_rgba(*cor, a)
                ctx.fill()
        if self.texto:
            dx = {'d': 14, 'e': -14, 'c': 0, 'a': 0, 'b': 0}[self.lado]
            dy = {'d': 0, 'e': 0, 'c': 0, 'a': -20, 'b': 20}[self.lado]
            fonte(ctx, self.tam, 'bold')
            w = ctx.text_extents(self.texto).x_advance
            tx = x + dx if self.lado == 'd' else (x + dx - w if self.lado == 'e' else x - w / 2)
            rotulo(ctx, tx, y + dy, self.texto, self.tam, INK, alfa=a, centro=False)
            if self.sub:
                fonte(ctx, self.tam - 3)
                w2 = ctx.text_extents(self.sub).x_advance
                sx = x + dx if self.lado == 'd' else (x + dx - w2 if self.lado == 'e' else x - w2 / 2)
                rotulo(ctx, sx, y + dy + self.tam + 2, self.sub, self.tam - 3, (0.3, 0.3, 0.3), peso='normal', alfa=a, centro=False)


def catmull(pts, passos=12):
    if len(pts) < 3:
        return pts
    out = []
    p = [pts[0]] + list(pts) + [pts[-1]]
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        for s in range(passos):
            t = s / passos
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2
                                    + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3) for k in range(2)))
    out.append(pts[-1])
    return out


class Seta:
    """Trajeto lon/lat que se desenha entre 'em' e 'em+dur'."""

    def __init__(self, pts, em=0.0, dur=2.0, cor=RED, larg=4, tracejada=False, texto='', ponta=True):
        self.pts, self.em, self.dur, self.cor = pts, em, dur, cor
        self.larg, self.tracejada, self.texto, self.ponta = larg, tracejada, texto, ponta

    def desenhar(self, ctx, proj, t):
        p = janela(t, self.em, self.dur)
        if p <= 0:
            return
        tela = catmull([proj(*q) for q in self.pts])
        comp = [0.0]
        for a, b in zip(tela, tela[1:]):
            comp.append(comp[-1] + math.dist(a, b))
        alvo = comp[-1] * p
        vis = [tela[0]]
        for i in range(1, len(tela)):
            if comp[i] <= alvo:
                vis.append(tela[i])
            else:
                a, b = tela[i - 1], tela[i]
                f = (alvo - comp[i - 1]) / max(comp[i] - comp[i - 1], 1e-6)
                vis.append((a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f))
                break
        ctx.set_line_cap(cairo.LINE_CAP_ROUND)
        ctx.set_line_join(cairo.LINE_JOIN_ROUND)
        for cor, larg in (((1, 1, 1, 0.9), self.larg + 3), (self.cor, self.larg)):
            ctx.new_path()
            ctx.move_to(*vis[0])
            for q in vis[1:]:
                ctx.line_to(*q)
            ctx.set_dash([10, 8] if self.tracejada else [])
            ctx.set_source_rgba(*cor[:3], cor[3] if len(cor) == 4 else 1)
            ctx.set_line_width(larg)
            ctx.stroke()
        ctx.set_dash([])
        if self.ponta and len(vis) >= 2:
            (x1, y1), (x2, y2) = vis[-2], vis[-1]
            ang = math.atan2(y2 - y1, x2 - x1)
            s = 9 + self.larg
            ctx.move_to(x2 + math.cos(ang) * 4, y2 + math.sin(ang) * 4)
            ctx.line_to(x2 - math.cos(ang - 0.5) * s, y2 - math.sin(ang - 0.5) * s)
            ctx.line_to(x2 - math.cos(ang + 0.5) * s, y2 - math.sin(ang + 0.5) * s)
            ctx.close_path()
            ctx.set_source_rgba(*self.cor[:3], 1)
            ctx.fill()


class Rotulo:
    def __init__(self, lon, lat, texto, em=0.0, tam=16, cor=INK, peso='bold', italico=False):
        self.lon, self.lat, self.texto, self.em = lon, lat, texto, em
        self.tam, self.cor, self.peso = tam, cor, peso

    def desenhar(self, ctx, proj, t):
        a = janela(t, self.em, 0.6)
        if a > 0:
            x, y = proj(self.lon, self.lat)
            for i, linha in enumerate(self.texto.split('\n')):
                rotulo(ctx, x, y + i * self.tam * 1.15, linha, self.tam, self.cor, self.peso, a)


class Contorno:
    """Contorno tracejado de uma região (ex.: Confederação Germânica)."""

    def __init__(self, geom, em=0.0, cor=NAVY, larg=3):
        self.geom, self.em, self.cor, self.larg = geom, em, cor, larg
        self._aneis = None

    def desenhar(self, ctx, proj, t):
        a = janela(t, self.em, 0.8)
        if a <= 0:
            return
        if self._aneis is None:
            self._aneis = aneis(self.geom, proj)
        caminho_aneis(ctx, self._aneis)
        ctx.set_dash([9, 6])
        ctx.set_source_rgba(*self.cor[:3], a)
        ctx.set_line_width(self.larg)
        ctx.stroke()
        ctx.set_dash([])


class Desenho:
    """Elemento livre: função (ctx, t) → desenha em coordenadas de tela."""

    def __init__(self, f):
        self.f = f

    def desenhar(self, ctx, proj, t):
        self.f(ctx, t)


# ── Mapa base ───────────────────────────────────────────────

class Mapa:
    """Fundo estático (mar, terra, fronteiras) + regiões que podem ser coloridas."""

    def __init__(self, proj, politicas, regioes, rios=(), terra=True, cor_terra=LAND, nomes_rios=None):
        self.proj = proj
        caixa = proj.caixa()
        self.fundo = cairo.ImageSurface(cairo.FORMAT_RGB24, W, H)
        ctx = cairo.Context(self.fundo)
        g = cairo.LinearGradient(0, 0, 0, H)
        g.add_color_stop_rgb(0, 0.86, 0.90, 0.93)
        g.add_color_stop_rgb(1, 0.78, 0.84, 0.88)
        ctx.set_source(g)
        ctx.paint()
        if terra:
            for _, gm in geo('land'):
                if gm.intersects(caixa):
                    caminho_aneis(ctx, aneis(gm.intersection(caixa), proj))
                    ctx.set_source_rgb(*cor_terra)
                    ctx.fill()
        for gm in politicas:
            if gm.intersects(caixa):
                caminho_aneis(ctx, aneis(gm.intersection(caixa), proj))
                ctx.set_source_rgb(*cor_terra)
                ctx.fill_preserve()
                ctx.set_source_rgba(*BORDER, 0.9)
                ctx.set_line_width(0.9)
                ctx.stroke()
        if nomes_rios:
            for p, gm in geo('rivers'):
                if p.get('name') in nomes_rios and gm.intersects(caixa):
                    linhas = gm.geoms if hasattr(gm, 'geoms') else [gm]
                    for ln in linhas:
                        if isinstance(ln, LineString):
                            pts = [proj(x, y) for x, y in ln.coords]
                            ctx.move_to(*pts[0])
                            for q in pts[1:]:
                                ctx.line_to(*q)
                    ctx.set_source_rgba(0.42, 0.60, 0.75, 0.9)
                    ctx.set_line_width(1.6)
                    ctx.stroke()
            for p, gm in geo('lakes'):
                if gm.intersects(caixa) and gm.area > 0.3:
                    caminho_aneis(ctx, aneis(gm.intersection(caixa), proj))
                    ctx.set_source_rgb(0.80, 0.86, 0.90)
                    ctx.fill()
        # vinheta
        rg = cairo.RadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.75)
        rg.add_color_stop_rgba(0, 0, 0, 0, 0)
        rg.add_color_stop_rgba(1, 0.05, 0.08, 0.15, 0.28)
        ctx.set_source(rg)
        ctx.paint()
        self.regioes = {k: aneis(v.intersection(caixa) if v.intersects(caixa) else v, proj) for k, v in regioes.items()}

    def desenhar(self, ctx, estado_a, estado_b, p):
        ctx.set_source_surface(self.fundo, 0, 0)
        ctx.paint()
        for k, rs in self.regioes.items():
            cor = mistura(estado_a.get(k), estado_b.get(k), p)
            if cor is None or cor[3] <= 0.001:
                continue
            caminho_aneis(ctx, rs)
            ctx.set_source_rgba(*cor)
            ctx.fill_preserve()
            ctx.set_source_rgba(1, 1, 1, 0.55 * cor[3])
            ctx.set_line_width(1.2)
            ctx.stroke()


# ── Cena e vídeo ───────────────────────────────────────────

class Cena:
    """
    mapa: Mapa (ou None para cena só de desenho/cartão)
    estado: {região: cor rgba}; regiões ausentes ficam sem cor
    legenda: (título curto, texto com **negrito**)
    ano: texto grande no canto (ex.: '1848')
    itens: Marcador, Seta, Rotulo, Contorno, Desenho
    legenda_mapa: [(cor, texto)] no canto superior esquerdo
    """

    def __init__(self, mapa=None, estado=None, legenda=None, ano='', itens=(), dur=None,
                 legenda_mapa=(), fundo=None, herdar=True):
        self.mapa, self.estado, self.legenda, self.ano = mapa, estado, legenda, ano
        self.itens, self.legenda_mapa, self.fundo, self.herdar = list(itens), list(legenda_mapa), fundo, herdar
        self.legenda_lado = 'e'
        if dur is None:
            palavras = len((legenda[1] if legenda else '').split())
            dur = max(5.0, palavras / 3.3 + 2.0)
        self.dur = dur


def desenhar_legenda(ctx, cena, t):
    if not cena.legenda:
        return
    titulo, texto = cena.legenda
    a = janela(t, 0.15, 0.5) * (1 - janela(t, cena.dur - 0.35, 0.35))
    if a <= 0:
        return
    larg = 1040
    alt_txt = medir_texto_rico(texto, 23, larg - 56)
    alt = alt_txt + (48 if titulo else 22)
    x = (W - larg) / 2
    y = H - alt - 26 + (1 - a) * 14
    retangulo_arredondado(ctx, x, y, larg, alt, 16)
    ctx.set_source_rgba(0.06, 0.09, 0.17, 0.86 * a)
    ctx.fill()
    ctx.rectangle(x, y + 14, 5, alt - 28)
    ctx.set_source_rgba(*GOLD, a)
    ctx.fill()
    ty = y + 14
    if titulo:
        fonte(ctx, 15, 'bold')
        ctx.set_source_rgba(*GOLD, a)
        ctx.move_to(x + 28, ty + 15)
        ctx.show_text(titulo.upper())
        ty += 26
    texto_rico(ctx, x + 28, ty, texto, 23, (1, 1, 1, a), larg - 56, negrito_cor=(1, 0.86, 0.6, a))


def desenhar_cabecalho(ctx, nome_video, cena, t):
    fonte(ctx, 14, 'bold')
    w = ctx.text_extents(nome_video).x_advance
    retangulo_arredondado(ctx, 22, 20, w + 28, 32, 16)
    ctx.set_source_rgba(0.06, 0.09, 0.17, 0.78)
    ctx.fill()
    ctx.set_source_rgb(1, 1, 1)
    ctx.move_to(36, 41)
    ctx.show_text(nome_video)
    if cena.ano:
        a = janela(t, 0.0, 0.5)
        fonte(ctx, 58, 'bold', FONTE_TIT)
        ext = ctx.text_extents(cena.ano)
        x = W - 30 - ext.x_advance
        ctx.move_to(x, 78)
        ctx.text_path(cena.ano)
        ctx.set_source_rgba(1, 1, 1, 0.75 * a)
        ctx.set_line_width(6)
        ctx.set_line_join(cairo.LINE_JOIN_ROUND)
        ctx.stroke()
        ctx.move_to(x, 78)
        ctx.set_source_rgba(*NAVY, a)
        ctx.show_text(cena.ano)
    if cena.legenda_mapa:
        a = janela(t, 0.1, 0.5)
        y = 66
        fonte(ctx, 14, 'bold')
        larg = max(ctx.text_extents(txt).x_advance for _, txt in cena.legenda_mapa) + 52
        alt = 16 + 26 * len(cena.legenda_mapa)
        x = 22
        if cena.legenda_lado == 'd':
            x, y = W - 22 - larg, 100
        retangulo_arredondado(ctx, x, y, larg, alt, 10)
        ctx.set_source_rgba(1, 1, 1, 0.88 * a)
        ctx.fill()
        for i, (cor, txt) in enumerate(cena.legenda_mapa):
            yy = y + 12 + i * 26
            retangulo_arredondado(ctx, x + 12, yy + 2, 18, 16, 4)
            ctx.set_source_rgba(*cor[:3], (cor[3] if len(cor) == 4 else 1) * a)
            ctx.fill()
            ctx.set_source_rgba(*INK, a)
            ctx.move_to(x + 38, yy + 15)
            ctx.show_text(txt)


def cartao_titulo(titulo, subtitulo='', topo='CADERNO DIGITAL · HISTÓRIA · 3º TRI', dur=4.5, extra=''):
    def f(ctx, t):
        g = cairo.LinearGradient(0, 0, W, H)
        g.add_color_stop_rgb(0, 0.05, 0.09, 0.15)
        g.add_color_stop_rgb(0.5, *NAVY)
        g.add_color_stop_rgb(1, 0.04, 0.06, 0.10)
        ctx.set_source(g)
        ctx.paint()
        # textura de grade discreta
        ctx.set_source_rgba(1, 1, 1, 0.035)
        for x in range(0, W, 40):
            ctx.rectangle(x, 0, 1, H)
        for y in range(0, H, 40):
            ctx.rectangle(0, y, W, 1)
        ctx.fill()
        a = janela(t, 0.1, 0.7)
        b = janela(t, 0.5, 0.7)
        fonte(ctx, 60, 'bold', FONTE_TIT)
        linhas = quebrar(ctx, titulo, 1100)
        y0 = H / 2 - 20 - (len(linhas) - 1) * 34
        fonte(ctx, 16, 'bold')
        e = ctx.text_extents(topo)
        ctx.set_source_rgba(*GOLD, a)
        ctx.move_to(W / 2 - e.x_advance / 2, y0 - 72)
        ctx.show_text(topo)
        fonte(ctx, 60, 'bold', FONTE_TIT)
        for i, ln in enumerate(linhas):
            e = ctx.text_extents(ln)
            ctx.set_source_rgba(1, 1, 1, a)
            ctx.move_to(W / 2 - e.x_advance / 2, y0 + i * 70 + (1 - a) * 18)
            ctx.show_text(ln)
        ctx.rectangle(W / 2 - 60 * b, y0 + (len(linhas) - 1) * 70 + 30, 120 * b, 4)
        ctx.set_source_rgba(*GOLD, 1)
        ctx.fill()
        if subtitulo:
            fonte(ctx, 24)
            for i, ln in enumerate(quebrar(ctx, subtitulo, 1000)):
                e = ctx.text_extents(ln)
                ctx.set_source_rgba(1, 1, 1, 0.82 * b)
                ctx.move_to(W / 2 - e.x_advance / 2, y0 + (len(linhas) - 1) * 70 + 80 + i * 32)
                ctx.show_text(ln)
        if extra:
            fonte(ctx, 17)
            e = ctx.text_extents(extra)
            ctx.set_source_rgba(1, 1, 1, 0.55 * b)
            ctx.move_to(W / 2 - e.x_advance / 2, H - 60)
            ctx.show_text(extra)
    return Cena(itens=[Desenho(f)], dur=dur, fundo='titulo')


def fundo_papel(ctx):
    ctx.set_source_rgb(*PAPER)
    ctx.paint()
    ctx.set_source_rgba(*NAVY, 0.04)
    for y in range(0, H, 36):
        ctx.rectangle(0, y, W, 1)
    ctx.fill()


class Video:
    def __init__(self, nome, cenas):
        self.nome, self.cenas = nome, cenas

    @property
    def duracao(self):
        return sum(c.dur for c in self.cenas)

    def quadros(self):
        """Gera (superfície) quadro a quadro."""
        sup = cairo.ImageSurface(cairo.FORMAT_RGB24, W, H)
        ctx = cairo.Context(sup)
        estado_ant, mapa_ant = {}, None
        for i, cena in enumerate(self.cenas):
            n = int(round(cena.dur * FPS))
            estado = dict(cena.estado or {})
            herdado = estado_ant if (cena.mapa is mapa_ant and cena.herdar) else estado
            for q in range(n):
                t = q / FPS
                ctx.save()
                if cena.mapa:
                    cena.mapa.desenhar(ctx, herdado, estado, janela(t, 0.0, 1.0))
                elif cena.fundo != 'titulo':
                    fundo_papel(ctx)
                for item in cena.itens:
                    ctx.save()
                    ctx.new_path()
                    item.desenhar(ctx, cena.mapa.proj if cena.mapa else None, t)
                    ctx.restore()
                if cena.fundo != 'titulo':
                    desenhar_cabecalho(ctx, self.nome, cena, t)
                    desenhar_legenda(ctx, cena, t)
                ctx.restore()
                # transição: escurece levemente ao trocar de mapa/cartão
                prox = self.cenas[i + 1] if i + 1 < len(self.cenas) else None
                troca_fim = prox is None or prox.mapa is not cena.mapa or prox.fundo != cena.fundo
                troca_ini = i == 0 or self.cenas[i - 1].mapa is not cena.mapa or self.cenas[i - 1].fundo != cena.fundo
                esc = 0.0
                if troca_ini:
                    esc = max(esc, 1 - janela(t, 0, 0.35))
                if troca_fim:
                    esc = max(esc, janela(t, cena.dur - 0.35, 0.35))
                if esc > 0:
                    ctx.set_source_rgba(0.03, 0.05, 0.09, esc)
                    ctx.paint()
                sup.flush()
                yield sup
            estado_ant, mapa_ant = estado, cena.mapa


def renderizar(videos, saida, crf=30):
    """Concatena um ou mais vídeos num .mp4 (H.264, sem áudio)."""
    os.makedirs(os.path.dirname(saida), exist_ok=True)
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', f'{W}x{H}',
           '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation',
           '-crf', str(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', saida]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    total = 0
    for v in videos:
        for sup in v.quadros():
            proc.stdin.write(bytes(sup.get_data()))
            total += 1
    proc.stdin.close()
    proc.wait()
    return total / FPS


def capa(video, saida, indice_cena=1, t=None):
    """Salva um quadro como imagem (poster do <video>)."""
    cena = video.cenas[indice_cena]
    alvo = sum(c.dur for c in video.cenas[:indice_cena]) + (t if t is not None else cena.dur * 0.6)
    n = int(alvo * FPS)
    for i, sup in enumerate(video.quadros()):
        if i == n:
            sup.write_to_png(saida)
            return


def quadros_em(video, tempos, prefixo):
    """Salva quadros nos instantes pedidos (para conferir o visual)."""
    alvos = {int(t * FPS): t for t in tempos}
    for i, sup in enumerate(video.quadros()):
        if i in alvos:
            sup.write_to_png(f'{prefixo}-{alvos[i]:05.1f}.png')
        if i > max(alvos):
            return
