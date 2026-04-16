package com.ft.transcendence.realtime.chat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ft.transcendence.chat.app.ChatMessageService;
import com.ft.transcendence.chat.domain.ChatParticipant;
import com.ft.transcendence.chat.dto.ChatMessageRequest;
import com.ft.transcendence.chat.dto.ChatMessageResponse;
import com.ft.transcendence.realtime.chat.dto.ChatSubscribePayload;
import com.ft.transcendence.realtime.chat.dto.SendMessagePayload;
import com.ft.transcendence.realtime.chat.dto.TypingEventPayload;
import com.ft.transcendence.realtime.chat.dto.TypingPayload;
import com.ft.transcendence.realtime.ws.RealtimeConnection;
import com.ft.transcendence.realtime.ws.RealtimeEventSender;
import com.ft.transcendence.realtime.ws.RealtimeSessionRegistry;
import com.ft.transcendence.realtime.ws.dto.RealtimeEventType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.ForbiddenException;

import java.util.Set;

@ApplicationScoped
public class RealtimeChatHandler {

    @Inject
    RealtimeSessionRegistry registry;
    @Inject
    ObjectMapper objectMapper;
    @Inject
    ChatMessageService chatMessageService;
    @Inject
    RealtimeEventSender sender;

    @Transactional
    public void subscribe(String connectionId, JsonNode payload) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null)
            return;

        ChatSubscribePayload req = objectMapper.convertValue(payload, ChatSubscribePayload.class);
        if (req == null || req.chatId == null)
            return;

        boolean chatParticipant = ChatParticipant.count("chat.id = ?1 and user.id = ?2", req.chatId, connection.userId) > 0;
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

    @Transactional
    public void sendMessage(String connectionId, JsonNode payload) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null)
            return;

        SendMessagePayload req = objectMapper.convertValue(payload, SendMessagePayload.class);
        if (req == null || req.chatId == null)
            return;

        if (!connection.subscribedChatIds.contains(req.chatId))
            return;

        ChatMessageRequest messageRequest = ChatMessageRequest.of(req);
        ChatMessageResponse message = chatMessageService.createMessage(connection.userId, req.chatId, messageRequest);

        Set<RealtimeConnection> subscribers = registry.getConnectionsByChat(req.chatId);
        for (RealtimeConnection subscriber : subscribers) {
            sender.send(subscriber, RealtimeEventType.MESSAGE_CREATED, message);
        }
    }

    public void typingStart(String connectionId, JsonNode payload) {
        broadcastTyping(connectionId, payload, RealtimeEventType.TYPING_START);
    }

    public void typingStop(String connectionId, JsonNode payload) {
        broadcastTyping(connectionId, payload, RealtimeEventType.TYPING_STOP);
    }

    private void broadcastTyping(String connectionId, JsonNode payload, String eventType) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null)
            return;

        TypingPayload req = objectMapper.convertValue(payload, TypingPayload.class);
        if (req == null || req.chatId == null)
            return;

        if (!connection.subscribedChatIds.contains(req.chatId))
            return;

        TypingEventPayload outgoing = TypingEventPayload.of(connection.userId, req.chatId);

        Set<RealtimeConnection> subscribers = registry.getConnectionsByChat(req.chatId);
        for (RealtimeConnection subscriber : subscribers) {
            if (!subscriber.connectionId.equals(connectionId))
                sender.send(subscriber, eventType, outgoing);
        }
    }
}
