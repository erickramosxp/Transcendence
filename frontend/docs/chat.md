# Domínio: Chat (Mensagens e WebSockets em Tempo Real)

O módulo de **Chat** é uma das seções mais dinâmicas e ricas em UI/UX do Transcendence (Videa). Ele implementa uma interface completa de bate-papo em tempo real com suporte a conversas privadas, canais de grupo, uploads de mídia, indicadores visuais de digitação e histórico paginado com rolagem adaptativa.

---

## 1. Localização do Código
- **Funcionalidades e UI**: `src/features/chat/`
- **Página de Rota**: `src/pages/Chat.jsx`

---

## 2. Protocolo WebSocket no Frontend
A comunicação instantânea flui através de uma única conexão WebSocket estabelecida com o backend no endpoint `/ws/realtime?token=<JWT>`. O ciclo de vida e tratamento de mensagens são abstraídos pela store do Zustand.

### Eventos Tratados pelo Cliente (Inbound / Ouvindo)
- **`MESSAGE_CREATED`**: Recebido quando uma nova mensagem é publicada em qualquer chat que o usuário faça parte. A mensagem é inserida na thread se a sala estiver aberta e a lista lateral de chats é ordenada por recência de forma animada.
- **`TYPING_START` / `TYPING_STOP`**: Exibe ou oculta um indicador de digitação ("Fulano está digitando...") na janela de chat ativa se o usuário remetente pertencer à sala atual.
- **`PRESENCE_UPDATED`**: Atualiza a bolinha de status online/offline na lista de conversas e nos perfis visíveis.

### Eventos Enviados pelo Cliente (Outbound / Falando)
- **`CHAT_SUBSCRIBE` / `CHAT_UNSUBSCRIBE`**: Registra que o usuário abriu ou fechou uma janela de conversa.
- **`SEND_MESSAGE`**: Envia o payload da mensagem de forma instantânea sem overhead de HTTP.
- **`TYPING_START` / `TYPING_STOP`**: Disparados reativamente a partir de um temporizador (debounce) acionado à medida que o usuário digita no composer.
- **`PING`**: Heartbeat enviado a cada 30 segundos para manter o canal TCP ativo.

---

## 3. UI/UX: Recursos de Interface Premium

1. **Roteamento Dinâmico de Conversas**:
   - A URL `/chat` renderiza a lista de conversas ativas. Ao selecionar uma conversa, a URL passa a ser `/chat?id=<chatId>`, carregando as mensagens correspondentes e alterando o estado do WebSocket (inscrevendo-se no novo canal).
2. **composer de Mensagem Avançado**:
   - Permite digitação com suporte a **Emoji Picker** reativo.
   - Suporte a **anexos de mídias** (fotos ou vídeos) integrado ao fluxo de uploads rápidos da API.
   - Suporta **responder a mensagens (Reply)**: Clicar em responder anexa a mensagem original acima do composer. O clique no reply de uma mensagem na thread rola a tela de volta de forma animada até o item correspondente.
3. **Scroll e Paginação Infinita na Thread**:
   - Utiliza um container de scroll adaptativo que detecta quando o usuário rola o histórico até o topo para carregar páginas de mensagens anteriores de forma assíncrona, preservando a posição física do scroll para evitar saltos visuais incômodos na tela (UX fluida).
4. **Filtro de Amizades para Criação**:
   - O botão "Nova conversa" abre um modal de seleção. Ele renderiza a lista de amigos aceitos obtida via `/friendships`. Um chat direto ou grupo só pode ser aberto cruzando a lista de amigos ativos.
5. **Administração de Grupos**:
   - Para chats do tipo `"group"`, exibe uma gaveta lateral listando os participantes e seu papel (`admin`/`member`). Permite que o administrador do grupo convide novos amigos ou expulse membros da sala através de chamadas REST em tempo real.
