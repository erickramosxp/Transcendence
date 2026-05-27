# Design System e Estilização (Tailwind CSS v4)

A identidade visual e a estética moderna do Transcendence (Videa) são estruturadas sobre um **Design System customizado** que tira proveito máximo dos recursos reativos e modernos do **Tailwind CSS v4** e de componentes acessíveis primitivos baseados em **Radix UI**.

---

## 1. Localização do Código
- **Estilos Globais**: `src/styles/` (especialmente `src/styles/index.css`)
- **Componentes do Sistema**: `src/design-system/`
- **Ferramentas Storybook**: `src/stories/`

---

## 2. Tokens de Design (Tailwind v4 CSS variables)
O Tailwind CSS v4 simplifica a configuração adotando uma abordagem puramente baseada em propriedades personalizadas CSS declaradas diretamente no `@theme` no arquivo `index.css`:

```css
@theme {
  --color-brand-primary: hsl(var(--brand-primary));
  --color-brand-secondary: hsl(var(--brand-secondary));
  --color-bg-app: hsl(var(--bg-app));
  --color-text-main: hsl(var(--text-main));
  
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  
  --radius-custom: 12px;
}
```

Essa abordagem baseada em variáveis de CSS nativas permite que o tema gráfico seja modificado dinamicamente no nível do documento `HTML` (ex: trocar cores principais ou fontes simplesmente injetando variáveis adicionais em nível de runtime).

---

## 3. Componentes Primitivos e Acessibilidade (Radix UI)
Para garantir acessibilidade total (suporte a leitores de tela e navegação por teclado) e animações consistentes sem precisar reimplementar lógica complexa do zero, o design system consome primitivos do **Radix UI**:

- **Dropdown Menu** (`@radix-ui/react-dropdown-menu`): Usado nos menus de contexto de mensagens, opções de posts e opções de cabeçalhos.
- **Tabs** (`@radix-ui/react-tabs`): Usado para navegar entre seções (ex: feeds de novidades vs feed social, posts de perfil vs mídias de perfil).
- **Accordion** (`@radix-ui/react-accordion`): Utilizado em páginas de ajuda, configurações e FAQs estruturadas.
- **Scroll Area** (`@radix-ui/react-scroll-area`): Barras de rolagem customizadas consistentes entre browsers Chromium e Firefox.

---

## 4. UI/UX Premium e Micro-Animações

### Glassmorphism (Efeito Vidro)
Cabeçalhos, painéis laterais de chat e modais utilizam classes utilitárias combinando opacidade e desfoque de fundo (backdrop-filter) para criar profundidade visual:
```html
<div class="bg-white/70 dark:bg-black/70 backdrop-blur-md border border-neutral-200/50 dark:border-neutral-800/50">
```

### Micro-animações e Interatividade
- **Hover Transitions**: Botões de ação, avatares e itens de lista possuem transições suaves de escala e sombra:
  `transition-all duration-200 ease-out hover:scale-102 hover:shadow-md active:scale-98`
- **Feed Loading Skeletons**: Em vez de telas em branco de carregamento, o sistema utiliza containers de skeleton animados via pulsação (`animate-pulse`) simulando o layout final dos posts e avatares.
- **Modais com Spring**: Modais abrem com efeitos de aproximação reativos (`scale-in` e `fade-in`) e fecham suavemente sem cortes bruscos de tela.
