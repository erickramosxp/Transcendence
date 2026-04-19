package com.ft.transcendence.realtime.ws.app;

import com.ft.transcendence.realtime.chat.RealtimeChatHandler;
import com.ft.transcendence.realtime.presence.RealtimePresenceHandler;
import com.ft.transcendence.realtime.ws.domain.RealtimeConnection;
import com.ft.transcendence.realtime.ws.dto.RealtimeErrorPayload;
import com.ft.transcendence.realtime.ws.dto.RealtimeEventType;
import com.ft.transcendence.realtime.ws.dto.RealtimeIncomingEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class RealtimeEventDispatcher {

    @Inject
    RealtimeSessionRegistry registry;
    @Inject
    RealtimeChatHandler chatHandler;
    @Inject
    RealtimePresenceHandler presenceHandler;
    @Inject
    RealtimeEventSender sender;

    public void dispatch(String connectionId, RealtimeIncomingEvent event) {
        if (event == null || event.type == null) {
            sendError(connectionId, "INVALID_EVENT", "Event type is missing", null);
            return;
        }

        try {
            switch (event.type) {
                case RealtimeEventType.CHAT_SUBSCRIBE -> chatHandler.subscribe(connectionId, event.payload);
                case RealtimeEventType.CHAT_UNSUBSCRIBE -> chatHandler.unsubscribe(connectionId, event.payload);
                case RealtimeEventType.SEND_MESSAGE -> chatHandler.sendMessage(connectionId, event.payload);
                case RealtimeEventType.TYPING_START -> chatHandler.typingStart(connectionId, event.payload);
                case RealtimeEventType.TYPING_STOP -> chatHandler.typingStop(connectionId, event.payload);
                case RealtimeEventType.PRESENCE_SUBSCRIBE -> presenceHandler.subscribe(connectionId);
                case RealtimeEventType.PRESENCE_UNSUBSCRIBE -> presenceHandler.unsubscribe(connectionId);
                case RealtimeEventType.PING -> presenceHandler.ping(connectionId);
                default -> {
                    sender.send(connectionId, RealtimeEventType.ERROR,
                            RealtimeErrorPayload.of("UNKNOWN_EVENT_TYPE","Unsupported realtime event type", event.type));
                }
            }
        } catch (ForbiddenException e) {
            sendError(connectionId, "FORBIDDEN", e.getMessage(), event.type);
        } catch (NotFoundException e) {
            sendError(connectionId, "NOT_FOUND", e.getMessage(), event.type);
        } catch (BadRequestException e) {
            sendError(connectionId, "BAD_REQUEST", e.getMessage(), event.type);
        } catch (Exception e) {
            sendError(connectionId, "INTERNAL_ERROR", "Unexpected error processing event", event.type);
        }
    }

    public void handleConnected(String connectionId) {
        presenceHandler.handleConnected(connectionId);
    }

    public void handleDisconnected(String connectionId) {
        presenceHandler.handleDisconnected(connectionId);
        registry.remove(connectionId);
    }

    private void sendError(String connectionId, String code, String message, String originalType) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null)
            return;

        RealtimeErrorPayload error = RealtimeErrorPayload.of(code, message, originalType);
        sender.send(connection.connectionId, RealtimeEventType.ERROR, error);
    }
}
