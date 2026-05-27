# Domínio: Notification (Notificações in-app e push)

O domínio de **Notification** gerencia o fluxo completo de avisos e comunicações in-app dentro da plataforma Transcendence (Videa). Ele persiste os eventos gerados pelas interações sociais e dispara notificações push instantâneas via conexão de tempo real (WebSockets) para usuários ativos na plataforma.

---

## 1. Estrutura do Pacote
Localizado em `com.ft.transcendence.notification` e dividido em:
- `domain`: Entidade JPA `Notification` mapeando o registro físico e o tipo enum.
- `api`: `NotificationResource` expondo os endpoints REST de leitura e marcação de lidos.
- `app`:
  - `NotificationService`: Executa operações CRUD e atualização em lote.
  - `NotificationDispatcher`: Centralizador de eventos de domínio que traduz ações de outros contextos em registros e pushes WebSocket.
- `dto`: Payloads flexíveis contendo DTOs armazenados em JSON (`NotificationContent`) e serializados para entrega (`NotificationResponse`).

---

## 2. Entidades

### `Notification` (tabela: `notifications`)
Representa uma notificação enviada pelo sistema.

| Atributo | Tipo | Coluna no Banco | Restrições / Detalhes |
|---|---|---|---|
| `id` | `Long` | `id` | Chave Primária |
| `receiver` | `User` | `user_id` | Destinatário da notificação. `@ManyToOne(fetch = LAZY)`, `nullable = false` |
| `sender` | `User` | `sender_id` | O causador/remetente do evento. `@ManyToOne(fetch = LAZY)`, nullable. |
| `type` | `NotificationType` | `type` | Tipo de evento (anotado com `@Enumerated(STRING)`). |
| `content` | `NotificationContent` | `content` | Dados flexíveis armazenados como **coluna JSON** nativa do Postgres. |
| `targetId` | `Long` | `target_id` | ID do objeto alvo do evento (ex: `postId`, `commentId`). |
| `isRead` | `boolean` | `is_read` | Flag indicando se a notificação foi visualizada pelo usuário. Padrão: `false`. |
| `createdAt` | `OffsetDateTime` | `created_at` | Data de criação, `@CreationTimestamp` (não-editável). |

#### `NotificationType` (Enum) e Deduplicação
Os tipos de eventos suportados pelo sistema e sua respectiva capacidade de **Deduplicação Dinâmica**:

| Evento | Descrição | Deduplicável? |
|---|---|:---:|
| `LIKE_POST` | Um usuário curtiu o post do receiver. | **Sim** |
| `LIKE_COMMENT`| Um usuário curtiu o comentário do receiver. | **Sim** |
| `COMMENT_POST`| Comentário criado no post do receiver. | Não |
| `FRIEND_REQUEST`| Solicitação de amizade recebida. | Não |
| `FRIEND_ACCEPTED`| Solicitação de amizade aceita por outrem. | Não |
| `FRIEND_REJECTED`| Solicitação de amizade rejeitada. | Não |
| `FRIEND_BROKEN`| Amizade desfeita por outrem. | Não |
| `ADDED_GROUP` | Adicionado a um chat de grupo. | Não |
| `REMOVED_GROUP`| Removido de um chat de grupo. | Não |

---

## 3. Endpoints REST (`NotificationResource`)
Todos os endpoints exigem autenticação ativa via `@Authenticated` e operam sob o path base `/notifications`.

| Método | Caminho | Parâmetros | DTO Saída | Descrição |
|---|---|---|---|---|
| `GET` | `/notifications` | `page` (default 0), `size` (default 20), `unreadOnly` (default false) | `PageResponse<NotificationResponse>` | Lista as notificações do usuário logado (paginado) |
| `GET` | `/notifications/unread-count`| — | `UnreadCountResponse` | Obtém o saldo numérico de notificações não-lidas |
| `PATCH` | `/notifications/{id}/read` | `id` (Path) | `204 No Content` | Marca uma única notificação como lida |
| `PATCH` | `/notifications/read-all` | — | `204 No Content` | Marca todas as notificações do usuário como lidas em lote |

---

## 4. O Coração de Eventos: `NotificationDispatcher`
O `NotificationDispatcher` centraliza os gatilhos e orquestra a entrega das notificações em tempo real. Sempre que um evento social relevante acontece (ex: novo like), o respectivo domínio chama uma das funções do dispatcher:

1. **Auto-notificação Bloqueada**: O dispatcher rejeita o envio se o remetente e o destinatário forem o mesmo usuário (ex: curtir ou comentar no próprio post).
2. **Persistência**: O dispatcher formata e persiste o registro de `Notification` no banco de dados.
3. **Pushes Push/WebSocket Instantâneo**:
   - O dispatcher cruza informações com a infraestrutura de tempo real chamando `RealtimeSessionRegistry.isUserOnline(receiverId)`.
   - Se o destinatário estiver online no momento do evento, o sistema captura a sua conexão de WebSocket ativa e faz o envio imediato da notificação estruturada via `RealtimeEventSender.send` com o tipo de evento `NOTIFICATION_RECEIVED`.
   - Caso esteja offline, a notificação permanece guardada apenas no banco para ser lida via REST API quando o usuário logar novamente.

---

## 5. Regras de Negócio Importantes

1. **Deduplicação de Curtidas**:
   - Eventos do tipo `LIKE_POST` e `LIKE_COMMENT` possuem a flag de deduplicação ativa. Ao curtir, o sistema verifica se já existe uma notificação não-lida do mesmo `sender` para o mesmo `receiver` no mesmo `targetId`. Se já existir, a criação da nova notificação é silenciosamente pulada, evitando poluição visual.
2. **Armazenamento Híbrido em Coluna JSON**:
   - Metadados voláteis como o nome visível do usuário, preview resumido do post/comentário e caminhos de arquivos são serializados no DTO `NotificationContent` e guardados em uma coluna JSON no banco. Isso permite a expansão e adição de novos tipos de notificação no futuro sem quebras de DDL na tabela.
3. **Resolução de Avatares Dinâmicos**:
   - O avatar do remetente exibido nas notificações **não** é consumido a partir do link estático congelado no JSON da coluna `content` (pois o usuário poderia ter trocado de avatar posteriormente). O sistema carrega os dados atuais das imagens via `UserAvatarService` em lote no momento de renderização da listagem.
4. **Controle de Autoridade na Leitura**:
   - Um usuário **só pode** marcar uma notificação como lida se ela pertencer de fato à sua conta. Qualquer tentativa de burlar IDs de terceiros retorna `403 Forbidden`.
