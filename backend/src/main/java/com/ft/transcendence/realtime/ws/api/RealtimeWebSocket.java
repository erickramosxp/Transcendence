package com.ft.transcendence.realtime.ws.api;

import com.ft.transcendence.common.metrics.SocialMetrics;
import com.ft.transcendence.realtime.ws.app.RealtimeEventDispatcher;
import com.ft.transcendence.realtime.ws.app.RealtimeSessionRegistry;
import com.ft.transcendence.realtime.ws.app.WsAuthService;
import com.ft.transcendence.realtime.ws.domain.RealtimeConnection;
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
    @Inject
    SocialMetrics metrics;

    @OnOpen
    @ActivateRequestContext
    public void onOpen() {
        try {
            AuthenticatedSocketUser user = authService.authenticate(socket);
            registry.add(new RealtimeConnection(socket.id(), user.userId, user.name, user.username, user.avatarUrl));
            dispatcher.handleConnected(socket.id());
            metrics.recordWsConnected();
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
        metrics.recordWsDisconnected();
        dispatcher.handleDisconnected(socket.id());
    }
}
