package com.ft.transcendence.chat.app;

import com.ft.transcendence.chat.domain.Chat;
import com.ft.transcendence.chat.domain.ChatParticipant;
import com.ft.transcendence.chat.domain.ChatMessage;
import com.ft.transcendence.chat.dto.*;
import com.ft.transcendence.user.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static io.quarkus.hibernate.orm.panache.PanacheEntityBase.find;

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

        List<ChatResponse> items = participations.stream()
                .map(participation -> {
                    Chat chat = participation.chat;
                    UserMessageResponse otherUser = null;

                    if ("direct".equals(chat.getType())) {
                        ChatParticipant otherParticipant = ChatParticipant.find("chat.id = ?1 and user.id <> ?2", chat.id, currentUserId).firstResult();
                        if (otherParticipant != null)
                            otherUser = UserMessageResponse.of(otherParticipant.user);
                    }

                    ChatMessage lastMessage = ChatMessage.find("chat.id = ?1 order by createdAt desc", chat.id).firstResult();

                    return ChatResponse.of(chat, otherUser,lastMessage);
                })
                .toList();

        return ListChatResponse.of(items, page, hasMore);
    }

    @Transactional
    public ChatResponse createDirectChat(Long currentUserId, CreateDirectChatRequest req) {
        Long userBId = req.directUserId;

        if (currentUserId.equals(userBId))
            throw new BadRequestException("Can't create chat with yourself");

        User userA = User.findById(currentUserId);
        User userB = User.findById(userBId);
        if (userA == null || userB == null)
            throw new NotFoundException("User not found");

        Optional<Chat> existing = ChatParticipant.findDirectChatId(currentUserId, userBId);
        if (existing.isPresent()) {
            UserMessageResponse otherUser = UserMessageResponse.of(userB);
            ChatMessage lastMessage = ChatMessage.find("chat.id = ?1 order by createdAt desc", existing.get().id).firstResult();
            return ChatResponse.of(existing.get(), otherUser, lastMessage);
        }

        Chat chat = Chat.createDirectChat();

        ChatParticipant.create(chat, userA, "member");
        ChatParticipant.create(chat, userB, "member");

        return ChatResponse.of(chat, UserMessageResponse.of(userB), null);
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
