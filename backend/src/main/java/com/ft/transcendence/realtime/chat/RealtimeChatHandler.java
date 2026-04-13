package com.ft.transcendence.realtime.chat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ft.transcendence.chat.domain.ChatParticipant;
import com.ft.transcendence.realtime.chat.dto.ChatSubscribePayload;
import com.ft.transcendence.realtime.ws.RealtimeConnection;
import com.ft.transcendence.realtime.ws.RealtimeSessionRegistry;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class RealtimeChatHandler {

    @Inject
    RealtimeSessionRegistry registry;
    @Inject
    ObjectMapper objectMapper;

    public void subscribe(String connectionId, JsonNode payload) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null)
            return;

        ChatSubscribePayload req = objectMapper.convertValue(payload, ChatSubscribePayload.class);
        if (req == null || req.chatId == null)
            return;

        boolean chatParticipant = ChatParticipant.find("chat.id = ?1 and user.id = ?2", req.chatId, connection.userId).firstResult().isPersistent();
        if (!chatParticipant)
            throw new ForbiddenException("User is not participant of this chat");

        registry.subscribeChat(connectionId, req.chatId);
    }

    public void unsubscribe(String connectionId, JsonNode payload) {
        ChatSubscribePayload req = objectMapper.convertValue(payload, ChatSubscribePayload.class);
        if (req == null || req.chatId == null)
            return;

        registry.unsubscribeChat(connectionId, req.chatId);
    }

    /*public void sendMessage(String connectionId, JsonNode payload) {
        // próximo passo
    }

    public void typingStart(String connectionId, JsonNode payload) {
        // próximo passo
    }

    public void typingStop(String connectionId, JsonNode payload) {
        // próximo passo
    }*/
}