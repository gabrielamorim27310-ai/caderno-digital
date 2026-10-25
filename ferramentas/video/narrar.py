#!/usr/bin/env python3
"""narrar.py — narração dos vídeos (voz gratuita, roda offline)

Padrão: Kokoro, voz pt-BR "pm_alex" (mais natural; a mesma dos vídeos de
História). Alternativa: NARRADOR=piper (voz "faber").

Lê o campo "fala" (e "falaResposta" das perguntas) de cada cena do
roteiro e grava audio/<pagina>/<NN>.wav, que o gerar.mjs usa para
montar o vídeo. Áudios que já existem não são refeitos (use --forcar).

Uso (na pasta ferramentas/video):
  python3 narrar.py roteiros/sociologia-3tri.json [--forcar]

Instala sozinho, na primeira vez, o Kokoro (pip) ou o Piper (.venv/) e
baixa a voz em vozes/ (as duas pastas ficam fora do git).
"""
import json, os, re, subprocess, sys, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
VENV = os.path.join(AQUI, '.venv')
PIPER = os.path.join(VENV, 'bin', 'piper')
VOZ = os.environ.get('VOZ_PIPER', 'pt_BR-faber-medium')
DIR_VOZES = os.path.join(AQUI, 'vozes')
URL_VOZ = 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/pt/pt_BR/{0}/{1}/{2}'
NARRADOR = os.environ.get('NARRADOR', 'kokoro')
VOZ_KOKORO = 'pm_alex'
URL_KOKORO = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
_kokoro = None


def preparar():
    os.makedirs(DIR_VOZES, exist_ok=True)
    if NARRADOR == 'kokoro':
        try:
            import kokoro_onnx  # noqa: F401
        except ImportError:
            print('Instalando o Kokoro (só na primeira vez)...')
            subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'kokoro-onnx'], check=True)
        for arq in ('kokoro-v1.0.onnx', 'voices-v1.0.bin'):
            if not os.path.exists(os.path.join(DIR_VOZES, arq)):
                print('Baixando', arq, '...')
                urllib.request.urlretrieve(URL_KOKORO + arq, os.path.join(DIR_VOZES, arq))
        return
    if not os.path.exists(PIPER):
        print('Instalando o Piper em .venv/ (só na primeira vez)...')
        subprocess.run([sys.executable, '-m', 'venv', VENV], check=True)
        subprocess.run([os.path.join(VENV, 'bin', 'pip'), 'install', '-q', 'piper-tts'], check=True)
    _, nome, qualidade = VOZ.split('-')
    for ext in ('.onnx', '.onnx.json'):
        destino = os.path.join(DIR_VOZES, VOZ + ext)
        if not os.path.exists(destino):
            print('Baixando a voz', VOZ + ext, '...')
            urllib.request.urlretrieve(URL_VOZ.format(nome, qualidade, VOZ + ext), destino)


def limpar(texto):
    # o que aparece na tela não é lido igual: tira marcação e símbolos
    texto = re.sub(r'\*\*(.+?)\*\*', r'\1', texto)
    trocas = {'→': ' para ', '≠': ' é diferente de ', '·': ',', '×': ' versus ', '&': ' e '}
    for a, b in trocas.items():
        texto = texto.replace(a, b)
    return re.sub(r'\s+', ' ', texto).strip()


def falar(texto, saida):
    if NARRADOR == 'kokoro':
        global _kokoro
        import numpy as np, wave
        from kokoro_onnx import Kokoro
        if _kokoro is None:
            _kokoro = Kokoro(os.path.join(DIR_VOZES, 'kokoro-v1.0.onnx'), os.path.join(DIR_VOZES, 'voices-v1.0.bin'))
        amostras, taxa = _kokoro.create(limpar(texto), voice=VOZ_KOKORO, speed=1.0, lang='pt-br')
        with wave.open(saida, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(taxa)
            w.writeframes((np.clip(amostras, -1, 1) * 32000).astype('<i2').tobytes())
        return
    subprocess.run([PIPER, '-m', os.path.join(DIR_VOZES, VOZ + '.onnx'), '-f', saida,
                    '--sentence_silence', '0.35', '--length_scale', '1.05'],
                   input=limpar(texto).encode('utf-8'), check=True, capture_output=True)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        sys.exit('Uso: python3 narrar.py roteiros/<pagina>.json [--forcar]')
    forcar = '--forcar' in sys.argv
    roteiro = json.load(open(args[0], encoding='utf-8'))
    pasta = os.path.join(AQUI, 'audio', roteiro['pagina'])
    os.makedirs(pasta, exist_ok=True)

    pedidos = []
    for n, cena in enumerate(roteiro['cenas'], 1):
        if not cena.get('fala'):
            sys.exit(f'A cena {n} ({cena["tipo"]}) está sem "fala": todo vídeo tem narração.')
        pedidos.append((f'{n:02d}', cena['fala']))
        if cena['tipo'] == 'pergunta':
            if not cena.get('falaResposta'):
                sys.exit(f'A pergunta da cena {n} está sem "falaResposta".')
            pedidos.append((f'{n:02d}b', cena['falaResposta']))

    preparar()
    feitos = 0
    for nome, texto in pedidos:
        saida = os.path.join(pasta, nome + '.wav')
        if os.path.exists(saida) and not forcar:
            continue
        falar(texto, saida)
        feitos += 1
    print(f'{feitos} falas gravadas em {os.path.relpath(pasta, AQUI)} ({len(pedidos)} no total)')


if __name__ == '__main__':
    main()
