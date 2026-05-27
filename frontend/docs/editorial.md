# Domínio: Editorial (Central de Notícias Globais)

O módulo de **Editorial** integra o frontend do Transcendence (Videa) ao sistema de notícias agregadas e curadas. Ele renderiza em um layout jornalístico elegante os artigos mundiais obtidos por meio da ingestão do backend, diferenciando postagens sociais de informações globais de relevância.

---

## 1. Localização do Código
- **Funcionalidades e UI**: `src/features/editorial/`
- **Páginas de Rota**: Exposto como seções especiais e painéis dentro de `src/pages/Home.jsx` e no escopo de notícias do feed.

---

## 2. Apresentação Visual e UX (Grid Jornalístico)
O frontend consome as matérias de duas formas principais para garantir engajamento e estética premium:

### A. O Painel de Headlines Lateral (Widget)
Em layouts de desktop, as últimas 5 notícias mais urgentes e frescas são listadas em uma barra lateral no feed.
- Cada item exibe o título da notícia, a fonte jornalística (ex: "G1", "BBC") e o tempo decorrido desde a publicação (ex: "há 10 min").
- Exibe o botão de atalho rápido para abrir o link da fonte original em uma nova aba do navegador.

### B. O Feed Dedicado de Notícias ("News Feed")
O feed principal de posts possui suporte a abas utilizando Radix UI. Ao selecionar a aba "Notícias", a aplicação faz uma chamada HTTP customizada a `GET /posts?scope=news`.
- Renderiza posts atribuídos ao usuário especial `videanews`.
- Os posts do robô contêm formatações e estilizações jornalísticas diferenciadas na UI: imagens de notícias com bordas estilizadas, fontes tipográficas em destaque e o link de acesso direto com ícones estilizados (`🔗`).

---

## 3. Fluxo de Dados e Integração REST
A comunicação e atualização são feitas da seguinte forma:

1. **Leitura de Headlines**: O componente de headlines faz uma chamada GET para `/editorial/headlines?limit=5`.
2. **Resolução de Imagens de Notícias**: As imagens jornalísticas fornecidas pela GNews API são URLs externas completas e são resolvidas diretamente no navegador do usuário, contornando a necessidade de links assinados do storage.
3. **Seeding de Imagem do Bot**: O avatar do robô de notícias `videanews` é resolvido de forma estática via `/videanews-avatar.png` no frontend, com fallback dinâmico para garantir que o rosto do robô de informações seja exibido de forma uniforme em chats e no feed.
