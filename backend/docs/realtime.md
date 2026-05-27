# Domínio: Realtime (WebSockets e Mensagens Instantâneas)

O domínio de **Realtime** é o motor de comunicação bidirecional de baixíssima latência do Transcendence (Videa). Ele implementa um barramento de WebSocket único e integrado que unifica fluxos de chats em tempo real, telepresença de amigos (online/offline), notificações push instantâneas in-app e monitoramento de conectividade (heartbeats).

---

## 1. Estrutura do Pacote
Localizado em `com.ft.transcendence.realtime`, organizado em três subdomínios principais:
- `ws`: Gerenciamento físico do WebSocket (endpoint, autenticação com JWT e registro de sessões).
- `chat`: Manipulação e distribuição de eventos de digitação e mensagens em chats.
- `presence`: Rastreamento de atividade, persistência em memória e transmissão de status online/offline dos amigos.

---

## 2. O Endpoint WebSocket (`RealtimeWebSocket`)
Utiliza a especificação reativa Quarkus WebSockets Next (`io.quarkus.websockets.next`).

- **Caminho**: `/ws/realtime`
- **Autenticação**: Realizada no ato da conexão (`@OnOpen`) através da leitura do parâmetro de consulta contido na query string: `?token=<JWT_TOKEN>`.
  - O `WsAuthService` utiliza o `JWTParser` do SmallRye para descriptografar e validar a assinatura e expiração do token.
  - A claim `uid` é lida para identificar o ID do usuário e mapear o perfil.
  - Qualquer falha de autorização fecha a conexão imediatamente retornando o código de encerramento de WebSocket `1008` (Policy Violation).

---

## 3. Gerenciamento de Sessão Reativa (`RealtimeSessionRegistry`)
Como o protocolo WebSocket exige estado, a classe `RealtimeSessionRegistry` funciona como um **banco de dados in-memory concorrente** estruturado em `ConcurrentHashMap` concorrentes para mapear conexões e evitar buscas em banco:

- Mapeamento por Conexão: Permite localizar o objeto da conexão ativa (`RealtimeConnection`) a partir do identificador de socket único.
- Mapeamento por Usuário: Suporta que o mesmo usuário possua **múltiplas conexões ativas simultâneas** (ex: o usuário abriu a rede social em várias abas do navegador ou no celular e no desktop).
- Mapeamento por Chat: Associa de forma veloz conexões a canais/salas de bate-papo para broadcast.

---

## 4. O Protocolo de Eventos JSON
Toda a comunicação flui encapsulada em um envelope JSON comum contendo as chaves `type` e `payload`:

### Eventos do Cliente para o Servidor (Inbound)
- `CHAT_SUBSCRIBE` / `CHAT_UNSUBSCRIBE`: Solicita escutar ou parar de escutar eventos em uma conversa específica.
- `SEND_MESSAGE`: Envia uma nova mensagem de texto/mídia na conversa.
- `TYPING_START` / `TYPING_STOP`: Indica que o usuário está digitando na sala.
- `LIST_PRESENCE`: Solicita a lista atualizada de amigos online/offline.
- `PING`: Evento de keepalive/heartbeat periódico para evitar o timeout de conexões por inatividade (timeout nativo de proxy reverso).

### Eventos do Servidor para o Cliente (Outbound)
- `MESSAGE_CREATED`: Notifica uma nova mensagem de chat.
- `TYPING_START` / `TYPING_STOP`: Replica o sinalizador de digitação para outros membros na sala.
- `PRESENCE_UPDATED`: Notifica que um amigo entrou ou saiu da plataforma.
- `PONG`: Resposta imediata de keepalive ao evento `PING`.
- `ERROR`: Transmite um payload de erro estruturado sem derrubar a conexão do cliente.
- `NOTIFICATION_RECEIVED`: Disparado externamente pelo `NotificationDispatcher` para entregar notificações push in-app em tempo real.

---

## 5. Rastreamento e Telepresença (`presence`)
O sistema de presença gerencia o monitoramento de conexões ativas dos usuários de forma dinâmica:

1. **Subscrição de Presença Automática**: No momento em que uma conexão WebSocket é aberta, o sistema localiza os amigos do usuário através do domínio `Friendship` e assina automaticamente o status de cada um deles, devolvendo de imediato a lista consolidada de quem está ativo.
2. **Registro de Observadores (Watchers)**: O `PresenceService` mantém em memória uma coleção concorrente de conexões observadoras para cada ID de usuário.
3. **Notificação de Status Concorrente**:
   - Ao conectar: O sistema sinaliza para todos os amigos observadores ativos que o usuário está online (`online = true`).
   - Ao desconectar: O sistema reduz o contador de sessões do usuário. Apenas quando a **última conexão ativa** do usuário é fechada (todas as abas fechadas) é disparada a mensagem de offline (`online = false`) com a data atualizada em `lastSeenAt`, evitando falsos avisos de queda durante transições rápidas de recarregamento de página.
