# Integração Ponta a Ponta: Notificações in-app e Pushes WebSocket

Este documento detalha o funcionamento unificado do módulo de **Notificações**, desde a sua persistência em colunas JSON flexíveis no backend até a exibição de pushes em tempo real (Toasts) e contadores reativos no frontend React.

---

## 1. Visão Geral do Barramento de Alertas

```mermaid
sequenceDiagram
    autonumber
    actor Actor as Usuário A (Causador)
    participant BE as Backend Quarkus
    participant WS as WebSocket Server
    participant FE as Frontend B (Destinatário)
    actor B as Usuário B (Receptor)

    Actor->>BE: Executa ação (ex: Comenta em post de B)
    BE->>BE: Salva Notificação no Banco (receiverId = B)
    BE->>BE: NotificationDispatcher (Verifica se B está online)
    
    alt B está Conectado no WebSocket (Online)
        BE->>WS: Envia payload via canal aberto de B
        WS-->>FE: Evento: NOTIFICATION_RECEIVED
        FE->>FE: Exibe Toast animado (React Toastify)
        FE->>FE: Incrementa Badge Vermelho de Não-lidos no Header
    else B está Desconectado (Offline)
        BE->>BE: Apenas mantém gravado no Banco de Dados
    end

    Note over B, FE: B acessa a Central posteriormente
    B->>FE: Abre a tela de Notificações
    FE->>BE: GET /notifications (lista histórico)
    BE-->>FE: Retorna lista paginada e resolvida
    FE->>B: Renderiza lista com ícones e bolinhas azuis
```

---

## 2. Correlação Técnica de Arquivos e Classes

| Responsabilidade | Componente Frontend (React) | Componente Backend (Quarkus) |
|---|---|---|
| **Página de Alertas** | `Notifications.jsx` | `NotificationResource.java` (`/notifications`) |
| **Pushes em Tempo Real** | Listener de WebSocket global | `NotificationDispatcher.java` (Orquestrador) |
| **Alertas Flutuantes** | `react-toastify` (Toasts na UI) | `RealtimeEventSender.java` (WebSocket Push) |
| **Badge de Contador** | Store de notificações no Zustand | `NotificationService.java` (`countUnread`) |
| **Dados Voláteis** | Exibe DTO em tela com ícones | `NotificationContent.java` (JSON Column) |
| **Marcação de Lida** | Ação de clique e "Marcar todas" | `markAsRead` e `markAllAsRead` (Services) |

---

## 3. Detalhamento de Fluxos Integrados

### A. O Fluxo de Disparo e Push em Tempo Real
1. **Ação disparadora**: O usuário `A` curte ou comenta uma publicação criada pelo usuário `B`. O domínio de post ou comentário processa a transação e, antes de retornar, chama o `NotificationDispatcher.java` passando as informações básicas da ação.
2. **Validação de Filtro**: O dispatcher valida se o autor da ação é diferente do receptor (auto-ações não disparam alertas).
3. **Persistência Híbrida**: O sistema monta o DTO `NotificationContent` contendo metadados voláteis (preview do post, nome de exibição, ID do chat ou convite) e salva na tabela `notifications` usando uma **coluna JSON nativa** do PostgreSQL, o que provê alta flexibilidade para expansões de tipos futuros de alertas sem migrações de DDL.
4. **Push WebSocket Instantâneo**:
   - O dispatcher faz uma busca em memória na classe `RealtimeSessionRegistry` para verificar se o usuário receptor `B` possui alguma conexão reativa ativa via WebSocket.
   - Se estiver conectado, o sistema monta o DTO `NotificationResponse`, resolve o link atual do avatar de `A` via `UserAvatarService` para que não fique desatualizado, e empurra o evento do tipo `NOTIFICATION_RECEIVED` diretamente pela conexão WebSocket do usuário.
5. **UX reativa no Cliente**: O frontend de `B` captura o evento por trás das telas. Dispara um alerta flutuante Toast agradável com o avatar e texto ("Alice comentou na sua foto") e atualiza o saldo de não-lidos no cabeçalho do app incrementando o contador na store.

### B. A Central e o Deep Linking Contextual
1. **Histórico Paginado**: Ao abrir a tela de Notificações, o frontend busca `GET /notifications?unreadOnly=false` trazendo a listagem paginada. O backend resolve os avatares em lote usando técnicas de cache para evitar N+1 no storage.
2. **Deep Linking (Navegação Inteligente)**: Cada item de notificação em tela possui uma ação de clique amigável e adaptativa mapeada de acordo com o tipo:
   - Se for curtida ou comentário em post $\to$ Abre o modal detalhado da Timeline focando na publicação.
   - Se for solicitação de amizade $\to$ Redireciona o usuário diretamente para a aba correta de solicitações na tela de amigos.
   - Se for grupo de chat $\to$ Abre a sala correspondente na tela de mensagens.
3. **Marcação Física de Leitura**: Ao clicar em uma notificação específica, o frontend remove o indicador visual azul e dispara `PATCH /notifications/{id}/read` ao backend de forma assíncrona. O backend valida se a notificação pertence de fato àquele token ativo para segurança (evitando burla de IDs) e altera o status para lido no banco.
