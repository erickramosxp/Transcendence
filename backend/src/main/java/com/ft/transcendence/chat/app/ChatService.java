package com.ft.transcendence.chat.app;

import com.ft.transcendence.chat.domain.Chat;
import com.ft.transcendence.chat.domain.ChatParticipant;
import com.ft.transcendence.chat.dto.ChatResponse;
import com.ft.transcendence.chat.dto.CreateDirectChatRequest;
import com.ft.transcendence.chat.dto.ListChatResponse;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.user.domain.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ChatService {

    public ListChatResponse listUserChats(Long currentUserId) {
        List<ChatParticipant> participations = ChatParticipant.find("user.id = ?1 and chat is not null order by joinedAt desc", currentUserId).list();
        List<Chat> chats = participations.stream()
                .map(p -> p.chat)
                .toList();

        return ListChatResponse.of(chats);
    }

    @Transactional
    public ChatResponse createDirectChat(CreateDirectChatRequest req) {
        Long userAId = req.currentUserId;
        Long userBId = req.directUserId;

        if (userAId.equals(userBId))
            throw new BadRequestException("Can't create chat with yourself");

        Optional<Chat> existing = ChatParticipant.findDirectChatId(userAId, userBId);
        if (existing.isPresent())
            return ChatResponse.of(existing.get());

        User userA = User.findById(userAId);
        User userB = User.findById(userBId);
        if (userA == null || userB == null)
            throw new NotFoundException("User not found");

        Chat chat = Chat.createDirectChat();

        ChatParticipant.create(chat, userA, "member");
        ChatParticipant.create(chat, userB, "member");

        return ChatResponse.of(chat);
    }


}
