# 📖 Sistema de amizade

## Visão geral

O sistema de amizade permite que usuários criem conexões mútuas. Diferente de um sistema de follow, a amizade é **bidirecional**: os dois usuários precisam concordar para a relação ser concluída.

---

## Modelo de dados

### Tabela: `friendships`

| Coluna         | Tipo            | Descrição                                |
| -------------- | --------------- | ------------------------------------------ |
| `id`         | `bigint`      | Chave primária                            |
| `user_id`    | `bigint`      | Usuário que iniciou ou possui a relação |
| `friend_id`  | `bigint`      | Outro usuário da relação                |
| `status`     | `text`        | `PENDING` ou `ACCEPTED`                |
| `created_at` | `timestamptz` | Data de criação                          |

**Restrições:**

- `UNIQUE(user_id, friend_id)` — evita duplicidade de relacionamento por direção
- Cascade na exclusão de usuário

### Como funciona o modelo bidirecional

Quando o **Usuário A** envia uma solicitação para o **Usuário B**, é criada **uma única linha**:

```
{ user_id: A, friend_id: B, status: PENDING }
```

Quando o **Usuário B aceita**, a linha original é atualizada para `ACCEPTED` e uma **linha espelho** é criada:

```
{ user_id: A, friend_id: B, status: ACCEPTED }   ← original, atualizada
{ user_id: B, friend_id: A, status: ACCEPTED }   ← espelho, nova
```

Isso permite que cada usuário consulte sua própria lista de amigos com uma query simples `WHERE user_id = eu AND status = 'ACCEPTED'`, sem precisar de condições `OR` em toda consulta.

---

## Estados da amizade

| Estado               | Significado                                                  |
| -------------------- | ------------------------------------------------------------ |
| `NONE`             | Não existe relação entre os usuários                     |
| `PENDING_SENT`     | O usuário atual enviou uma solicitação e aguarda resposta |
| `PENDING_RECEIVED` | O usuário atual recebeu uma solicitação do outro usuário |
| `ACCEPTED`         | Os dois usuários são amigos                                |
| `SELF`             | O usuário está visualizando o próprio perfil              |

Esses estados são retornados pelo endpoint de perfil do usuário via campo `relationStatus`.

---

## API do backend

Todos os endpoints exigem autenticação (`Bearer token`).

### Enviar solicitação de amizade

```
POST /friendships/request/{targetUserId}
```

- **Retorna** `201` com `FriendshipDTO`
- **Erros:** `400` ao tentar adicionar a si mesmo, `404` usuário não encontrado, `409` relação já existente

### Listar solicitações pendentes recebidas

```
GET /friendships/requests/pending
```

- **Retorna** `200` com `FriendshipDTO[]`
- Mostra solicitações em que o usuário atual é o **destinatário**

### Aceitar solicitação

```
POST /friendships/accept/{friendshipId}
```

- **Retorna** `200`
- Somente o **destinatário** da solicitação pode aceitar
- Atualiza a solicitação e cria a linha espelho com `ACCEPTED`

### Recusar ou cancelar solicitação

```
DELETE /friendships/reject/{friendshipId}
```

- **Retorna** `204`
- Pode ser usada pelo **destinatário** para recusar ou pelo remetente para cancelar, enquanto estiver pendente

### Listar amigos (paginado + busca)

```
GET /friendships?page=0&size=20&q=
```

- **Retorna** `PageResponse<FriendshipDTO>`
  ```json
  {
    "items": [...],
    "page": 0,
    "size": 8,
    "hasMore": false
  }
  ```
- `q` filtra por nome ou username, sem diferenciar maiúsculas/minúsculas

### Listar amigos online

```
GET /friendships/online
```

- **Retorna** `PageResponse<FriendshipDTO>` (primeiros 10 amigos aceitos)
- O campo `isOnline` está reservado para integração futura com tempo real/WebSocket

### Remover amizade

```
DELETE /friendships/{friendshipId}
```

- **Retorna** `200`
- Remove **as duas linhas** da relação de forma atômica
- Qualquer um dos dois usuários pode desfazer a amizade

---

## Arquitetura do frontend

### Página: `/friends`

A página de amigos (`FriendsView`) é organizada em três abas:

```
/friends
├── Amigos       → FriendsList
├── Solicitações → FriendRequests
└── Descoberta   → FriendSuggestions (placeholder)
```

### Gerenciamento de estado

Todos os dados e ações são controlados pelo hook `useFriends` e compartilhados via `FriendsContext`:

```
useFriends()
├── friends         → lista paginada de amigos aceitos
├── requests        → lista de solicitações pendentes recebidas
├── loading         → estado de carregamento inicial
├── loadingMore     → estado de busca de próxima página
├── hasMoreFriends  → flag de paginação
├── fetchMoreFriends() → carrega a próxima página
├── acceptRequest()    → move da lista de solicitações para amigos
├── removeRequest()    → remove da lista de solicitações
└── removeFriend()     → remove da lista de amigos
```

### FriendButton — máquina de estados

O componente `FriendshipButton` lê `initialStatus` e exibe a ação correta:

| `initialStatus`    | UI renderizada                                 |
| -------------------- | ---------------------------------------------- |
| `NONE`             | Botão**Adicionar amizade**              |
| `PENDING_SENT`     | Botão**Cancelar solicitação**         |
| `PENDING_RECEIVED` | Botões **Aceitar** + **Recusar** |
| `ACCEPTED`         | Botão**Desfazer amizade**               |
| `SELF`             | Nada é renderizado                            |

O botão aparece em:

- **Página de perfil do usuário** (contextual, baseado em `relationStatus` vindo da API)
- **Componente `FriendCard`** (nas abas Amigos e Solicitações)

---

## Fluxo da amizade

```
Usuário A                      Usuário B
  │                                │
  │── POST /request/{B} ──────────►│  status: PENDING
  │                                │
  │        [Usuário B aceita]      │
  │◄────── POST /accept/{id} ──────│  status: ACCEPTED (+ linha espelho)
  │                                │
  │   Ambos podem agora:           │
  │── DELETE /friendships/{id} ───►│  remove as duas linhas
  │◄── DELETE /friendships/{id} ───│
```

---

## Tratamento de erros

| Código HTTP | Cenário                                                                     |
| ------------ | ---------------------------------------------------------------------------- |
| `400`      | Tentativa de adicionar a si mesmo / parâmetros inválidos de paginação    |
| `403`      | Tentativa de aceitar/recusar uma solicitação que não pertence ao usuário |
| `404`      | Usuário ou amizade não encontrada                                          |
| `409`      | Amizade já existe ou já está pendente                                     |

---

## Limitações conhecidas e próximos passos

| Item                                                                             | Status         |
| -------------------------------------------------------------------------------- | -------------- |
| **Aba Descoberta** — busca avançada com filtros                          | 🔜 Próxima PR |
| **Campo `isOnline`** — integração real com WebSocket                  | 🔜 Planejado   |
| **Notificações** — alerta ao receber nova solicitação                 | 🔜 Planejado   |
| **Bloqueio de usuário** — impedir solicitações de usuários bloqueados | 🔜 Planejado   |
