package com.ft.transcendence.chat.ws;

import com.ft.transcendence.chat.app.ChatMessageService;
import com.ft.transcendence.chat.domain.ChatParticipant;
import com.ft.transcendence.chat.dto.ChatMessageRequest;
import com.ft.transcendence.chat.dto.ChatMessageResponse;
import com.ft.transcendence.chat.dto.IncomingChatEvent;
import com.ft.transcendence.chat.dto.OutgoingChatEvent;
import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class ChatRealtimeService {

    @Inject
    ChatSessionRegistry chatSessionRegistry;
    @Inject
    ChatMessageService chatMessageService;

    public void register(Long chatId, Long userId, WebSocketConnection connection) {
        ChatParticipant chatParticipant = ChatParticipant.find("chat.id = ?1 and user.id = ?2", chatId, userId).firstResult();
        if (chatParticipant == null)
            throw new NotAuthorizedException("User is not a participant of this chat");

        chatSessionRegistry.add(chatId, connection);
    }

    public void unregister(Long chatId, WebSocketConnection connection) {
        chatSessionRegistry.remove(chatId, connection);
    }

    public void handleIncomingMessage(Long chatId, Long userId, IncomingChatEvent event) {
        if (!"SEND_MESSAGE".equals(event.action))
            return;

        ChatMessageResponse saved = chatMessageService.createMessage(userId, chatId, ChatMessageRequest.of(event));

        OutgoingChatEvent outgoing = OutgoingChatEvent.of("MESSAGE_CREATED", saved);

        for (WebSocketConnection conn : chatSessionRegistry.getConnections(chatId)) {
            conn.sendTextAndAwait(outgoing);
        }
    }
}
