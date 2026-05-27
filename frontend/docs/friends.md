# Domínio: Friends (Gestão de Amigos e Relações)

O módulo de **Friends** é encarregado de mapear e exibir as redes de conexões dos usuários: solicitação e aceite de amizades, listagem de amigos, amigos que estão ativos (online) e a busca/filtro de conexões.

---

## 1. Localização do Código
- **Funcionalidades e UI**: `src/features/friends/`
- **Páginas de Rota**: `src/pages/Friends.jsx`

---

## 2. A Central de Amizades (Interface de Abas)
A tela de Amigos utiliza Abas dinâmicas do Radix UI para organizar o fluxo de conexões de forma intuitiva para o usuário:

### A. Aba "Meus Amigos"
- Renderiza a lista de todos os amigos com relacionamento `ACCEPTED`.
- Cada perfil exibe o nome, username, avatar (resolvido dinamicamente) e um botão de ação rápido para abrir chat direto com aquela pessoa ou desfazer a amizade.
- Suporta busca case-insensitive em tempo real filtrando pelo nome no frontend e paginação sob demanda.

### B. Aba "Solicitações"
- Lista os convites de amizade pendentes (`FriendshipStatus = PENDING`) que foram recebidos pelo usuário atual.
- Exibe de forma clara quem enviou a solicitação e disponibiliza botões de ação proeminentes: "Aceitar" (que cria o registro espelhado no banco e dispara confetes/animações) e "Rejeitar" (que apaga o convite de forma limpa).

### C. Aba "Amigos Online"
- Cruza informações em tempo real provenientes dos eventos de presença WebSocket.
- Exibe em destaque uma bolinha verde brilhante animada ao lado dos amigos que possuem conexões ativas na plataforma.
- A listagem é mantida reordenada em tempo real: se um amigo se conecta, ele sobe para o topo da lista de forma animada.

---

## 3. Integração com Notificações e Confetes
Para enriquecer a experiência social e torná-la mais prazerosa (Premium UX/UI):
- **Notificações Push Instantâneas**: Ao receber uma solicitação de amizade enquanto navega, uma notificação push Toast animada é exibida no canto da tela. O menu de notificações ganha um balão vermelho com a contagem incrementada reativamente.
- **Efeitos de Vitória**: Ao clicar em "Aceitar Amizade", o frontend dispara um efeito rápido de confetes ou micro-animações no botão para celebrar a nova conexão estabelecida.
- **Feedback de Exclusão**: Desfazer amizade abre um diálogo de confirmação rápida para evitar toques acidentais destrutivos.
