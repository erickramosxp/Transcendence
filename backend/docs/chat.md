# Domínio: Chat (Conversas e Mensagens)

O domínio de **Chat** é responsável por gerenciar a troca de mensagens privadas e em grupo. Ele lida com o gerenciamento de salas (chats), administração de participantes, envio de mensagens persistidas e recuperação histórica de conversas.

---

## 1. Estrutura do Pacote
Dividido entre:
- `com.ft.transcendence.chat`: Estrutura JAX-RS (REST API), DTOs, entidades e lógica de persistência.
- `com.ft.transcendence.realtime.chat`: Acoplador de tempo real (WebSockets) que implementa eventos de WebSocket associados ao fluxo de mensageria.

---

## 2. Entidades

### `Chat` (tabela: `chats`)
Representa uma sala de conversação. Pode ser do tipo direta (1-on-1) ou em grupo.

| Atributo | Tipo | Coluna no Banco | Restrições / Detalhes |
|---|---|---|---|
| `id` | `Long` | `id` | Chave Primária, `@GeneratedValue(IDENTITY)` |
| `chatName` | `String` | `chat_name` | Nome da sala. Nulo para chats diretos. Máx: 80 caracteres. |
| `type` | `String` | `type` | `"direct"` para bate-papos individuais ou `"group"` para grupos. |
| `createdAt` | `OffsetDateTime` | `created_at` | Data de criação. |
| `updatedAt` | `OffsetDateTime` | `updated_at` | Data de atualização física da sala. |
| `lastMessageAt` | `OffsetDateTime` | `last_message_at` | Timestamp do envio da última mensagem útil. |

### `ChatParticipant` (tabela: `chat_participants`)
Representa a associação N-N entre usuários e chats.

| Atributo | Tipo | Coluna no Banco | Restrições / Detalhes |
|---|---|---|---|
| `id` | `Long` | `id` | Chave Primária |
| `chat` | `Chat` | `chat_id` | `@ManyToOne(fetch = LAZY)`, `nullable = false` |
| `user` | `User` | `user_id` | `@ManyToOne(fetch = LAZY)`, `nullable = false` |
| `role` | `String` | `role` | Papel do usuário no chat: `"admin"` ou `"member"`. |
| `joinedAt` | `OffsetDateTime` | `joined_at` | Momento em que entrou ou foi inserido no chat. |

> Possui uma restrição de unicidade composta nas colunas `(chat_id, user_id)` impedindo duplicidade de participação.

### `ChatMessage` (tabela: `chat_messages`)
Representa uma mensagem enviada dentro de um chat.

| Atributo | Tipo | Coluna no Banco | Restrições / Detalhes |
|---|---|---|---|
| `id` | `Long` | `id` | Chave Primária |
| `chat` | `Chat` | `chat_id` | `@ManyToOne(fetch = LAZY)`, `nullable = false` |
| `sender` | `User` | `sender_id` | `@ManyToOne(fetch = LAZY)`, `nullable = false` |
| `text` | `String` | `message_text` | Texto da mensagem. Máx: 4000 caracteres. Nullable se houver mídia. |
| `mediaUrl` | `String` | `media_url` | URL de mídia (imagem/vídeo) armazenada no MinIO. |
| `type` | `String` | `type` | Tipo de mensagem (ex: `"text"`, `"image"`). |
| `replyTo` | `ChatMessage` | `reply_to_id` | Mensagem respondida (autorreferenciamento para suporte a reply). |
| `createdAt` | `OffsetDateTime` | `created_at` | Data de envio. |
| `deletedAt` | `OffsetDateTime` | `deleted_at` | Suporte a soft delete (remoção lógica). |

---

## 3. Endpoints REST (`ChatResource` e `ChatMessageResource`)
Todos os endpoints exigem autenticação ativa via `@Authenticated`.

### `ChatResource` (`@Path("/chats")`)

| Método | Caminho | DTO Entrada | DTO Saída | Descrição |
|---|---|---|---|---|
| `GET` | `/chats` | — | `ListChatResponse` | Retorna as conversas ativas do usuário logado (paginadas) |
| `POST` | `/chats/direct` | `CreateDirectChatRequest` | `ChatResponse` | Abre ou recupera uma conversa direta 1-on-1 |
| `POST` | `/chats/group` | `CreateGroupChatRequest` | `ChatResponse` | Cria uma nova sala de conversa em grupo |
| `GET` | `/chats/{chatId}/participants` | — | `PageResponse<ChatParticipantResponse>` | Lista os membros do grupo (paginado) |
| `POST` | `/chats/{chatId}/participants` | `AddGroupParticipantRequest` | `201 Created` | Adiciona um participante ao grupo (apenas admin) |
| `DELETE` | `/chats/{chatId}/participants/{userId}`| — | `204 No Content` | Remove um participante do grupo (apenas admin) |

### `ChatMessageResource` (`@Path("/chats/{chatId}/messages")`)

| Método | Caminho | DTO Entrada | DTO Saída | Descrição |
|---|---|---|---|---|
| `POST` | `/chats/{chatId}/messages` | `ChatMessageRequest` | `ChatMessageResponse` | Envia uma mensagem via REST API tradicional |
| `GET` | `/chats/{chatId}/messages` | — | `ChatMessagePageResponse` | Lista o histórico de mensagens do chat (paginado desc) |

---

## 4. Integração com WebSocket (Tempo Real)
A lógica de tempo real está centralizada em `RealtimeChatHandler` e responde a eventos estruturados JSON:
- **`CHAT_SUBSCRIBE`**: Registra uma conexão ativa de WebSocket para receber broadcasts de um chat específico (valida se o usuário é participante do chat antes de assinar).
- **`CHAT_UNSUBSCRIBE`**: Remove a inscrição de uma sala.
- **`SEND_MESSAGE`**: Envia mensagens de forma ultrarrápida via conexão WebSocket ativa.
- **`TYPING_START` / `TYPING_STOP`**: Dispara eventos in-memory para mostrar indicadores de digitação ("Fulano está digitando...") a todos os usuários inscritos no chat (excluindo quem está digitando).

---

## 5. Regras de Negócio Importantes

1. **Requisito de Amizade**:
   - Um usuário **só pode** iniciar um chat direto ou criar um grupo com participantes se houver uma relação de **amizade aceita** (`Friendship` com status `ACCEPTED`).
2. **Deduplicação de Chats Diretos**:
   - Ao tentar abrir um chat direto com o usuário `B`, o sistema verifica se já existe uma sala ativa direta entre `A` e `B`. Se sim, ela é retornada em vez de criar uma nova.
3. **Restrições de Mensagem**:
   - Uma mensagem deve conter obrigatoriamente texto **ou** mídia. Não pode ser enviada vazia de ambos, nem estourar o limite de 4000 caracteres no texto.
4. **Respostas Válidas (Replies)**:
   - Ao responder a uma mensagem (`replyToId`), o sistema valida se a mensagem de origem realmente pertence ao mesmo `chatId` da requisição atual.
5. **Controle de Acesso em Grupos**:
   - Somente participantes com a role `"admin"` (normalmente o criador do grupo) podem adicionar ou expulsar outros membros.
   - Um administrador não pode remover a si mesmo da sala por essa rota.
6. **Métricas**:
   - O envio de mensagens com mídia, respostas e criação de chats incrementa os contadores de telemetria `social.chats.created.total` e `social.messages.sent.total`.
7. **Broadcast de Mensagens**:
   - Mensagens criadas (seja via REST ou WS) são transmitidas via WebSocket para **todos os participantes da sala que estiverem online**, mesmo que eles não estejam com a aba daquela conversa especificamente aberta (inscrição ativa).
