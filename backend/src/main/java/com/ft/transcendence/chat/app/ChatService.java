package com.ft.transcendence.chat.app;

import com.ft.transcendence.chat.domain.Chat;
import com.ft.transcendence.chat.domain.ChatParticipant;
import com.ft.transcendence.chat.domain.ChatMessage;
import com.ft.transcendence.chat.dto.*;
import com.ft.transcendence.common.dto.PageResponse;
import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.friendship.domain.Friendship;
import com.ft.transcendence.friendship.domain.FriendshipStatus;
import com.ft.transcendence.notification.app.NotificationDispatcher;
import com.ft.transcendence.user.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static io.quarkus.hibernate.orm.panache.PanacheEntityBase.find;

@ApplicationScoped
public class ChatService {

    @Inject
    StorageService storageService;

    @Inject
    NotificationDispatcher notificationDispatcher;

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
                            otherUser = userWithAvatarUrlAssigned(otherParticipant.user);
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

        if (!areFriends(currentUserId, userBId))
            throw new ForbiddenException("You can only start a conversation with friends");

        Optional<Chat> existing = ChatParticipant.findDirectChatId(currentUserId, userBId);
        if (existing.isPresent()) {
            UserMessageResponse otherUser = userWithAvatarUrlAssigned(userB);

            ChatMessage lastMessage = ChatMessage.find("chat.id = ?1 order by createdAt desc", existing.get().id).firstResult();
            return ChatResponse.of(existing.get(), otherUser, lastMessage);
        }

        Chat chat = Chat.createDirectChat();

        ChatParticipant.create(chat, userA, "member");
        ChatParticipant.create(chat, userB, "member");

        UserMessageResponse otherUser = userWithAvatarUrlAssigned(userB);

        return ChatResponse.of(chat, otherUser, null);
    }

    @Transactional
    public ChatResponse createGroupChat(Long currentUserId, CreateGroupChatRequest req) {
        if (req.participantIds.contains(currentUserId))
            throw new IllegalArgumentException("You cannot add yourself in group creation");

        if (req.chatName == null || req.chatName.isBlank())
            throw new BadRequestException("Group name is required");

        if (req.chatName.length() > 80)
            throw new BadRequestException("Group name must be at most 80 characters");

        Chat chat = Chat.createGroupChat(req.chatName);

        User currentUser = User.findById(currentUserId);
        ChatParticipant.create(chat, currentUser, "admin");

        HashSet<Long> participantIds = new HashSet<>(req.participantIds);

        for (Long userId : participantIds) {
            User user = User.findById(userId);
            if (user == null)
                throw new NotFoundException("User with id=" + userId + " not found");
            if (!areFriends(currentUserId, userId))
                throw new ForbiddenException("User with id=" + userId + " is not your friend");
            ChatParticipant.create(chat, user, "member");
        }
        for (Long userId : participantIds)
            notificationDispatcher.onAddedToGroup(currentUser, userId, chat);

        return ChatResponse.of(chat);
    }

    public PageResponse<ChatParticipantResponse> getGroupParticipants(Long chatId, Long currentUserId, int page, int size) {
        Chat chat = Chat.findById(chatId);
        if (chat == null)
            throw new NotFoundException("Chat not found");

        if (!"group".equals(chat.getType()))
            throw new BadRequestException("This chat is not a group");

        boolean isMember = ChatParticipant.count("chat.id = ?1 and user.id = ?2", chatId, currentUserId) > 0;
        if (!isMember)
            throw new ForbiddenException("You are not a participant of this chat");

        int start = page * size;
        int end = start + size;

        List<ChatParticipant> participants = ChatParticipant.find("chat.id = ?1", chatId)
                .range(start, end)
                .list();

        boolean hasMore = participants.size() > size;
        if (hasMore)
            participants = participants.subList(0, size);

        List<ChatParticipantResponse> items = participants.stream()
                .map(cp -> {
                    String avatarUrl = cp.user.avatarUrl;
                    if (avatarUrl != null && !avatarUrl.isBlank())
                        avatarUrl = storageService.generateUrl(avatarUrl);
                    return ChatParticipantResponse.of(cp, avatarUrl);
                })
                .toList();

        return new PageResponse<>(items, page, items.size(), hasMore);
    }

    @Transactional
    public void addParticipant(Long chatId, Long currentUserId, AddGroupParticipantRequest req) {
        Chat chat = Chat.findById(chatId);
        if (chat == null)
            throw new NotFoundException("Chat not found");

        if (!"group".equals(chat.getType()))
            throw new BadRequestException("This chat is not a group");

        if (!areFriends(currentUserId, req.userId))
            throw new ForbiddenException("User with id=" + req.userId + " is not your friend");

        ChatParticipant requester = ChatParticipant.find("chat.id = ?1 and user.id = ?2", chatId, currentUserId).firstResult();
        if (requester == null)
            throw new ForbiddenException("You are not a participant of this chat");

        if (!"admin".equals(requester.role))
            throw new ForbiddenException("Only admins can add participants");

        boolean alreadyMember = ChatParticipant.count("chat.id = ?1 and user.id = ?2", chatId, req.userId) > 0;
        if (alreadyMember)
            throw new BadRequestException("User is already a participant");

        User user = User.findById(req.userId);
        if (user == null)
            throw new NotFoundException("User not found");

        ChatParticipant.create(chat, user, "member");

        notificationDispatcher.onAddedToGroup(requester.user, user.id, chat);
    }

    @Transactional
    public void removeParticipant(Long chatId, Long currentUserId, Long targetUserId) {
        Chat chat = Chat.findById(chatId);
        if (chat == null)
            throw new NotFoundException("Chat not found");

        if (!"group".equals(chat.getType()))
            throw new BadRequestException("This chat is not a group");

        if (currentUserId.equals(targetUserId))
            throw new BadRequestException("You cannot remove yourself");

        ChatParticipant requester = ChatParticipant.find("chat.id = ?1 and user.id = ?2", chatId, currentUserId).firstResult();
        if (requester == null)
            throw new ForbiddenException("You are not a participant of this chat");

        if (!"admin".equals(requester.role))
            throw new ForbiddenException("Only admins can remove participants");

        ChatParticipant target = ChatParticipant.find("chat.id = ?1 and user.id = ?2", chatId, targetUserId).firstResult();
        if (target == null)
            throw new NotFoundException("User is not a participant of this chat");

        notificationDispatcher.onRemovedFromGroup(requester.user, target.user.id, chat);

        target.delete();
    }

    private boolean areFriends(Long userAId, Long userBId) {
        return Friendship.count(
                "(userId = ?1 and friendId = ?2 and status = ?3) or (userId = ?2 and friendId = ?1 and status = ?3)",
                userAId, userBId, FriendshipStatus.ACCEPTED
        ) > 0;
    }

    private UserMessageResponse userWithAvatarUrlAssigned(User u) {
        UserMessageResponse otherUser = UserMessageResponse.of(u);
        if (otherUser.avatarUrl != null && !otherUser.avatarUrl.isBlank())
            otherUser.avatarUrl = storageService.generateUrl(otherUser.avatarUrl);

        return otherUser;
    }
}
