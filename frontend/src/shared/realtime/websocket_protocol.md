# WebSocket — Protocolo de Eventos

Documentação do protocolo de comunicação em tempo real entre frontend e backend via WebSocket.

## Conexão

```
ws://<host>/ws/realtime?token=<jwt>
```

A autenticação é feita via query param `token` (JWT). O backend valida o token na abertura da conexão. Ao conectar com sucesso, o frontend envia `LIST_PRESENCE` para receber a lista inicial de presenças.

---

## Formato da mensagem

Todas as mensagens trocadas seguem o envelope:

```json
{
  "type": "NOME_DO_EVENTO",
  "payload": { }
}
```

> Eventos sem payload ainda precisam do campo `payload` como objeto vazio `{}`.

---

## Eventos enviados pelo Frontend → Backend

### `PRESENCE_SUBSCRIBE`
Inicia o monitoramento de online/offline dos amigos mútuos. O backend resolve automaticamente quais usuários monitorar — o frontend não precisa enviar IDs.

| Campo | Tipo | Descrição |
|---|---|---|
| `type` | `string` | `"PRESENCE_SUBSCRIBE"` |
| `payload` | `{}` | Vazio |

**Resposta esperada:** nenhuma direta. A partir deste momento o backend começa a enviar eventos `PRESENCE_UPDATED`.

---

### `PRESENCE_UNSUBSCRIBE`
Para o monitoramento de presença.

| Campo | Tipo | Descrição |
|---|---|---|
| `type` | `string` | `"PRESENCE_UNSUBSCRIBE"` |
| `payload` | `{}` | Vazio |

---

### `PING`
Heartbeat para manter a conexão ativa.

| Campo | Tipo | Descrição |
|---|---|---|
| `type` | `string` | `"PING"` |
| `payload` | `{}` | Vazio |

**Resposta esperada:** evento `PONG` do backend.

---

### `CHAT_SUBSCRIBE`
Enviado quando o usuário abre uma conversa. Registra o usuário como participante ativo daquele chat para receber mensagens e eventos de digitação em tempo real.

> Não concede permissão de acesso — o backend valida o acesso separadamente.

```json
{
  "type": "CHAT_SUBSCRIBE",
  "payload": {
    "chatId": 1
  }
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `payload.chatId` | `number` | ID do chat a ser subscrito |

**Resposta esperada:** evento `CHAT_SUBSCRIBED` confirmando a inscrição.

---

### `CHAT_UNSUBSCRIBE`
Enviado quando o usuário sai da conversa. Remove a inscrição realtime para aquele chat.

```json
{
  "type": "CHAT_UNSUBSCRIBE",
  "payload": {
    "chatId": 1
  }
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `payload.chatId` | `number` | ID do chat a ser desinscrito |

**Resposta esperada:** evento `CHAT_UNSUBSCRIBED`.

---

### `SEND_MESSAGE`
Cria e persiste uma nova mensagem. O backend salva primeiro e depois faz broadcast de `MESSAGE_CREATED` para todos os participantes inscritos no chat.

```json
{
  "type": "SEND_MESSAGE",
  "payload": {
    "chatId": 12345,
    "text": "Olá mundo!"
  }
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `payload.chatId` | `number` | ID do chat |
| `payload.text` | `string` | Texto da mensagem |

**Resposta esperada:** evento `MESSAGE_CREATED` para todos os participantes inscritos.

---

### `TYPING_START`
Indica que o usuário começou a digitar.

```json
{
  "type": "TYPING_START",
  "payload": {
    "chatId": 1
  }
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `payload.chatId` | `number` | ID do chat onde está digitando |

**Resposta esperada:** evento `TYPING_START` transmitido aos demais participantes.

---

### `TYPING_STOP`
Indica que o usuário parou de digitar.

```json
{
  "type": "TYPING_STOP",
  "payload": {
    "chatId": 1
  }
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `payload.chatId` | `number` | ID do chat |

**Resposta esperada:** evento `TYPING_STOP` transmitido aos demais participantes.

---

## Eventos recebidos pelo Frontend ← Backend

### `PRESENCE_UPDATED`
Disparado quando o status online/offline de um amigo muda.

```json
{
  "type": "PRESENCE_UPDATED",
  "payload": {
    "userId": 12,
    "name": "Maria",
    "username": "maria42",
    "avatarUrl": "https://cdn.exemplo.com/presigned-url...",
    "online": true,
    "lastSeenAt": "2026-04-19T06:30:00Z"
  }
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `payload.userId` | `number` | ID do usuário |
| `payload.name` | `string` | Nome de exibição |
| `payload.username` | `string` | Username |
| `payload.avatarUrl` | `string \| null` | Presigned URL do avatar (gerada pelo backend) |
| `payload.online` | `boolean` | `true` = online, `false` = offline |
| `payload.lastSeenAt` | `string` (ISO 8601) | Última vez visto |

**Store atualizado:** `usePresenceStore.updatePresence(payload)`

---

### `PONG`
Resposta do backend ao `PING` do frontend. Confirma que a conexão está ativa.

```json
{
  "type": "PONG",
  "payload": {}
}
```

---

### `CHAT_SUBSCRIBED`
Confirmação de que a inscrição no chat foi registrada com sucesso.

```json
{
  "type": "CHAT_SUBSCRIBED",
  "payload": {
    "chatId": 1
  }
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `payload.chatId` | `number` | ID do chat confirmado |

---

### `CHAT_UNSUBSCRIBED`
Confirmação de que a desincrição do chat foi processada.

```json
{
  "type": "CHAT_UNSUBSCRIBED",
  "payload": {
    "chatId": 1
  }
}
```

---

### `MESSAGE_CREATED`
Enviado a todos os participantes inscritos após uma mensagem ser persistida com sucesso.

```json
{
  "type": "MESSAGE_CREATED",
  "payload": {
    "id": "uuid-da-mensagem",
    "chatId": 1,
    "text": "Olá mundo!",
    "senderId": 12,
    "createdAt": "2026-04-25T20:00:00Z"
  }
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `payload.id` | `string` | ID único da mensagem |
| `payload.chatId` | `number` | ID do chat |
| `payload.text` | `string` | Conteúdo da mensagem |
| `payload.senderId` | `number` | ID do remetente |
| `payload.createdAt` | `string` (ISO 8601) | Data/hora de criação |

**Cliente:** `useChatStore.addMessage` (mensagens do chat aberto) e `useChatStore.dispatchListBump` (fila + `listBumpSeq`; `Chat.jsx` drena com `drainListBumpQueue` e atualiza a lista).

---

### `TYPING_START`
Um participante do chat começou a digitar. Enviado a todos os outros inscritos.

```json
{
  "type": "TYPING_START",
  "payload": {
    "chatId": 1,
    "userId": 12
  }
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `payload.chatId` | `number` | ID do chat |
| `payload.userId` | `number` | ID do usuário digitando |

---

### `TYPING_STOP`
Um participante parou de digitar.

```json
{
  "type": "TYPING_STOP",
  "payload": {
    "chatId": 1,
    "userId": 12
  }
}
```

---

### `ERROR`
Envelope padrão de erro retornado pelo backend em resposta a um evento inválido ou não autorizado.

```json
{
  "type": "ERROR",
  "payload": {
    "code": "UNAUTHORIZED_CHAT_ACCESS",
    "message": "User does not have access to this chat",
    "originalType": "CHAT_SUBSCRIBE"
  }
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `payload.code` | `string` | Código de erro (ver tabela abaixo) |
| `payload.message` | `string` | Mensagem descritiva |
| `payload.originalType` | `string` | Tipo do evento que causou o erro |

#### Códigos de erro (`WS_ERROR_CODES`)

| Código | Descrição |
|---|---|
| `UNKNOWN_EVENT_TYPE` | O `type` enviado não é reconhecido pelo backend |
| `INVALID_PAYLOAD` | O `payload` está malformado ou faltando campos obrigatórios |
| `UNAUTHORIZED_CHAT_ACCESS` | O usuário não tem permissão para acessar o chat solicitado |

---

## Diagrama de fluxo — Chat

```
Frontend                          Backend
   |                                 |
   |--- CHAT_SUBSCRIBE (chatId:1) -->|
   |<-- CHAT_SUBSCRIBED (chatId:1) --|
   |                                 |
   |--- SEND_MESSAGE (text, chatId)->|  (salva no banco)
   |<-- MESSAGE_CREATED -------------|  (broadcast para inscritos)
   |                                 |
   |--- TYPING_START (chatId:1) ---->|
   |<-- TYPING_START (userId, chat) -|  (para os outros participantes)
   |                                 |
   |--- TYPING_STOP (chatId:1) ----->|
   |<-- TYPING_STOP (userId, chat) --|
   |                                 |
   |--- CHAT_UNSUBSCRIBE (chatId:1)->|
   |<-- CHAT_UNSUBSCRIBED -----------|
```

## Diagrama de fluxo — Presença

```
Frontend                          Backend
   |                                 |
   |--- PRESENCE_SUBSCRIBE --------->|  (backend resolve amigos mútuos)
   |                                 |
   |<-- PRESENCE_UPDATED ------------|  (quando amigo conecta/desconecta)
   |    { userId, online, ... }      |
   |                                 |
   |--- PRESENCE_UNSUBSCRIBE ------->|
```

## Reconexão

O `useSocketStore` implementa reconexão automática com **backoff exponencial**:

- Delay = `min(1000 × 2^tentativas, 30000)` ms
- Máximo de 10 tentativas
- Ao reconectar, o frontend deve reenviar `PRESENCE_SUBSCRIBE` e os `CHAT_SUBSCRIBE` dos chats abertos (a implementar)
