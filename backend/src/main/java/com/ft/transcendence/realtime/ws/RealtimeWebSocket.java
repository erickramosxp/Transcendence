package com.ft.transcendence.realtime.ws;

import com.ft.transcendence.realtime.ws.dto.AuthenticatedSocketUser;
import com.ft.transcendence.realtime.ws.dto.RealtimeIncomingEvent;
import io.quarkus.websockets.next.*;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotAuthorizedException;

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
    @ActivateRequestContext
    public void onOpen() {
        try {
            AuthenticatedSocketUser user = authService.authenticate(socket);
            System.out.println("[WS][OPEN] socketId=" + socket.id() + " userId=" + user.userId);
            registry.add(new RealtimeConnection(socket.id(), user.userId, user.name));
            dispatcher.handleConnected(socket.id());
        } catch (NotAuthorizedException e) {
            System.out.println("[WS][OPEN][AUTH_FAIL] socketId=" + socket.id() + " reason=not_authorized");
            socket.closeAndAwait(new CloseReason(1008, "Not authorized"));
        } catch (Exception e) {
            System.out.println("[WS][OPEN][ERROR] socketId=" + socket.id() + " error=" + e.getClass().getSimpleName() + " message=" + e.getMessage());
            socket.closeAndAwait(new CloseReason(1011, "Internal error"));
        }
    }

    @OnTextMessage
    @ActivateRequestContext
    public void onMessage(RealtimeIncomingEvent event) {
        dispatcher.dispatch(socket.id(), event);
    }

    @OnClose
    @ActivateRequestContext
    public void onClose() {
        System.out.println("[WS][CLOSE] socketId=" + socket.id());
        dispatcher.handleDisconnected(socket.id());
    }
}
