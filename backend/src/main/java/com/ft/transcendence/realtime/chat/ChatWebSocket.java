package com.ft.transcendence.realtime.chat;

import io.quarkus.websockets.next.WebSocket;
import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.inject.Inject;

@WebSocket(path = "/ws/chats/{chatId}")
public class ChatWebSocket {

    @Inject
    WebSocketConnection connection;
    @Inject
    ChatRealtimeService chatRealtimeService;
    @Inject


}
