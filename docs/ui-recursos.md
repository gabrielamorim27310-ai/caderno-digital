# Recursos de UI — react-bits e 21st.dev

Levantamento das duas fontes indicadas para deixar o Caderno Digital mais bonito
e interativo. Documento de referência: nada aqui está plugado nas páginas ainda.

- **react-bits** — https://github.com/DavidHDev/react-bits
- **21st.dev** — https://21st.dev

---

## O problema de compatibilidade (leia antes de escolher qualquer coisa)

Este site é **HTML + CSS + JS puro**. Não há build, bundler, npm install nem React:

| Nosso stack | react-bits / 21st.dev |
|---|---|
| 9 páginas `.html` estáticas | React 19 + JSX |
| `styles/shared.css` com variáveis CSS | Tailwind CSS 4 |
| `scripts/*.js` sem dependências | gsap, three, ogl, motion, matter-js |
| Deploy estático (Vercel) | Vite build |

Ou seja: **nenhum componente das duas fontes é copiar-e-colar aqui.** Eles servem
de três formas, em ordem de custo:

1. **Portar o efeito** — reescrever em CSS/JS puro. Viável para tudo que é
   CSS-only ou usa só `useState`/`useEffect` simples. É a via principal.
2. **Usar como referência visual** — abrir a demo, copiar a ideia, implementar do zero.
3. **Migrar o site para React** — não recomendado; joga fora a simplicidade atual.

---

## react-bits — catálogo (166 componentes)

Classificação por dependência, que é o que determina se dá para portar:

| Dependência | Qtd | Portável para vanilla? |
|---|---|---|
| `ogl` (WebGL) | 44 | ❌ exigiria a lib inteira |
| React puro (hooks, sem lib) | 38 | ✅ **sim, direto** |
| `gsap` | 34 | ⚠️ parcial — muitos viram CSS animation |
| `three` (WebGL 3D) | 24 | ❌ pesado demais |
| `motion` (framer-motion) | 20 | ⚠️ parcial — a maioria vira CSS transition |
| CSS puro | 4 | ✅ **copiar o CSS e pronto** |
| `matter-js` (física) | 1 | ❌ |

### ✅ Aproveitáveis — CSS puro (copiar direto)

| Componente | Efeito |
|---|---|
| `StarBorder` | borda com brilho girando ao redor do elemento |
| `GlareHover` | reflexo diagonal cruzando o card no hover |
| `GlitchText` | texto com deslocamento RGB tipo glitch |
| `GlassIcons` | ícones com fundo de vidro fosco |

### ✅ Aproveitáveis — React puro, lógica simples de portar

**Texto:** `CurvedLoop`, `DepthText`, `EchoText`, `FuzzyText`, `ParticleText`,
`SplitFlapText`, `TextPressure`

**Interação:** `ClickSpark`, `CursorGrid`, `ElectricBorder`, `GradualBlur`,
`LogoLoop`, `Magnet`, `MagnetLines`, `Noise`, `PixelSwap`, `ScrollExpand`,
`SplashCursor`

**Componentes:** `CurvedInput`, `DomeGallery`, `DriftWall`, `Folder`,
`GlassSurface`, `GooeyNav`, `InfiniteMenu`, `LineSidebar`, `OptionWheel`,
`PixelCard`, `ProfileCard`, `ReflectiveCard`, `ScrollStack`, `SpotlightCard`

**Fundos:** `DotField`, `LetterGlitch`, `Lightning`, `ShapeGrid`, `Waves`

### ⚠️ Valem o esforço de portar (gsap/motion → CSS + IntersectionObserver)

`AnimatedContent`, `FadeContent`, `ScrollReveal`, `ScrollFloat`, `BlurText`,
`SplitText`, `CountUp`, `Counter`, `ShinyText`, `GradientText`, `RotatingText`,
`TextType`, `DecryptedText`, `ScrambledText`, `TiltedCard`, `Dock`,
`AnimatedList`, `Stepper`, `Masonry`, `CardSwap`, `PillNav`, `StaggeredMenu`

Quase todos são "anima quando entra na viewport" ou "anima no hover" — o que em
vanilla é `IntersectionObserver` + `transition`, não precisa de gsap.

### ❌ Descartar

Os 68 componentes com `three`/`ogl` (`Aurora`, `Galaxy`, `Silk`, `Plasma`,
`Hyperspeed`, `LiquidEther`, `Prism`, `Balatro`, `Iridescence`, `Orb`…) são
shaders WebGL. Trazem 500KB+ de biblioteca, esquentam o notebook e não combinam
com um caderno de estudos que precisa carregar rápido no celular. **Muitos desses
fundos têm equivalente aceitável em CSS puro** — ver `styles/effects.css`.

---

## 21st.dev

Registry comunitário com 12.000+ componentes React (2.000+ blocos de marketing,
2.100+ de UI), publicados por ~700 design engineers.

**Como funciona:** cada componente vira um *prompt* pronto para colar em um agente
(Claude Code, Cursor, v0), que reconstrói o componente já adaptado ao stack do
projeto. Também há instalação clássica via CLI do shadcn.

**Requisitos:** React + Tailwind + convenções do shadcn/ui. **Nada disso existe aqui.**

**Limitação prática:** o plano gratuito dá **2 cópias por dia**. Só navegar é livre.

**Como usar mesmo assim:** o modelo de "prompt em vez de pacote" é justamente o que
funciona no nosso caso — dá para pedir a versão em HTML/CSS/JS puro em vez da versão
React. Categorias que interessam para o caderno:

- **Cards / galerias** — as grades de matérias do `index.html`
- **Navigation** — a nav e o `back-link` de cada página
- **Accordions** — os `.accordion-content` das páginas de conteúdo
- **AI chat** — o widget do Nêuron (`#chat-panel`)
- **Backgrounds / gradients** — o `.hero` de cada matéria
- **Progress / steppers** — a `.progress-bar` e o topbar dos quizzes

---

## Recomendações concretas para este site

Em ordem de retorno sobre esforço:

**1. Revelação ao rolar** (`FadeContent`/`AnimatedContent`/`ScrollReveal`)
Seções aparecendo suavemente conforme o aluno rola. ~15 linhas de
`IntersectionObserver`. É o que mais muda a percepção do site inteiro de uma vez.

**2. Spotlight nos cards de matéria** (`SpotlightCard`)
Um brilho que segue o mouse nos cards do `index.html`. CSS + 3 linhas de JS.

**3. Contador animado nos quizzes** (`CountUp`)
A nota final subindo de 0 até o valor em vez de aparecer pronta.

**4. Glare hover nos cards** (`GlareHover`)
Reflexo diagonal no hover. CSS puro, zero JS.

**5. Fundo de hero em CSS** (alternativa a `Aurora`/`Silk`)
Gradiente animado sobre o padrão `cross+` que já existe no `.hero::before`.

**6. Texto do hero com brilho** (`ShinyText`/`GradientText`)
No `<h1>` de cada matéria, respeitando a `--primary` da página.

**7. Borda elétrica no botão do chat** (`StarBorder`/`ElectricBorder`)
Chama atenção para o Nêuron sem ser intrusivo.

### Cuidados

- **`prefers-reduced-motion`** — respeitar sempre; parte dos alunos usa.
- **Não animar o conteúdo de estudo em si** — o texto das matérias precisa ser
  legível e imprimível (já existe um `@media print` no `shared.css`).
- **Manter as variáveis por página** — cada matéria tem sua `--primary`; todo
  efeito novo deve consumir a variável, nunca cor fixa.
- **Peso** — o site hoje tem 178 linhas de CSS/JS no total. Vale manter essa ordem
  de grandeza.

---

## O que já está pronto no repo

| Arquivo | O que é |
|---|---|
| `styles/effects.css` | 10 efeitos portados para CSS puro, usando as variáveis da página |
| `scripts/effects.js` | comportamento dos efeitos que precisam de JS (~200 linhas, zero dependências) |
| `docs/demo-efeitos.html` | página de demonstração — abra para ver todos funcionando e escolher |

**Nada disso está importado em nenhuma página ainda** — é opt-in. As instruções
de uso estão no cabeçalho do `effects.css`.

### Efeitos disponíveis

| Classe | Efeito | Origem no react-bits |
|---|---|---|
| `.fx-reveal` (+ `.fx-stagger`) | aparece ao entrar na tela, em cascata | FadeContent / ScrollReveal |
| `.fx-spotlight` | brilho radial seguindo o cursor | SpotlightCard |
| `.fx-glare` | reflexo diagonal no hover | GlareHover |
| `.fx-starborder` | brilho percorrendo a borda | StarBorder |
| `.fx-shiny` | brilho varrendo o texto | ShinyText |
| `.fx-gradient-text` | gradiente animado no texto | GradientText |
| `.fx-aurora` | fundo de aurora em CSS | Aurora (sem WebGL) |
| `.fx-dotgrid` | fundo de grade de pontos | DotGrid |
| `.fx-magnet` | elemento atraído pelo cursor | Magnet |
| `.fx-tilt` | card inclinando com o cursor | TiltedCard |
| `.fx-count` | contador animado até o valor | CountUp |
| `.fx-scramble` | texto embaralhado que se resolve | DecryptedText |
| `.fx-spark` | faíscas no ponto do clique | ClickSpark |

Todos respeitam `prefers-reduced-motion` e saem do caminho no `@media print`.
Os `.fx-reveal` só ficam invisíveis se o `effects.js` tiver carregado (ele marca
`<html class="fx-ready">`), então uma falha no JS nunca esconde conteúdo.

Testado no Chromium: os 13 efeitos rodam sem erro de console.
