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

Voz clonada (Chatterbox Multilingual, GPU NVIDIA): NARRADOR=chatterbox,
rodando com um Python que já tenha chatterbox-tts e PyTorch CUDA. A voz de
referência fica em vozes/minha-voz.wav (mono 24 kHz, fora do git; outra
com VOZ_REF=...). SEMENTE=n muda a tomada de uma fala que saiu ruim.
  NARRADOR=chatterbox <python-do-venv> narrar.py roteiros/<pagina>.json

Qwen3-TTS (a melhor voz grátis e local, desde 2026-11): NARRADOR=qwen, com o
Python de C:/Users/rafa_/tts-voz/qw. Não clona ninguém: em português usa uma
voz criada por descrição (vozes/qwen-pt-ref.wav + .txt, feita com
tts-voz/vozes_qwen.py); em inglês, a voz nativa VOZ_QWEN_EN (padrão Aiden).
  NARRADOR=qwen /c/Users/rafa_/tts-voz/qw/Scripts/python.exe narrar.py roteiros/<pagina>.json
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
VOZ_REF = os.environ.get('VOZ_REF', os.path.join(DIR_VOZES, 'minha-voz.wav'))
SEMENTE = int(os.environ.get('SEMENTE', '7'))
IDIOMA = 'pt'   # vem do roteiro ("idioma": "en" para Inglês)
_chatterbox = None


def preparar():
    os.makedirs(DIR_VOZES, exist_ok=True)
    if NARRADOR == 'qwen':
        try:
            import qwen_tts  # noqa: F401
        except ImportError:
            sys.exit('NARRADOR=qwen precisa do Python de tts-voz/qw (pip install qwen-tts, torch cu128).')
        return
    if NARRADOR == 'chatterbox':
        try:
            import chatterbox.mtl_tts  # noqa: F401
        except ImportError:
            sys.exit('NARRADOR=chatterbox precisa de um Python com chatterbox-tts e PyTorch CUDA.')
        if not os.path.exists(VOZ_REF):
            sys.exit(f'Falta a voz de referência: {VOZ_REF}')
        return
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
    if IDIOMA == 'en':
        trocas = {'→': ' to ', '≠': ' is different from ', '·': ',', '×': ' versus ', '&': ' and '}
    for a, b in trocas.items():
        texto = texto.replace(a, b)
    return re.sub(r'\s+', ' ', texto).strip()


def falar_chatterbox(texto, saida):
    # A voz clonada respira melhor com frases curtas: ":" e ";" viram ponto,
    # sem aspas, e cada frase é gerada à parte e emendada com uma pausa.
    global _chatterbox
    import numpy as np, torch, wave
    if _chatterbox is None:
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        _chatterbox = ChatterboxMultilingualTTS.from_pretrained(device='cuda')
        _chatterbox.prepare_conditionals(VOZ_REF, exaggeration=0.5)
    t = re.sub(r'\s*[:;]\s*', '. ', limpar(texto))
    t = re.sub(r'["“”‘’]', '', t)
    t = re.sub(r'\.\s+(\w)', lambda m: '. ' + m.group(1).upper(), t)
    sr = _chatterbox.sr
    partes = []
    # frase curtíssima ("C." de uma resposta) quebra o Chatterbox: junta com a seguinte
    frases = []
    for f in (f for f in re.split(r'(?<=[.!?])\s+', t) if f):
        if frases and len(frases[-1]) < 15:
            frases[-1] += ' ' + f
        else:
            frases.append(f)
    for i, frase in enumerate(frases):
        torch.manual_seed(SEMENTE + i)
        w = _chatterbox.generate(frase, language_id=IDIOMA, exaggeration=0.5, cfg_weight=0.5, temperature=0.8)
        partes += [w.squeeze(0).cpu().numpy(), np.zeros(int(sr * 0.28), dtype=np.float32)]
    amostras = np.concatenate(partes[:-1])
    amostras *= 0.89 / max(1e-6, float(np.abs(amostras).max()))  # pico em -1 dB
    with wave.open(saida, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(amostras, -1, 1) * 32000).astype('<i2').tobytes())


_qwen = {}


def falar_qwen(texto, saida):
    # Qwen3-TTS (grátis, local, GPU). Sem clonar ninguém:
    #  - pt: voz criada pelo VoiceDesign, salva em vozes/qwen-pt-ref.wav + .txt
    #    (o clone dessa referência mantém a mesma voz em todas as falas);
    #  - en: voz nativa do CustomVoice (VOZ_QWEN_EN, padrão Aiden), sem sotaque.
    import numpy as np, torch, wave
    from qwen_tts import Qwen3TTSModel
    kw = dict(device_map='cuda:0', dtype=torch.bfloat16, attn_implementation='sdpa')
    frases = [f for f in re.split(r'(?<=[.!?])\s+', limpar(texto)) if f]
    if IDIOMA == 'en':
        if 'en' not in _qwen:
            _qwen['en'] = Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice', **kw)
        torch.manual_seed(SEMENTE)
        wavs, sr = _qwen['en'].generate_custom_voice(
            text=frases, language=['English'] * len(frases), speaker=[os.environ.get('VOZ_QWEN_EN', 'Aiden')] * len(frases),
            instruct=['A friendly, clear teacher explaining to high school students, natural pace.'] * len(frases))
    else:
        if 'pt' not in _qwen:
            ref = os.path.join(DIR_VOZES, 'qwen-pt-ref.wav')
            if not os.path.exists(ref):
                sys.exit('Falta vozes/qwen-pt-ref.wav (+ .txt): gere com tts-voz/vozes_qwen.py e copie a escolhida.')
            m = Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-Base', **kw)
            ref_txt = open(ref[:-4] + '.txt', encoding='utf-8').read().strip()
            _qwen['pt'] = (m, m.create_voice_clone_prompt(ref_audio=ref, ref_text=ref_txt))
        m, prompt = _qwen['pt']
        torch.manual_seed(SEMENTE)
        wavs, sr = m.generate_voice_clone(text=frases, language=['Portuguese'] * len(frases), voice_clone_prompt=prompt)
    pausa = np.zeros(int(sr * 0.25), dtype=np.float32)
    amostras = np.concatenate([x for w in wavs for x in (np.asarray(w, dtype=np.float32), pausa)][:-1])
    amostras *= 0.89 / max(1e-6, float(np.abs(amostras).max()))
    with wave.open(saida, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(amostras, -1, 1) * 32000).astype('<i2').tobytes())


def falar(texto, saida):
    if NARRADOR == 'qwen':
        return falar_qwen(texto, saida)
    if NARRADOR == 'chatterbox':
        return falar_chatterbox(texto, saida)
    if NARRADOR == 'kokoro':
        global _kokoro
        import numpy as np, wave
        from kokoro_onnx import Kokoro
        if _kokoro is None:
            _kokoro = Kokoro(os.path.join(DIR_VOZES, 'kokoro-v1.0.onnx'), os.path.join(DIR_VOZES, 'voices-v1.0.bin'))
        amostras, taxa = _kokoro.create(limpar(texto), voice=VOZ_KOKORO if IDIOMA == 'pt' else 'am_michael', speed=1.0, lang='pt-br' if IDIOMA == 'pt' else 'en-us')
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
    global IDIOMA
    roteiro = json.load(open(args[0], encoding='utf-8'))
    IDIOMA = roteiro.get('idioma', 'pt')
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
