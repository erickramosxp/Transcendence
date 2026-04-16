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
            System.out.println(">>> WEBSOCKET CONNECTED: " + socket.id());
            AuthenticatedSocketUser user = authService.authenticate(socket);
            registry.add(new RealtimeConnection(socket.id(), user.userId, socket));
            dispatcher.handleConnected(socket.id());
        } catch (NotAuthorizedException e) {
            socket.closeAndAwait(new CloseReason(1008, "Not authorized"));
        } catch (Exception e) {
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
        dispatcher.handleDisconnected(socket.id());
    }
}
