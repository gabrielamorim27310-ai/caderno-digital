"""
narracao.py — Narração dos vídeos com voz neural local (Piper, pt-BR "faber").

Cada cena é lida a partir da sua legenda. Se a fala for mais longa que a cena,
a cena é esticada. O texto passa por uma limpeza para a voz ler datas,
valores e siglas por extenso.
"""

import hashlib
import os
import re
import urllib.request
import wave

from motor import CACHE, FPS

VOZ = 'pt_BR-faber-medium'
URL_VOZ = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/' + VOZ
TAXA = 22050
ANTES, DEPOIS = 0.6, 0.9   # silêncio antes e depois da fala, em segundos

_voz = None

MESES = {'jan': 'janeiro', 'fev': 'fevereiro', 'mar': 'março', 'abr': 'abril', 'mai': 'maio', 'jun': 'junho',
         'jul': 'julho', 'ago': 'agosto', 'set': 'setembro', 'out': 'outubro', 'nov': 'novembro', 'dez': 'dezembro'}
ORDINAIS = {'13ª': 'décima terceira', '1ª': 'primeira', '2ª': 'segunda', '3ª': 'terceira', '1º': 'primeiro',
            '2º': 'segundo', '3º': 'terceiro'}
ROMANOS = {'XIX': 'dezenove', 'XX': 'vinte', 'XVIII': 'dezoito', 'II': 'segundo', 'III': 'terceiro', 'IX': 'nono'}


def voz():
    global _voz
    if _voz is None:
        from piper import PiperVoice
        pasta = os.path.join(CACHE, 'voz')
        os.makedirs(pasta, exist_ok=True)
        for ext in ('.onnx', '.onnx.json'):
            destino = os.path.join(pasta, VOZ + ext)
            if not os.path.exists(destino):
                urllib.request.urlretrieve(URL_VOZ + ext, destino)
        _voz = PiperVoice.load(os.path.join(pasta, VOZ + '.onnx'))
    return _voz


def falar_texto(texto):
    """Deixa o texto da legenda pronto para ser lido em voz alta."""
    t = texto.replace('**', '').replace('"', '').replace('“', '').replace('”', '')
    t = re.sub(r'(?<=\d)\.(?=\d{3}\b)', '', t)                      # 22.000 → 22000
    t = re.sub(r'\$ ?(\d+)', lambda m: m.group(1) + ' dólares', t)
    t = t.replace(' + ', ' mais ').replace('Guilherme I ', 'Guilherme primeiro ')
    t = re.sub(r'\b(\d{4})[–-](\d{2})\b', lambda m: f'{m.group(1)} a {m.group(1)[:2]}{m.group(2)}', t)
    t = re.sub(r'\b(\d{3,4})[–-](\d{3,4})\b', r'\1 a \2', t)
    t = re.sub(r'\b(\d{1,2})[–-](\d{1,2})/(\w{3})/(\d{4})', lambda m: f'{m.group(1)} a {m.group(2)} de {MESES.get(m.group(3).lower(), m.group(3))} de {m.group(4)}', t)
    t = re.sub(r'\b(\d{1,2})/(\w{3})\b', lambda m: f'{m.group(1)} de {MESES.get(m.group(2).lower(), m.group(2))}', t)
    t = re.sub(r'\b([A-Za-z]{3})/(\d{4})', lambda m: f'{MESES.get(m.group(1).lower(), m.group(1))} de {m.group(2)}', t)
    for k, v in ORDINAIS.items():
        t = t.replace(k, v)
    t = re.sub(r'\bséc\. ', 'século ', t)
    t = re.sub(r'\b(XIX|XVIII|XX|III|II|IX)\b', lambda m: ROMANOS[m.group(1)], t)
    t = re.sub(r'(\d)%', r'\1 por cento', t)
    t = t.replace('×', ' contra ').replace('→', ', depois, ').replace('·', ',').replace('–', ', ').replace('—', ', ')
    t = t.replace('EUA', 'Estados Unidos').replace('UNESCO', 'Unesco')
    t = re.sub(r'\s*\(\s*', ', ', t).replace(')', ',')
    t = re.sub(r',\s*([,.:;!?])', r'\1', t)
    t = re.sub(r'\s+', ' ', t).strip(' ,')
    return t


def sintetizar(texto):
    """Fala de um trecho → bytes PCM 16 bits mono (com cache em disco)."""
    from piper import SynthesisConfig
    falado = falar_texto(texto)
    chave = hashlib.sha1((VOZ + falado).encode()).hexdigest()[:16]
    caminho = os.path.join(CACHE, 'voz', chave + '.wav')
    if not os.path.exists(caminho):
        v = voz()   # garante a pasta e o modelo antes de abrir o arquivo
        with wave.open(caminho, 'wb') as w:
            v.synthesize_wav(falado, w, syn_config=SynthesisConfig(length_scale=1.05))
    with wave.open(caminho, 'rb') as w:
        return w.readframes(w.getnframes())


def preparar(video):
    """Sintetiza a fala de cada cena e estica as cenas curtas demais."""
    falas = []
    for cena in video.cenas:
        pcm = sintetizar(cena.narracao) if cena.narracao else b''
        seg = len(pcm) / 2 / TAXA
        if pcm:
            cena.dur = max(cena.dur, ANTES + seg + DEPOIS)
        falas.append(pcm)
    return falas


def trilha(videos, saida):
    """WAV com as falas posicionadas no início de cada cena (mesma contagem de quadros do vídeo)."""
    blocos = []
    for v in videos:
        for cena, pcm in zip(v.cenas, preparar(v)):
            n = int(round(cena.dur * FPS)) * TAXA // FPS   # amostras, alinhado aos quadros
            ini = int(ANTES * TAXA) if pcm else 0
            corpo = (b'\0\0' * ini + pcm)[:n * 2]
            blocos.append(corpo + b'\0\0' * (n - len(corpo) // 2))
    with wave.open(saida, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(TAXA)
        w.writeframes(b''.join(blocos))
