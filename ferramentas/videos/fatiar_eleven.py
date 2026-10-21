"""
fatiar_eleven.py — Corta a narração da ElevenLabs (um áudio por vídeo, com pausas
de 2 s entre as cenas) em um trecho por cena e guarda no cache de narracao.py.

    python fatiar_eleven.py <lote> <arquivo.mp3>

<lote> é a chave em lotes.json (ex.: unificacao-italia). Os trechos são salvos
com a mesma chave que narracao.sintetizar() procura quando NARRADOR=eleven.
"""

import json
import os
import re
import subprocess
import sys
import tempfile
import wave

import narracao

PAUSA_MIN = 1.4   # s de silêncio que contam como troca de cena


def silencios(caminho):
    saida = subprocess.run(['ffmpeg', '-i', caminho, '-af', f'silencedetect=noise=-40dB:d={PAUSA_MIN}', '-f', 'null', '-'],
                           capture_output=True, text=True).stderr
    ini = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', saida)]
    fim = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', saida)]
    return list(zip(ini, fim))


def principal(lote, mp3, lotes_json):
    textos = json.load(open(lotes_json, encoding='utf-8'))[lote]
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, 'tudo.wav')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-ac', '1', '-ar', str(narracao.TAXA), wav], check=True)
        with wave.open(wav, 'rb') as w:
            pcm = w.readframes(w.getnframes())
        total = len(pcm) / 2 / narracao.TAXA
        cortes = [(a + b) / 2 for a, b in silencios(wav) if a > 0.3 and b < total - 0.3]
        if len(cortes) != len(textos) - 1:
            sys.exit(f'{lote}: {len(cortes) + 1} trechos detectados, esperava {len(textos)}. Pausas: {silencios(wav)}')
        limites = [0.0] + cortes + [total]
        os.makedirs(os.path.join(narracao.CACHE, 'voz'), exist_ok=True)
        for texto, a, b in zip(textos, limites, limites[1:]):
            trecho = pcm[int(a * narracao.TAXA) * 2:int(b * narracao.TAXA) * 2]
            # tira o silêncio das pontas (narracao.py põe as próprias pausas)
            amostras = memoryview(trecho).cast('h')
            vivos = [i for i in range(0, len(amostras), 220) if abs(amostras[i]) > 300]
            if vivos:
                trecho = trecho[max(vivos[0] - 2200, 0) * 2:(vivos[-1] + 2200) * 2]
            with wave.open(narracao.caminho_fala(texto, 'eleven'), 'wb') as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(narracao.TAXA)
                w.writeframes(trecho)
        print(f'{lote}: {len(textos)} trechos, {total:.0f}s')


if __name__ == '__main__':
    principal(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else 'lotes.json')
