# Arquitetura do Frontend

O frontend da aplicação Transcendence (Videa) é uma Single Page Application (SPA) construída com **React 19**, **Vite 7** e **Tailwind CSS v4**. A arquitetura é baseada no padrão de **Feature-Driven Development**, onde os arquivos são organizados em torno de domínios funcionais de negócio, em vez de tipos técnicos de arquivos (como separar tudo apenas em componentes, views e stores).

---

## 1. Estrutura de Diretórios (`src/`)

O código-fonte dentro de `src/` está organizado da seguinte forma:

```text
src/
├── app/                  # Núcleo da aplicação (App Shell, Roteamento e Provedores globais)
├── assets/               # Imagens estáticas, logos e ilustrações
├── design-system/        # Componentes base puramente visuais e tokens (Design System)
├── features/             # Módulos específicos de domínio (regras de negócio isoladas)
│   ├── auth/             # Login, Registro, Google OAuth e JWT guard
│   ├── chat/             # Chat privado e em grupo, WebSockets reativos
│   ├── editorial/        # Visualização de notícias editoriais agregadas
│   ├── feed/             # Posts, curtidas, seção de comentários e criação de conteúdo
│   ├── friends/          # Listagem de amizades, solicitações pendentes e amigos online
│   ├── legal/            # Páginas estáticas de termos de uso e privacidade
│   ├── notifications/    # Central de notificações in-app
│   ├── profile/          # Página de perfil, avatar, banner e grid de mídias
│   └── settings/         # Gerenciamento de tema visual e idioma (i18n)
├── hooks/                # Hooks customizados e utilitários globais do React
├── i18n/                 # Configuração de tradução e arquivos locais (i18next)
├── pages/                # Componentes que representam rotas/telas inteiras
├── shared/               # Componentes e utilitários de domínio compartilhado
├── stories/              # Documentações visuais de componentes no Storybook
├── styles/               # CSS global e declaração de tokens do Tailwind CSS
└── test/                 # Helpers e setups de testes unitários e de integração
```

---

## 2. Gerenciamento de Estado Global (Zustand)

O gerenciamento de estado da aplicação é feito com o **Zustand**, uma biblioteca de estado baseada em hooks extremamente leve e performática. 
- Cada feature que exige persistência ou estado global gerencia sua própria store isolada (ex: `useAuthStore` no módulo `auth`, `useChatStore` no módulo `chat`, etc.).
- Os estados de sincronização de WebSocket são centralizados de forma transparente, permitindo que alterações de estado externas (ex: evento de nova mensagem via socket) atualizem diretamente a store do Zustand, o que aciona a re-renderização reativa dos componentes React afetados.

---

## 3. Roteamento Inteligente (React Router v7)

O roteamento da aplicação é gerenciado pelo **React Router dom v7**.
- **Rotas Públicas**: Acessíveis por qualquer visitante (ex: tela de login, termos legais).
- **Rotas Protegidas**: Envelopadas por um componente de segurança (`ProtectedRoute` da feature `auth`). Caso o usuário tente acessar sem um JWT ativo na store, ele é redirecionado de forma transparente para a tela de login.
- **Lazy Loading**: Telas e modais pesados são carregados sob demanda via Code Splitting para otimizar o tempo de carregamento inicial (LCP).

---

## 4. Integração com APIs e Resiliência (Axios)

Toda a comunicação HTTP com a API REST do backend (Quarkus) é feita através do **Axios**, com as seguintes implementações de resiliência:
- **Interceptors de Request**: Injeta automaticamente o cabeçalho `Authorization: Bearer <JWT>` em todas as requisições se houver um token ativo na store.
- **Interceptors de Response**: Monitora erros globais. Caso a API retorne `401 Unauthorized` (indicação de token expirado ou inválido), o interceptor limpa o estado de login no Zustand e redireciona o usuário imediatamente para a tela de autenticação de forma elegante.
- **URL Resolution Adaptativa**: Converte chaves de objeto do MinIO em URLs absolutas assinadas válidas cruzando as preferências de ambiente de desenvolvimento vs produção.
