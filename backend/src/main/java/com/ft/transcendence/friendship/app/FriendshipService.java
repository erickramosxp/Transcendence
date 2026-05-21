package com.ft.transcendence.friendship.app;

import com.ft.transcendence.common.dto.PageResponse;
import com.ft.transcendence.common.metrics.SocialMetrics;
import com.ft.transcendence.friendship.domain.Friendship;
import com.ft.transcendence.friendship.domain.FriendshipStatus;
import com.ft.transcendence.friendship.dto.FriendshipDTO;
import com.ft.transcendence.notification.app.NotificationDispatcher;
import com.ft.transcendence.user.app.UserAvatarService;
import com.ft.transcendence.user.domain.User;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@ApplicationScoped
public class FriendshipService {

    @Inject
    SocialMetrics metrics;

    @Inject
    NotificationDispatcher notificationDispatcher;

    @Inject
    UserAvatarService userAvatarService;

    @Transactional
    public FriendshipDTO sendRequest(Long currentUserId, Long targetUserId) {

        if (currentUserId.equals(targetUserId))
            throw new WebApplicationException("You can't add yourself", Response.Status.BAD_REQUEST);

        Optional<User> targetUser = User.findByIdOptional(targetUserId);
        if (!targetUser.isPresent())
            throw new WebApplicationException("User not found", Response.Status.NOT_FOUND);

        long count = Friendship.count(
                "(userId = ?1 AND friendId = ?2) OR (userId = ?2 AND friendId = ?1)",
                currentUserId, targetUserId
        );
        if (count > 0)
            throw new WebApplicationException("Friendship already exists or is pending", Response.Status.CONFLICT);

        Friendship request = new Friendship();
        request.userId = currentUserId;
        request.friendId = targetUserId;
        request.status = FriendshipStatus.PENDING;
        request.persist();

        metrics.recordFriendRequestSent();
        User actor = User.findById(currentUserId);
        User friendUser = targetUser.get();

        notificationDispatcher.onFriendRequest(actor, targetUserId, request.id);

        return new FriendshipDTO(request.id, request.friendId, friendUser.name, friendUser.username, null);
    }

    public List<FriendshipDTO> getPendingRequests(Long currentUserId) {

        List<FriendshipDTO> requests = Friendship.find(
                        "SELECT f.id, u.id, u.name, u.username, u.avatarUrl " +
                                "FROM Friendship f JOIN User u ON f.userId = u.id " +
                                "WHERE f.friendId = ?1 AND f.status = 'PENDING'",
                        currentUserId
        ).project(FriendshipDTO.class).list();

        List<Long> requesterIds = requests.stream().map(f -> f.friendId).toList();
        Map<Long, String> avatars = userAvatarService.getAvatarUrlsByIds(requesterIds);


        requests.forEach(request -> {
            request.avatarUrl = avatars.get(request.friendId);
        });

        return requests;
    }

    public PageResponse<FriendshipDTO> getFriendsList(Long currentUserId, int pageIndex, int pageSize, String searchQuery) {

        if (pageIndex < 0 || pageSize <= 0)
            throw new BadRequestException("Invalid page or size");

        int start = pageIndex * pageSize;
        int end = start + pageSize;

        String hql = "SELECT f.id, u.id, u.name, u.username, u.avatarUrl " +
                "FROM Friendship f JOIN User u ON f.friendId = u.id " +
                "WHERE f.userId = ?1 AND f.status = 'ACCEPTED'";

        PanacheQuery<FriendshipDTO> query;

        if (searchQuery != null && !searchQuery.trim().isEmpty()) {
            String filter = "%" + searchQuery.toLowerCase() + "%";
            hql += " AND (LOWER(u.name) LIKE ?2 OR LOWER(u.username) LIKE ?2)";
            query = Friendship.find(hql, currentUserId, filter).project(FriendshipDTO.class);
        } else {
            query = Friendship.find(hql, currentUserId).project(FriendshipDTO.class);
        }

        List<FriendshipDTO> paginatedFriends = query.range(start, end).list();

        boolean hasMore = paginatedFriends.size() > pageSize;
        if (hasMore)
            paginatedFriends = paginatedFriends.subList(0, pageSize);

        List<Long> requesterIds = paginatedFriends.stream().map(f -> f.friendId).toList();
        Map<Long, String> avatars = userAvatarService.getAvatarUrlsByIds(requesterIds);

        paginatedFriends.forEach(friend -> {
            friend.avatarUrl = avatars.get(friend.friendId);
        });

        return new PageResponse<>(paginatedFriends, pageIndex, pageSize, hasMore);
    }

    @Transactional
    public void acceptRequest(Long friendshipId, Long currentUserId) {

        Friendship request = getAndValidatePendingRequest(friendshipId, currentUserId);

        request.status = FriendshipStatus.ACCEPTED;

        Friendship mirror = new Friendship();
        mirror.userId = request.friendId;
        mirror.friendId = request.userId;
        mirror.status = FriendshipStatus.ACCEPTED;
        mirror.persist();

        User actor = User.findById(currentUserId);
        metrics.recordFriendRequestAccepted();
        notificationDispatcher.onFriendAccepted(actor, request.userId);
    }

    @Transactional
    public void deleteRequest(Long friendshipId, Long currentUserId) {

        Friendship request = getAndValidatePendingRequest(friendshipId, currentUserId);
        request.delete();

        metrics.recordFriendRequestRejected();
        User actor = User.findById(currentUserId);
        notificationDispatcher.onFriendReject(actor, request.userId);
    }

    @Transactional
    public void removeFriendship(Long currentUserId, Long friendshipId) {

        Friendship friendship = Friendship.<Friendship>findByIdOptional(friendshipId)
                .orElseThrow(() -> new WebApplicationException("Amizade não encontrada", Response.Status.NOT_FOUND));

        if (!friendship.userId.equals(currentUserId) && !friendship.friendId.equals(currentUserId))
            throw new WebApplicationException("Você não tem permissão para desfazer esta amizade", Response.Status.FORBIDDEN);

        Friendship.delete(
                "(userId = ?1 AND friendId = ?2) OR (userId = ?2 AND friendId = ?1)",
                friendship.userId, friendship.friendId
        );

        Long otherUserId = friendship.userId.equals(currentUserId)
                ? friendship.friendId
                : friendship.userId;

        metrics.recordFriendshipRemoved();
        User actor = User.findById(currentUserId);
        notificationDispatcher.onFriendBroken(actor, otherUserId);
    }

    public List<FriendshipDTO> searchFriends(Long myId, String query) {

        String filter = "%" + query.toLowerCase() + "%";

        List<FriendshipDTO> friends = Friendship.find(
                        "SELECT f.id, u.id, u.name, u.username, u.avatarUrl " +
                                "FROM Friendship f JOIN User u ON f.friendId = u.id " +
                                "WHERE f.userId = ?1 AND f.status = 'ACCEPTED' " +
                                "AND (LOWER(u.name) LIKE ?2 OR LOWER(u.username) LIKE ?2)",
                        myId, filter
                )
                .project(FriendshipDTO.class)
                .list();

        return friends;
    }

    public PageResponse<FriendshipDTO> getOnlineFriends(Long currentUserId) {
        return getFriendsList(currentUserId, 0, 10, null);
    }

    private Friendship getAndValidatePendingRequest(Long friendshipId, Long currentUserId) {

        Friendship request = Friendship.<Friendship>findByIdOptional(friendshipId)
                .orElseThrow(() -> new WebApplicationException("Request not found", Response.Status.NOT_FOUND));

        if (!request.friendId.equals(currentUserId)) {
            throw new WebApplicationException("You do not have permission to do this request", Response.Status.FORBIDDEN);
        }

        if (!request.status.equals(FriendshipStatus.PENDING)) {
            throw new WebApplicationException("This order is no longer pending", Response.Status.BAD_REQUEST);
        }

        return request;
    }
}
