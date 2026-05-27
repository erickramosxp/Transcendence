# Domínio: Notifications (Central de Avisos e Notificações Push)

O módulo de **Notifications** garante que o usuário seja informado em tempo real sobre interações sociais relevantes destinadas aos seus posts, comentários, relações de amizade ou convites em grupos de bate-papo.

---

## 1. Localização do Código
- **Funcionalidades e UI**: `src/features/notifications/`
- **Páginas de Rota**: `src/pages/Notifications.jsx`

---

## 2. Pushes WebSocket e Toasts em Tempo Real
Quando a aplicação está aberta, o listener de eventos globais do WebSocket em `realtime` fica ouvindo o tipo de evento `NOTIFICATION_RECEIVED`.

Ao capturar um evento desse tipo:
1. **Toast Animado (React Toastify)**: Uma notificação visual flutuante (Toast) contendo o avatar do remetente e o texto descritivo curto é disparada de forma elegante no topo da tela.
2. **Badging de Contador**: O badge numérico indicador de notificações não-lidas no header global é incrementado de forma reativa.
3. **Som de Notificação Opcional**: Opcionalmente, emite um efeito sonoro suave e curto (configurável e respeitando a política de foco do browser).

---

## 3. A Tela Central de Notificações (`src/pages/Notifications.jsx`)
A página dedicada exibe a lista completa de notificações históricas de forma limpa e organizada por datas de forma decrescente:

- **Diferenciação por Tipo (Ícones e Cores)**:
  - Curtidas (`LIKE_POST`, `LIKE_COMMENT`) $\to$ Ícone de Coração vermelho vibrante.
  - Comentários (`COMMENT_POST`) $\to$ Ícone de Balão de Diálogo azul.
  - Amizades (`FRIEND_REQUEST`, `FRIEND_ACCEPTED`) $\to$ Ícone de Usuários/Conexão verde.
  - Grupos (`ADDED_GROUP`, `REMOVED_GROUP`) $\to$ Ícone de Engrenagem ou Grupo violeta.
- **Marcação Dinâmica de Leitura**:
  - As notificações não-lidas possuem um fundo ligeiramente diferenciado e uma pequena bolinha azul no canto indicador.
  - Clicar em qualquer notificação dispara uma chamada `PATCH /notifications/{id}/read` em background e remove a bolinha azul imediatamente.
  - O cabeçalho possui o botão "Marcar todas como lidas", acionando `PATCH /notifications/read-all` e limpando instantaneamente todos os sinalizadores não-lidos na UI.
- **Navegação Contextual (Deep Linking)**:
  - Clicar em uma notificação de post/comentário abre o modal detalhado do post em foco, rolando até a seção específica de comentários se necessário.
  - Clicar em solicitações de amizade redireciona o usuário diretamente para a aba de convites pendentes na tela de Amigos.
  - Clicar em menções em grupo redireciona o usuário para a janela do chat correspondente de forma automatizada.
- **Empty State Premium**:
  - Quando o usuário não possui nenhuma notificação histórica, a tela renderiza um estado vazio premium contendo uma ilustração vetorizada moderna e frases encorajadoras em vez de uma tela vazia estática e sem graça.
