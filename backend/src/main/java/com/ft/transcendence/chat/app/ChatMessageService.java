package com.ft.transcendence.chat.app;

import com.ft.transcendence.chat.domain.ChatMessage;
import com.ft.transcendence.chat.domain.ChatParticipant;
import com.ft.transcendence.chat.dto.ChatMessageRequest;
import com.ft.transcendence.chat.dto.ChatMessageResponse;
import com.ft.transcendence.common.utils.Utils;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import static com.ft.transcendence.chat.domain.ChatMessage.createChatMessage;

@ApplicationScoped
public class ChatMessageService {

    @Transactional
    public ChatMessageResponse createMessage(Long currentUserId, Long chatId, ChatMessageRequest req) {
        ChatParticipant chatParticipant = ChatParticipant.find("chat.id = ?1 and user.id = ?2", chatId, currentUserId).firstResult();
        if (chatParticipant == null)
            throw new NotFoundException("Chat not found");

        String type = Utils.resolveType(req.text, req.mediaUrl).getValue();

        ChatMessage replyTo = null;
        if (req.replyToId != null) {
             replyTo = ChatMessage.findById(req.replyToId);
            if (replyTo == null)
                throw new NotFoundException("Message reply not found");
            if (!replyTo.chat.id.equals(chatId))
                throw new BadRequestException("repltToId does not belong to this chat");
        }

        ChatMessage message = createChatMessage(chatParticipant.chat, currentUserId, req.text, req.mediaUrl, type, replyTo);

        return ChatMessageResponse.of(message);
    }
}
