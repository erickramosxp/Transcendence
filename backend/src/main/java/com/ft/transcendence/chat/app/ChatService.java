package com.ft.transcendence.chat.app;

import com.ft.transcendence.chat.domain.Chat;
import com.ft.transcendence.chat.domain.ChatParticipant;
import com.ft.transcendence.chat.dto.*;
import com.ft.transcendence.user.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ChatService {

    public ListChatResponse listUserChats(int page, int size, Long currentUserId) {
        if (page < 0 || size <= 0)
            throw new BadRequestException("Invalid page or size");

        int start = page * size;
        int end = start + size;

        List<ChatParticipant> participations = ChatParticipant.find("user.id = ?1 and chat is not null order by joinedAt desc", currentUserId)
                .range(start, end)
                .list();

        boolean hasMore = participations.size() > size;
        if (hasMore)
            participations = participations.subList(0, size);

        List<Chat> chats = participations.stream().map(p -> p.chat).toList();

        return ListChatResponse.of(chats, page, hasMore);
    }

    @Transactional
    public ChatResponse createDirectChat(Long currentUserId, CreateDirectChatRequest req) {
        Long userBId = req.directUserId;

        if (currentUserId.equals(userBId))
            throw new BadRequestException("Can't create chat with yourself");

        Optional<Chat> existing = ChatParticipant.findDirectChatId(currentUserId, userBId);
        if (existing.isPresent())
            return ChatResponse.of(existing.get());

        User userA = User.findById(currentUserId);
        User userB = User.findById(userBId);
        if (userA == null || userB == null)
            throw new NotFoundException("User not found");

        Chat chat = Chat.createDirectChat();

        ChatParticipant.create(chat, userA, "member");
        ChatParticipant.create(chat, userB, "member");

        return ChatResponse.of(chat);
    }

    @Transactional
    public ChatResponse createGroupChat(Long currentUserId, CreateGroupChatRequest req) {
        if (req.participantIds.contains(currentUserId))
            throw new IllegalArgumentException("You cannot add yourself in group creation");

        Chat chat = Chat.createGroupChat(req.chatName);

        User currentUser = User.findById(currentUserId);
        ChatParticipant.create(chat, currentUser, "admin");

        for (Long userId : req.participantIds) {
            User user = User.findById(userId);
            if (user == null)
                throw new NotFoundException("User whit id=" + userId + " not found");
            ChatParticipant.create(chat, user, "member");
        }

        return ChatResponse.of(chat);
    }
}
