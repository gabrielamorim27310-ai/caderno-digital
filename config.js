/* ═══════════════════════════════════════════════════════════
   config.js — Tokens de marca do projeto
   Altere aqui para rebrandar toda a aplicação de uma vez.
   ═══════════════════════════════════════════════════════════ */
var APP = {
  name:        'Caderno Digital',
  tagline:     '2ª série do Ensino Médio · 2026',
  author:      'Gabriel Amorim',
  ga:          'G-CL1RMGB3SN',
  aiName:      'Nêuron',
  aiEndpoint:  '/api/chat',
  year:        '2026',
  triAtual:    3,            // trimestre que o painel e o envio abrem primeiro
  school:      'Colégio Bandeirantes',
  grade:       '2ª série do Ensino Médio',
};

/* ═══════════════════════════════════════════════════════════
   MATÉRIAS — lista única usada pelo painel e pela barra lateral.
   Para adicionar um resumo: inclua um item aqui.
     id       nome do arquivo sem .html (também é a chave de "visitado")
     materia  chave da cor em styles/ios.css (--historia, --biologia...)
     status   'prova' | 'fora' (fora da prova) | 'breve' (em construção)
     extras   links adicionais mostrados junto da matéria
   ═══════════════════════════════════════════════════════════ */
var MATERIAS = [
  // 1º trimestre
  { tri: 1, id: 'historia-1tri',   materia: 'historia',   icone: '🏛️', nome: 'História',   desc: 'Antigo Regime & Brasil Colonial · Caps. 11, 14, 15, 16' },
  { tri: 1, id: 'geografia-1tri',  materia: 'geografia',  icone: '🌍', nome: 'Geografia',  desc: 'Globalização & Mundo Globalizado · Integração Mundial' },
  { tri: 1, id: 'portugues-1tri',  materia: 'portugues',  icone: '📖', nome: 'Português',  desc: 'Vocativo · Sintagmas · Paralelismo · Coesão · AGI' },
  { tri: 1, id: null,              materia: 'matematica', icone: '➗', nome: 'Matemática', desc: 'Em construção', status: 'breve' },
  { tri: 1, id: 'biologia-1tri',   materia: 'biologia',   icone: '🧬', nome: 'Biologia',   desc: 'Membrana · Citoesqueleto · Rota Secretora' },
  { tri: 1, id: null,              materia: 'fisica',     icone: '⚡', nome: 'Física',     desc: 'Em construção', status: 'breve' },
  { tri: 1, id: 'quimica-1tri',    materia: 'quimica',    icone: '🧪', nome: 'Química',    desc: 'Estequiometria, Oxirredução & Termoquímica · Caps. 1 a 10' },
  { tri: 1, id: 'filosofia-1tri',  materia: 'filosofia',  imagem: 'pensador.png', nome: 'Filosofia', desc: 'Ética e Moral' },
  { tri: 1, id: 'sociologia-1tri', materia: 'sociologia', icone: '🏙️', nome: 'Sociologia', desc: 'Adam Smith & Karl Marx · Caps. 1, 2' },

  // 2º trimestre
  { tri: 2, id: 'biologia-2tri',          materia: 'biologia',   icone: '🧬', nome: 'Biologia',   desc: 'Circulatório · Sangue e Linfa · Imunológico · Respiratório · Excretor', status: 'prova' },
  { tri: 2, id: 'geografia-2tri-america', materia: 'geografia',  icone: '🌍', nome: 'Geografia',  desc: 'Continente Americano', status: 'prova' },
  { tri: 2, id: 'sociologia-2tri',        materia: 'sociologia', icone: '🏙️', nome: 'Sociologia', desc: 'Weber · Poder & Dominação · Formas de Governo', status: 'prova' },
  { tri: 2, id: 'filosofia-2tri',         materia: 'filosofia',  imagem: 'pensador.png', nome: 'Filosofia', desc: 'Estoicismo · Patrística/Escolástica · Kant · Schopenhauer · Freud · Sartre · Utilitarismo', status: 'prova' },
  { tri: 2, id: 'ingles-2tri',            materia: 'ingles',     icone: '🔤', nome: 'Inglês C1',  desc: 'Inversion · Vocabulary Units 2 & 9 · Reading', status: 'prova',
    extras: [{ id: 'ingles-flashcards', nome: 'Flashcards' }] },
  { tri: 2, id: 'matematica-2tri',        materia: 'matematica', icone: '➗', nome: 'Matemática', desc: 'Combinatória · Trigonometria · Inequações', status: 'prova' },
  { tri: 2, id: 'historia-2tri',          materia: 'historia',   icone: '🏛️', nome: 'História',   desc: 'Rev. Francesa/Haiti · Napoleão · Viena · América Espanhola · Brasil Império', status: 'prova' },
  { tri: 2, id: 'geografia-2tri',         materia: 'geografia',  icone: '🌍', nome: 'Geografia · extra', desc: 'UE, Brexit, Relevo, Clima & Hidrografia', status: 'fora' },
  { tri: 2, id: 'quimica-2tri',           materia: 'quimica',    icone: '🧪', nome: 'Química',    desc: 'Funções Orgânicas · Isomeria Plana · Isomeria Espacial', status: 'fora' },
];
