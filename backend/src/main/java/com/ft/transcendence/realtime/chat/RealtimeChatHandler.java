package com.ft.transcendence.realtime.chat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ft.transcendence.chat.app.ChatMessageService;
import com.ft.transcendence.chat.domain.ChatParticipant;
import com.ft.transcendence.chat.dto.ChatMessageRequest;
import com.ft.transcendence.chat.dto.ChatMessageResponse;
import com.ft.transcendence.realtime.chat.dto.*;
import com.ft.transcendence.realtime.ws.domain.RealtimeConnection;
import com.ft.transcendence.realtime.ws.app.RealtimeEventSender;
import com.ft.transcendence.realtime.ws.app.RealtimeSessionRegistry;
import com.ft.transcendence.realtime.ws.dto.RealtimeErrorPayload;
import com.ft.transcendence.realtime.ws.dto.RealtimeEventType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.ForbiddenException;

import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

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
        if (connection == null) {
            return;
        }

        ChatSubscribePayload req = objectMapper.convertValue(payload, ChatSubscribePayload.class);
        if (req == null) {
            sendError(connection,"INVALID_PAYLOAD", "Payload is required", RealtimeEventType.CHAT_SUBSCRIBE);
            return;
        }

        if (req.chatId == null) {
            sendError(connection,"MISSING_FIELD","chatId is required", RealtimeEventType.CHAT_SUBSCRIBE);
            return;
        }

        boolean chatParticipant = ChatParticipant.count("chat.id = ?1 and user.id = ?2", req.chatId, connection.userId) > 0;
        if (!chatParticipant)
            throw new ForbiddenException("User is not participant of this chat");

        registry.subscribeChat(connectionId, req.chatId);
    }

    @Transactional
    public void unsubscribe(String connectionId, JsonNode payload) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null) {
            return;
        }

        ChatSubscribePayload req = objectMapper.convertValue(payload, ChatSubscribePayload.class);
        if (req == null) {
            sendError(connection,"INVALID_PAYLOAD", "Payload is required", RealtimeEventType.CHAT_SUBSCRIBE);
            return;
        }

        if (req.chatId == null) {
            sendError(connection,"MISSING_FIELD","chatId is required", RealtimeEventType.CHAT_SUBSCRIBE);
            return;
        }

        boolean chatParticipant = ChatParticipant.count("chat.id = ?1 and user.id = ?2", req.chatId, connection.userId) > 0;
        if (!chatParticipant)
            throw new ForbiddenException("User is not participant of this chat");

        registry.unsubscribeChat(connectionId, req.chatId);
    }

    private Set<RealtimeConnection> getOnlineParticipants(Long chatId) {
        Set<RealtimeConnection> result = ConcurrentHashMap.newKeySet();

        List<Long> participantIds = ChatParticipant.find(
                "select cp.user.id from ChatParticipant cp where cp.chat.id = ?1",
                chatId
        ).project(Long.class).list();

        for (Long participantId : participantIds) {
            result.addAll(registry.getConnectionsByUserId(participantId));
        }

        return result;
    }

    @Transactional
    public void sendMessage(String connectionId, JsonNode payload) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null) {
            return;
        }

        SendMessagePayload req = objectMapper.convertValue(payload, SendMessagePayload.class);
        if (req == null) {
            sendError(connection,"INVALID_PAYLOAD", "Payload is required", RealtimeEventType.SEND_MESSAGE);
            return;
        }

        if (req.chatId == null) {
            sendError(connection,"MISSING_FIELD","chatId is required", RealtimeEventType.SEND_MESSAGE);
            return;
        }

        boolean chatParticipant = ChatParticipant.count("chat.id = ?1 and user.id = ?2", req.chatId, connection.userId) > 0;
        if (!chatParticipant) {
            sendError(connection,"NON_PARTICIPANT","User does not participate in this chat", RealtimeEventType.SEND_MESSAGE);
            return;
        }

        ChatMessageRequest messageRequest = ChatMessageRequest.of(req);
        ChatMessageResponse message = chatMessageService.createMessage(connection.userId, req.chatId, messageRequest);

        Set<RealtimeConnection> participants = getOnlineParticipants(req.chatId);

        for (RealtimeConnection participant : participants) {
            sender.send(participant.connectionId, RealtimeEventType.MESSAGE_CREATED, message);
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
        if (connection == null) {
            return;
        }

        TypingPayload req = objectMapper.convertValue(payload, TypingPayload.class);
        if (req == null) {
            sendError(connection,"INVALID_PAYLOAD", "Payload is required", eventType);
            return;
        }

        if (req.chatId == null) {
            sendError(connection,"MISSING_FIELD","chatId is required", eventType);
            return;
        }

        if (!connection.subscribedChatIds.contains(req.chatId)) {
            sendError(connection,"NOT_SUBSCRIBED","Connection is not subscribed to this chat", eventType);
            return;
        }

        TypingEventPayload outgoing = TypingEventPayload.of(connection.userId, req.chatId, connection.username);
        Set<RealtimeConnection> subscribers = registry.getConnectionsByChat(req.chatId);

        System.out.println("Passou aqui!!!");
        for (RealtimeConnection subscriber : subscribers) {
            boolean skip = subscriber.connectionId.equals(connectionId);

            if (!skip)
                sender.send(subscriber.connectionId, eventType, outgoing);
        }
    }

    private void sendError(RealtimeConnection connection, String code, String message, String originalType) {
        if (connection == null)
            return;
        sender.send(connection.connectionId, RealtimeEventType.ERROR, RealtimeErrorPayload.of(code, message, originalType));
    }
}
