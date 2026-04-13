package com.ft.transcendence.realtime.ws;

import com.ft.transcendence.realtime.chat.RealtimeChatHandler;
import com.ft.transcendence.realtime.presence.RealtimePresenceHandler;
import com.ft.transcendence.realtime.ws.dto.RealtimeEventType;
import com.ft.transcendence.realtime.ws.dto.RealtimeIncomingEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class RealtimeEventDispatcher {

    @Inject
    RealtimeSessionRegistry registry;
    @Inject
    RealtimeChatHandler chatHandler;
    @Inject
    RealtimePresenceHandler presenceHandler;

    public void dispatch(String connectionId, RealtimeIncomingEvent event) {
        if (event == null || event.type == null)
            return;

        switch (event.type) {
            case RealtimeEventType.CHAT_SUBSCRIBE -> chatHandler.subscribe(connectionId, event.payload);
            case RealtimeEventType.CHAT_UNSUBSCRIBE -> chatHandler.unsubscribe(connectionId, event.payload);
            case RealtimeEventType.SEND_MESSAGE -> chatHandler.sendMessage(connectionId, event.payload);
            case RealtimeEventType.TYPING_START -> chatHandler.typingStart(connectionId, event.payload);
            case RealtimeEventType.TYPING_STOP -> chatHandler.typingStop(connectionId, event.payload);
            case RealtimeEventType.PRESENCE_SUBSCRIBE -> presenceHandler.subscribe(connectionId, event.payload);
            case RealtimeEventType.PRESENCE_UNSUBSCRIBE -> presenceHandler.unsubscribe(connectionId, event.payload);
            case RealtimeEventType.PING -> presenceHandler.ping(connectionId);
            default -> {
            }
        }
    }

    public void handleConnected(String connectionId) {
        presenceHandler.handleConnected(connectionId);
    }

    public void handleDisconnected(String connectionId) {
        presenceHandler.handleDisconnected(connectionId);
        registry.remove(connectionId);
    }
}
