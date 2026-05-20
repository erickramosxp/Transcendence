package com.ft.transcendence.chat.app;

import com.ft.transcendence.chat.domain.ChatMessage;
import com.ft.transcendence.chat.domain.ChatParticipant;
import com.ft.transcendence.chat.dto.ChatMessagePageResponse;
import com.ft.transcendence.chat.dto.ChatMessageRequest;
import com.ft.transcendence.chat.dto.ChatMessageResponse;
import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.common.utils.Utils;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import static com.ft.transcendence.chat.domain.ChatMessage.createChatMessage;

@ApplicationScoped
public class ChatMessageService {

    @Inject
    StorageService storageService;

    @Transactional
    public ChatMessageResponse createMessage(Long currentUserId, Long chatId, ChatMessageRequest req) {
        ChatParticipant chatParticipant = ChatParticipant.find("chat.id = ?1 and user.id = ?2", chatId, currentUserId).firstResult();
        if (chatParticipant == null)
            throw new NotFoundException("Chat not found");

        if (req.text == null || req.text.isBlank())
            if (req.mediaUrl == null || req.mediaUrl.isBlank())
                throw new BadRequestException("Message must contain text or media");

        if (req.text != null && req.text.length() > 4000)
            throw new BadRequestException("Message must be at most 4000 characters");

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
        ChatMessageResponse cm = ChatMessageResponse.of(message);

        if (cm.user.avatarUrl != null && !cm.user.avatarUrl.isBlank())
            cm.user.avatarUrl = storageService.generateUrl(cm.user.avatarUrl);

        if (cm.mediaUrl != null && !cm.mediaUrl.isBlank())
            cm.mediaUrl = storageService.generateUrl(cm.mediaUrl);

        return cm;
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

        ChatMessagePageResponse cmpr = ChatMessagePageResponse.of(messages, page, hasMore);

        cmpr.items.forEach(i -> {
            if (i.user.avatarUrl != null && !i.user.avatarUrl.isBlank())
                i.user.avatarUrl = storageService.generateUrl(i.user.avatarUrl);
            if (i.mediaUrl != null && !i.mediaUrl.isBlank())
                i.mediaUrl = storageService.generateUrl(i.mediaUrl);
        });

        return cmpr;
    }
}
