// montar-pagina.mjs — monta filosofia-3tri.html e o artefato a partir das fontes desta pasta.
// Uso: node ferramentas/filosofia/montar-pagina.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { quizHtml } from '../quiz.mjs';
import { artefato } from '../artefato-base.mjs';
const AQUI = dirname(fileURLToPath(import.meta.url)), RAIZ = join(AQUI, '..', '..');
const ler = f => readFileSync(join(AQUI, f), 'utf8');

const Q = [
  ['A pergunta "sou ou estou sendo?" expressa o problema da identidade porque', [
    'o verbo "ser" só existe na língua portuguesa.',
    'opõe uma identidade como permanência a uma identidade como processo de mudança.',
    'mostra que a identidade depende apenas da opinião dos outros.',
    'prova que nada no ser humano muda ao longo do tempo.',
    'reduz a identidade aos dados que produzimos nas redes.'], 'b',
    '"Sou" sugere algo fixo (linha de Parmênides); "estou sendo", algo em devir (linha de Heráclito). O problema é saber o que permanece enquanto tudo muda.'],
  ['"Ninguém se banha duas vezes no mesmo rio." A frase de Heráclito afirma que', [
    'o rio é uma ilusão criada pelos sentidos.',
    'a água é a arkhé de todas as coisas.',
    'a realidade é fluxo: o rio e a pessoa mudam constantemente.',
    'só a razão permite conhecer o Ser imóvel.',
    'o movimento é causado pela junção de átomos.'], 'c',
    'Devir: tudo flui. A ilusão dos sentidos e o Ser imóvel são de Parmênides; átomos, de Demócrito.'],
  ['Para Parmênides, a mudança que percebemos', [
    'é a lei que ordena o mundo (logos).',
    'é a passagem da potência ao ato.',
    'é o resultado da luta dos contrários.',
    'é ilusão dos sentidos, pois o Ser é uno, eterno e imóvel.',
    'é produzida pelas transformações econômicas.'], 'd',
    '"O Ser é, o não-ser não é." Mudar seria passar do ser ao não-ser; só a razão (via da verdade) alcança o Ser.'],
  ['O princípio de identidade (A = A) e o de não contradição têm raiz no pensamento de', [
    'Parmênides.', 'Heráclito.', 'Hegel.', 'Marx.', 'Byung-Chul Han.'], 'a',
    'O que é, é; algo não pode ser e não ser ao mesmo tempo. Hegel é justamente quem aceita a contradição.'],
  ['Demócrito concilia Heráclito e Parmênides ao afirmar que', [
    'existem dois mundos, um permanente e outro em movimento.',
    'a essência está nas coisas e o movimento é a passagem da potência ao ato.',
    'a contradição entre tese e antítese gera a síntese.',
    'os átomos são eternos e imutáveis, e a mudança vem do seu movimento e recombinação no vazio.',
    'o real é racional e o racional é real.'], 'd',
    'Átomos imutáveis (Parmênides) que se movem e se combinam (Heráclito). Dois mundos é Platão; potência e ato, Aristóteles.'],
  ['Sobre o vazio no atomismo, é correto dizer que', [
    'é o "nada" absoluto, e por isso não existe.',
    'é ausência de átomos, mas existe: é o espaço necessário ao movimento.',
    'é formado por átomos muito pequenos.',
    'é o mundo inteligível onde ficam as Ideias.',
    'é uma ilusão dos sentidos, como dizia Parmênides.'], 'b',
    'Um não-ser que existe: aqui Demócrito discorda de Parmênides.'],
  ['Ao ver um lápis "torto" dentro de um copo d\'água, para Demócrito,', [
    'os sentidos mentem e devem ser descartados.',
    'o lápis realmente se curvou.',
    'o conhecimento sensível mostra a aparência, e o racional explica o fenômeno.',
    'só a reminiscência pode corrigir o erro.',
    'trata-se de um dado que o algoritmo deve medir.'], 'c',
    'O sensível não é falso nem pior: fica nas aparências. A razão explica (refração da luz).'],
  ['No dualismo de Platão, o mundo sensível', [
    'é permanente e serve de modelo para tudo.',
    'é onde ficam o Bem, a Justiça, a Beleza e a Verdade.',
    'é conhecido por episteme.',
    'não tem nenhuma relação com as Ideias.',
    'é instável e corruptível, uma cópia imperfeita das Ideias, ligado à doxa.'], 'e',
    'O sensível muda em relação às Ideias perfeitas do mundo inteligível. Pelos sentidos temos só opinião (doxa).'],
  ['Para Platão, as essências são alcançadas', [
    'pela observação das coisas concretas.',
    'pela soma dos dados coletados.',
    'apenas pela razão, por reminiscência e dialética.',
    'pelos sentidos bem treinados.',
    'pela luta de classes.'], 'c',
    'A alma relembra as Ideias (reminiscência) e o diálogo sobe das opiniões à essência (dialética). Abstrair das coisas concretas é Aristóteles.'],
  ['A principal divergência entre Platão e Aristóteles sobre as essências é', [
    'Aristóteles não acredita em essências.',
    'a localização: para Platão, no mundo inteligível; para Aristóteles, nas próprias coisas.',
    'Platão acha que a essência se conhece pelos sentidos.',
    'Aristóteles acha que a essência muda o tempo todo.',
    'Platão diz que as essências são feitas de átomos.'], 'b',
    'Os dois aceitam essências. Aristóteles recusa o dualismo: a essência está nas coisas, homens e ações do mundo físico.'],
  ['"A semente já possui a essência de uma árvore." Nesse exemplo, o movimento é', [
    'a ilusão dos sentidos.',
    'a separação dos átomos.',
    'a cópia imperfeita de uma Ideia.',
    'a passagem da potência ao ato, uma mudança qualitativa.',
    'o choque entre tese e antítese.'], 'd',
    'Semente = árvore em potência; árvore = forma em ato. Muda (Heráclito), mas a essência permanece (Parmênides).'],
  ['O primeiro motor imóvel de Aristóteles', [
    'é o Deus cristão que criou o mundo do nada.',
    'é o átomo indivisível.',
    'é ato puro, sem potência, e move sem ser movido.',
    'é o Espírito Absoluto que guia a história.',
    'é a base econômica da sociedade.'], 'c',
    'Evita a regressão infinita de movimentos. Não é o Deus cristão: Tomás de Aquino adaptou o argumento depois.'],
  ['"O que é racional é real, e o que é real é racional." Com essa frase, Hegel', [
    'afirma que pensamento e realidade têm a mesma estrutura, e a razão se realiza na história.',
    'defende que só o que é material existe.',
    'nega que a história tenha qualquer lógica.',
    'retoma o princípio de não contradição de Parmênides.',
    'critica o idealismo de Marx.'], 'a',
    'Idealismo: nada é por acaso; a razão (o Espírito) se realiza no mundo, e o real pode ser entendido pela razão.'],
  ['Ao contrário da lógica grega, Hegel', [
    'separa quente e frio como coisas independentes.',
    'aceita a contradição como aquilo que rege e move a realidade.',
    'afirma que o Ser é imóvel.',
    'considera os sentidos a única fonte da verdade.',
    'diz que a história é linear e sem conflitos.'], 'b',
    'Nada pode ser pensado sem o seu contrário (quente × frio). Aqui Hegel retoma Heráclito.'],
  ['No exemplo da Revolução Francesa, a síntese é', [
    'o feudalismo.', 'o Antigo Regime.', 'a Revolução.', 'a burguesia.', 'Napoleão.'], 'e',
    'Tese: Antigo Regime; antítese: Revolução; síntese: Napoleão, que junta elementos dos dois. A síntese vira nova tese.'],
  ['Para Hegel, o progresso da humanidade é', [
    'linear e sem conflitos.',
    'cíclico, sempre voltando ao mesmo ponto.',
    'acumulativo e não linear, pelo choque de etapas, guiado pelo Espírito Absoluto.',
    'determinado apenas pela economia.',
    'uma ilusão dos sentidos.'], 'c',
    'Estágios que se chocam e se superam. A economia como motor é a leitura de Marx.'],
  ['A crítica de Marx a Hegel consiste em', [
    'abandonar a dialética e voltar à lógica de Aristóteles.',
    'manter a dialética, mas trocar as ideias pelas condições materiais como motor da história.',
    'afirmar que o Espírito Absoluto está nas coisas.',
    'negar que exista conflito na história.',
    'dizer que só os dados revelam a verdade.'], 'b',
    'Marx diz que em Hegel a dialética está "de cabeça para baixo" e a põe "de pé": materialismo histórico-dialético.'],
  ['"Não é a consciência dos homens que determina o seu ser; é o seu ser social que determina a sua consciência." A frase significa que', [
    'as ideias criam a realidade econômica.',
    'cada pessoa escolhe livremente sua consciência.',
    'a consciência é formada pelas condições materiais e pelo lugar que se ocupa na produção.',
    'a sociedade não influencia o indivíduo.',
    'o Espírito Absoluto define a identidade.'], 'c',
    'Materialismo: a infraestrutura (economia) determina a superestrutura (leis, religião, ideias) e a consciência.'],
  ['Para Byung-Chul Han, "infocracia" é', [
    'o governo direto do povo em praça pública.',
    'o fim de toda forma de poder.',
    'a censura feita apenas pelo Estado.',
    'o "governo da informação": o domínio dos dados se torna decisivo na democracia.',
    'um sinônimo de dataísmo no sentido de ciência exata.'], 'd',
    'Empresas e Estados detêm dados com potencial de controle e manipulação da população.'],
  ['Segundo Han, os algoritmos intensificam a polarização porque', [
    'eliminam todas as fontes de informação.',
    'funcionam como bolha isolante, entregando informação segundo o nicho e o perfil do usuário.',
    'obrigam todos a ver as mesmas notícias.',
    'proíbem o debate de forma visível.',
    'tornam a esfera pública obrigatoriamente física.'], 'b',
    'Há múltiplas fontes, mas cada público recebe o seu nicho. Sem contato com o diferente, o debate democrático enfraquece.'],
  ['Han diferencia o poder de antes e o atual. É correto afirmar que', [
    'o poder atual é negativo e visível, baseado em proibições.',
    'o poder antigo se baseava em dados e algoritmos.',
    'o poder atual se apoia na informação e na autoexploração do próprio indivíduo.',
    'hoje não há mais nenhuma forma de controle.',
    'o poder atual depende de disciplina e obediência explícitas.'], 'c',
    'Antes: proibição, obediência, disciplina. Hoje: "você pode", e o indivíduo se expõe e se explora.'],
  ['Pesquisar um produto e depois receber anúncios até acabar comprando ilustra, em Han,', [
    'a liberdade plena do consumidor.',
    'a aparência da liberdade: um consumo indiretamente manipulado (psicopolítica).',
    'o primeiro motor imóvel.',
    'o conhecimento racional de Demócrito.',
    'a síntese dialética de Hegel.'], 'b',
    'O agente se sente livre, mas é influenciado por dados que ele mesmo gerou. Contradiz a ética aristotélica, em que o agente moral detém o poder.'],
  ['O dataísmo é criticado por Han porque', [
    'os relógios inteligentes medem errado.',
    'a tecnologia deve ser totalmente proibida.',
    'reduz o ser humano a dados e leva à perda do pensamento crítico; há coisas imensuráveis.',
    'os dados são poucos para governar.',
    'impede o capitalismo de funcionar.'], 'c',
    'Usar dados como principal fonte da verdade. Liberdade, amor e felicidade são subjetivos e imensuráveis.'],
  ['O "positivismo em excesso" das anotações sobre Han refere-se a', [
    'a filosofia de Auguste Comte.',
    'o otimismo científico do século XIX.',
    'a omissão coletiva de sentimentos "negativos" em nome de uma imagem social idealizada, que gera esgotamento.',
    'a crença de que só os sentidos dão conhecimento.',
    'a ideia de que o real é racional.'], 'c',
    'Excesso de positividade: a busca pelo "perfeito" gera indivíduos esgotados, transtornados e desconectados. Não é o positivismo de Comte.'],
  ['Entre as "soluções" propostas a partir de Han, NÃO está', [
    'diminuir o tempo de tela.',
    'retomar a autonomia sobre as próprias emoções.',
    'reestabelecer laços de confiança social.',
    'resistir à ditadura dos dados.',
    'confiar nas métricas dos aplicativos como medida da felicidade.'], 'e',
    'Isso seria o próprio dataísmo que Han critica.'],
];

const corpo = ler('pagina-corpo.html').replace('QUIZ_AQUI', quizHtml(Q));
const widgets = ler('pagina-widgets.js');
const cabeca = ler('molde-cabeca.html')
  .replace(/<title>[^<]*<\/title>/, '<title>Filosofia 3º Tri · Identidade: de Heráclito a Byung-Chul Han 2026</title>')
  .replace('<link rel="stylesheet" href="styles/ios.css">', '<link rel="stylesheet" href="styles/ios.css">\n<link rel="stylesheet" href="styles/labs.css">');
const pagina = cabeca + corpo + `\n<script>\n${widgets}\n</script>\n` + ler('molde-cauda.html');
writeFileSync(join(RAIZ, 'filosofia-3tri.html'), pagina.replace(/\r?\n/g, '\r\n'));
writeFileSync(join(AQUI, 'artefato', 'filosofia-3tri.html'), artefato({
  titulo: 'Filosofia 3º Tri', tint: ['#906400', '#f5bf3c'], corpo, widgets,
  css: [readFileSync(join(RAIZ, 'styles/labs.css'), 'utf8')],
}));
console.log('filosofia-3tri.html + artefato montados:', Q.length, 'perguntas; gabarito', Q.map(q => q[2]).join(''));
