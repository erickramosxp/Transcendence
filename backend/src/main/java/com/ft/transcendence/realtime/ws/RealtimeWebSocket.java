package com.ft.transcendence.realtime.ws;

import com.ft.transcendence.realtime.ws.dto.AuthenticatedSocketUser;
import com.ft.transcendence.realtime.ws.dto.RealtimeIncomingEvent;
import io.quarkus.websockets.next.*;
import jakarta.inject.Inject;

@WebSocket(path = "/ws/realtime")
public class RealtimeWebSocket {

    @Inject
    WebSocketConnection socket;
    @Inject
    RealtimeSessionRegistry registry;
    @Inject
    RealtimeEventDispatcher dispatcher;
    @Inject
    WsAuthService authService;

    @OnOpen
    public void onOpen() {
        AuthenticatedSocketUser user = authService.authenticate(socket);
        registry.add(new RealtimeConnection(socket.id(), user.userId, socket));
        dispatcher.handleConnected(socket.id());
    }

    @OnTextMessage
    public void onMessage(RealtimeIncomingEvent event) {
        dispatcher.dispatch(socket.id(), event);
    }

    @OnClose
    public void onClose() {
        dispatcher.handleDisconnected(socket.id());
    }
}
