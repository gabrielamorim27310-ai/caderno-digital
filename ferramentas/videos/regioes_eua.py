"""Aquisições territoriais dos EUA (1783–1853), desenhadas à mão sobre o
contorno atual dos estados. As linhas seguem os tratados (Mississippi,
Adams-Onís, Rio Grande, paralelos 42° e 49°) de forma aproximada."""

from shapely.geometry import Polygon, box
from shapely.ops import unary_union

from motor import geo

LUISIANA = Polygon([(-93.85, 29.6), (-94.04, 32.0), (-94.04, 33.55), (-100.0, 34.56), (-100.0, 37.75), (-106.3, 39.25),
                    (-106.3, 42.0), (-109.5, 42.5), (-110.5, 44.5), (-113.0, 45.0), (-114.0, 46.6), (-114.5, 47.8),
                    (-114.0, 49.0), (-95.2, 49.0), (-95.2, 47.24), (-93.3, 45.0), (-91.2, 43.5), (-91.1, 40.5),
                    (-90.2, 38.6), (-89.2, 37.0), (-89.6, 36.0), (-90.1, 35.0), (-91.0, 33.0), (-91.6, 31.0),
                    (-89.7, 31.0), (-89.5, 30.2), (-89.0, 28.5), (-93.85, 29.3)])
FLORIDA = Polygon([(-91.65, 31.0), (-85.0, 31.0), (-84.9, 30.7), (-82.2, 30.57), (-81.4, 30.7), (-79, 30.7),
                   (-79, 24), (-92, 24)])
TEXAS = Polygon([(-93.85, 29.3), (-94.04, 32.0), (-94.04, 33.55), (-100.0, 34.56), (-100.0, 37.75), (-106.3, 39.25),
                 (-106.3, 42.0), (-107.3, 42.0), (-107.3, 37.8), (-105.7, 36.9), (-106.1, 35.9), (-106.65, 35.1),
                 (-106.6, 31.8), (-104.0, 27.0), (-97.0, 24.0), (-93.0, 28.0)])
GADSDEN = Polygon([(-114.8, 32.5), (-114.6, 32.75), (-112.5, 33.0), (-110.5, 32.95), (-109.05, 32.8), (-108.2, 32.3),
                   (-106.6, 31.95), (-106.5, 31.75), (-108.2, 31.78), (-108.2, 31.33), (-111.07, 31.33)])

CONFEDERADOS = ['South Carolina', 'Mississippi', 'Florida', 'Alabama', 'Georgia', 'Louisiana', 'Texas', 'Virginia',
                'Arkansas', 'North Carolina', 'Tennessee']
FRONTEIRA = ['Delaware', 'Maryland', 'Kentucky', 'Missouri', 'West Virginia']
LIVRES = ['Maine', 'New Hampshire', 'Vermont', 'Massachusetts', 'Rhode Island', 'Connecticut', 'New York',
          'New Jersey', 'Pennsylvania', 'Ohio', 'Indiana', 'Illinois', 'Michigan', 'Wisconsin', 'Minnesota', 'Iowa',
          'Kansas', 'California', 'Oregon']


def estados(nomes):
    return unary_union([g for p, g in geo('us_states') if p['name'] in nomes])


def contiguos():
    return unary_union([g for p, g in geo('us_states') if p['name'] not in ('Alaska', 'Hawaii', 'Puerto Rico')])


def aquisicoes():
    base = contiguos()
    texas = base.intersection(TEXAS)
    lou = base.intersection(LUISIANA).difference(texas)
    flo = base.intersection(FLORIDA).difference(lou)
    gad = base.intersection(GADSDEN).difference(texas)
    ore = base.intersection(box(-125, 42, -106, 49.5)).difference(unary_union([lou, texas]))
    mex = base.intersection(box(-125, 30, -100, 42.01)).difference(unary_union([lou, texas, gad]))
    r1783 = base.intersection(box(-96, 24, -60, 50)).difference(unary_union([lou, flo, texas, gad, ore, mex]))
    limpa = lambda g: g.buffer(0.02).buffer(-0.02)
    return {'eua1783': limpa(r1783), 'luisiana': limpa(lou), 'florida': limpa(flo), 'texas': limpa(texas),
            'oregon': limpa(ore), 'mexico_cessao': limpa(mex), 'gadsden': limpa(gad)}
