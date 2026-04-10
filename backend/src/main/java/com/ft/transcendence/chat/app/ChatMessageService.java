package com.ft.transcendence.chat.app;

import com.ft.transcendence.chat.domain.ChatMessage;
import com.ft.transcendence.chat.domain.ChatParticipant;
import com.ft.transcendence.chat.dto.ChatMessagePageResponse;
import com.ft.transcendence.chat.dto.ChatMessageRequest;
import com.ft.transcendence.chat.dto.ChatMessageResponse;
import com.ft.transcendence.common.utils.Utils;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

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
                throw new BadRequestException("replyToId does not belong to this chat");
        }

        ChatMessage message = createChatMessage(chatParticipant.chat, currentUserId, req.text, req.mediaUrl, type, replyTo);

        return ChatMessageResponse.of(message);
    }

    public ChatMessagePageResponse listMessages(Long currentUserId, Long chatId, int page, int size) {
        ChatParticipant chatParticipant = ChatParticipant.find("chat.id = ?1 and user.id = ?2", chatId, currentUserId).firstResult();
        if (chatParticipant == null)
            throw new NotFoundException("Chat not found");

        if (page < 0 || size <= 0)
            throw new BadRequestException("Invalid page or size");

        int start = page * size;
        int end = start + size;

        List<ChatMessage> messages = ChatMessage.find("chat.id = ?1 order by createdAt desc", chatId)
                .range(start, end).list();

        boolean hasMore = messages.size() > size;
        if (hasMore)
            messages = messages.subList(0, size);

        return ChatMessagePageResponse.of(messages, page, hasMore);
    }
}
