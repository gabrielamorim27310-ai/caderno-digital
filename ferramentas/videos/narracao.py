"""
narracao.py — Narração dos vídeos. Padrão: Kokoro (modelo aberto, voz pt-BR "pm_alex"),
local e grátis. Alternativas: NARRADOR=piper (voz "faber") ou NARRADOR=eleven
(trechos gravados na ElevenLabs, ver fatiar_eleven.py).

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
TAXA = 24000
ANTES, DEPOIS = 0.6, 0.9   # silêncio antes e depois da fala, em segundos

_voz = None
_kokoro = None
VOZ_KOKORO = 'pm_alex'
URL_KOKORO = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'

MESES = {'jan': 'janeiro', 'fev': 'fevereiro', 'mar': 'março', 'abr': 'abril', 'mai': 'maio', 'jun': 'junho',
         'jul': 'julho', 'ago': 'agosto', 'set': 'setembro', 'out': 'outubro', 'nov': 'novembro', 'dez': 'dezembro'}
ORDINAIS = {'13ª': 'décima terceira', '1ª': 'primeira', '2ª': 'segunda', '3ª': 'terceira', '1º': 'primeiro',
            '2º': 'segundo', '3º': 'terceiro'}
ROMANOS = {'XIX': 'dezenove', 'XX': 'vinte', 'XVIII': 'dezoito', 'XIII': 'treze', 'II': 'segundo', 'III': 'terceiro',
           'IV': 'quarto', 'IX': 'nono', 'X': 'décimo'}


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
    t = re.sub(r'([a-zç]+)/(\d{4})', r'\1 de \2', t)
    for k, v in ORDINAIS.items():
        t = t.replace(k, v)
    t = re.sub(r'\bséc\. ', 'século ', t)
    t = re.sub(r'\b(XIX|XVIII|XIII|XX|III|II|IV|IX|X)\b', lambda m: ROMANOS[m.group(1)], t)
    t = t.replace(' = ', ': ')
    t = re.sub(r'(\d)%', r'\1 por cento', t)
    t = t.replace('×', ' contra ').replace('→', ', depois, ').replace('·', ',').replace('–', ', ').replace('—', ', ')
    t = t.replace('EUA', 'Estados Unidos').replace('UNESCO', 'Unesco')
    t = re.sub(r'\s*\((\d{4})\)', r', em \1,', t)
    t = re.sub(r'\s*\(\s*', ', ', t).replace(')', ',')
    t = re.sub(r"(\d+)°(\d+)'", r'\1 graus e \2 minutos', t)
    t = re.sub(r'\b(\d{4})/(\d{4})\b', r'\1 e \2', t)
    t = re.sub(r',\s*([,.:;!?])', r'\1', t)
    t = re.sub(r'([.:;!?])\s*,\s*', r'\1 ', t)
    t = re.sub(r'(\d+)°', r'\1 graus', t).replace(', SP,', ', São Paulo,').replace(', SP.', ', São Paulo.')
    t = re.sub(r'\s+([,.:;!?])', r'\1', t)
    t = re.sub(r'([.!?])\.+', r'\1', t)
    t = re.sub(r'\s+', ' ', t).strip(' ,')
    return t


NARRADOR = os.environ.get('NARRADOR', 'kokoro')


def kokoro():
    global _kokoro
    if _kokoro is None:
        from kokoro_onnx import Kokoro
        pasta = os.path.join(CACHE, 'voz')
        os.makedirs(pasta, exist_ok=True)
        for arq in ('kokoro-v1.0.onnx', 'voices-v1.0.bin'):
            if not os.path.exists(os.path.join(pasta, arq)):
                urllib.request.urlretrieve(URL_KOKORO + arq, os.path.join(pasta, arq))
        _kokoro = Kokoro(os.path.join(pasta, 'kokoro-v1.0.onnx'), os.path.join(pasta, 'voices-v1.0.bin'))
    return _kokoro


def caminho_fala(falado, narrador):
    nome = {'piper': VOZ, 'kokoro': 'kokoro-' + VOZ_KOKORO}.get(narrador, narrador)
    chave = hashlib.sha1((nome + falado).encode()).hexdigest()[:16]
    return os.path.join(CACHE, 'voz', chave + '.wav')


def _gravar(caminho, pcm16, taxa):
    with wave.open(caminho, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(taxa)
        w.writeframes(pcm16)


def sintetizar(texto):
    """Fala de um trecho → bytes PCM 16 bits mono em TAXA Hz (com cache em disco)."""
    falado = falar_texto(texto)
    caminho = caminho_fala(falado, NARRADOR)
    if not os.path.exists(caminho):
        os.makedirs(os.path.dirname(caminho), exist_ok=True)
        if NARRADOR == 'kokoro':
            import numpy as np
            amostras, taxa = kokoro().create(falado, voice=VOZ_KOKORO, speed=1.0, lang='pt-br')
            _gravar(caminho, (np.clip(amostras, -1, 1) * 32000).astype('<i2').tobytes(), taxa)
        elif NARRADOR == 'piper':
            from piper import SynthesisConfig
            v = voz()
            with wave.open(caminho, 'wb') as w:
                v.synthesize_wav(falado, w, syn_config=SynthesisConfig(length_scale=1.05))
        else:
            raise FileNotFoundError(f'Falta a fala gravada ({NARRADOR}) para: {falado[:80]}')
    with wave.open(caminho, 'rb') as w:
        taxa, pcm = w.getframerate(), w.readframes(w.getnframes())
    if taxa != TAXA:   # ex.: Piper grava em 22050 Hz
        import subprocess
        pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 's16le', '-ar', str(taxa), '-ac', '1', '-i', '-',
                              '-f', 's16le', '-ar', str(TAXA), '-ac', '1', '-'], input=pcm, capture_output=True, check=True).stdout
    return pcm


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
