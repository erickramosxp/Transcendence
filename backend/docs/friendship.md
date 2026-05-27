# Domínio: Friendship (Amizades)

O domínio de **Friendship** é responsável por estabelecer conexões mútuas de amizade entre usuários. Ele gerencia o fluxo completo de solicitações de amizade (envio, aceitação, rejeição), listagem de amigos, contagem de amigos online e desfazimento de laços sociais.

---

## 1. Estrutura do Pacote
Localizado em `com.ft.transcendence.friendship`, estruturado da seguinte forma:
- `domain`: Entidades representando os laços de amizade e seus estados (`FriendshipStatus`).
- `api`: `FriendshipResource` com endpoints HTTP dedicados.
- `app`: `FriendshipService` contendo a complexidade de regras de negócio e acoplamento com telemetria e notificações.
- `dto`: Modelos de requisição e resposta do módulo de amizades.

---

## 2. Entidades

### `Friendship` (tabela: `friendships`)
Mapeia o relacionamento social de amizade. Diferente de outros relacionamentos baseados em grafos mapeados por ORM, esta entidade usa **IDs numéricos diretos (`Long`)** dos usuários em vez de anotações `@ManyToOne` ao objeto `User`. As resoluções de perfil são feitas via junções HQL ad-hoc.

| Atributo | Tipo | Coluna no Banco | Restrições / Detalhes |
|---|---|---|---|
| `id` | `Long` | `id` | Chave Primária, `@GeneratedValue(IDENTITY)` |
| `userId` | `Long` | `user_id` | ID do usuário dono/remetente do relacionamento. |
| `friendId` | `Long` | `friend_id` | ID do usuário amigo/destinatário do relacionamento. |
| `status` | `FriendshipStatus` | `status` | Estado da amizade (anotado com `@Enumerated(STRING)`). |
| `createdAt` | `OffsetDateTime` | `created_at` | Data de criação, `@CreationTimestamp` (não-editável). |

#### `FriendshipStatus` (Enum)
- `PENDING`: Solicitação enviada aguardando aprovação do destinatário.
- `ACCEPTED`: Solicitação aceita. Amizade ativa e mútua estabelecida.

---

## 3. Endpoints REST (`FriendshipResource`)
Todos os endpoints exigem autenticação ativa via `@Authenticated` e operam sob o path base `/friendships`.

| Método | Caminho | DTO Entrada | DTO Saída | Descrição |
|---|---|---|---|---|
| `POST` | `/friendships/request/{targetUserId}` | — | `FriendshipDTO` | Envia uma solicitação de amizade |
| `GET` | `/friendships/requests/pending` | — | `List<FriendshipDTO>` | Lista as solicitações de amizade recebidas e pendentes |
| `GET` | `/friendships/me/pending-status` | — | `PendingRequestStatusDTO` | Verifica se há algum convite de amizade pendente para o usuário logado |
| `POST` | `/friendships/accept/{friendshipId}` | — | `200 OK` | Aceita um convite de amizade pendente |
| `DELETE`| `/friendships/reject/{friendshipId}` | — | `204 No Content` | Rejeita/deleta um convite de amizade pendente |
| `GET` | `/friendships` | — | `PageResponse<FriendshipDTO>` | Lista os amigos aceitos (com busca e paginação) |
| `GET` | `/friendships/online` | — | `PageResponse<FriendshipDTO>` | Lista os amigos que estão online no momento |
| `DELETE`| `/friendships/{friendshipId}` | — | `200 OK` | Desfaz uma amizade ativa (deleta ambas as direções) |

---

## 4. Regras de Negócio Importantes

1. **Modelo de Registro Espelhado (Bidirecionalidade)**:
   - Para representar a reciprocidade bi-direcional das amizades no banco de dados relacional de forma simples, o sistema utiliza o **modelo espelhado (mirror)**:
     - Quando a solicitação de amizade está `PENDING`, existe apenas **um registro** no banco (de `remetente` para `destinatário`).
     - No momento em que o convite é aceito (`FriendshipService.acceptRequest`), o status desse registro passa a ser `ACCEPTED` e cria-se imediatamente um **segundo registro espelhado** com a ordem invertida (`destinatário` $\to$ `remetente` com status `ACCEPTED`).
2. **Auto-amizade e Duplicidades**:
   - Um usuário **não pode** enviar solicitação de amizade para si mesmo (retorna `400 Bad Request`).
   - Se já existir qualquer relacionamento pendente ou aceito entre os dois usuários (em qualquer direção), o sistema impede a criação de um novo registro para evitar inconsistências (retorna `409 Conflict`).
3. **Controle de Acesso em Convites**:
   - Apenas o usuário **destinatário** (`friendId`) do convite pendente possui autorização para aceitar ou rejeitar a solicitação. Qualquer tentativa de terceiros ou do próprio remetente gera erro de autorização.
4. **Desfazimento Completo**:
   - Ao deletar uma amizade ativa (`DELETE /friendships/{friendshipId}`), o sistema localiza os registros em ambas as direções (espelhados) e executa o **hard delete** de ambos, removendo inteiramente o laço social.
5. **Busca e Paginação de Amigos**:
   - O endpoint `/friendships` aceita parâmetros de paginação e uma query string de busca `q` que realiza buscas case-insensitive filtrando por `name` ou `username` dos amigos associados.
6. **Integração com Presença e WebSocket**:
   - O endpoint `/friendships/online` delega a listagem e aplica um filtro cruzando dados de conexões in-memory do `RealtimeSessionRegistry` para retornar apenas os amigos ativos via WebSocket.
7. **Notificações Sociais e Telemetria**:
   - O envio, aceitação, rejeição e quebra de amizades geram disparos de eventos na classe `NotificationDispatcher` (avisando os envolvidos em tempo real via WebSocket in-app) e gravam telemetria na classe `SocialMetrics` (`social.friendships.total`).
