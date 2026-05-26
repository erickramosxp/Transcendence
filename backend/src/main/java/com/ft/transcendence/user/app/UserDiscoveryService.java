package com.ft.transcendence.user.app;

import com.ft.transcendence.common.dto.PageResponse;
import com.ft.transcendence.friendship.domain.Friendship;
import com.ft.transcendence.friendship.domain.FriendshipStatus;
import com.ft.transcendence.preferences.domain.UserPreference;
import com.ft.transcendence.user.domain.User;
import com.ft.transcendence.user.dto.UserSearchDTO;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ApplicationScoped
public class UserDiscoveryService {

    @Inject
    UserAvatarService userAvatarService;

    public PageResponse<UserSearchDTO> searchUsers(Long currentUserId, int page, int size, String searchQuery, String location, String language, String sortBy, String sortDir) {

        PanacheQuery<User> query = buildSearchQuery(currentUserId, searchQuery, location, language, sortBy, sortDir);

        int startIndex = page * size;
        List<User> users = new ArrayList<>(query.range(startIndex, startIndex + size).list());

        boolean hasMore = users.size() > size;
        if (hasMore) {
            users.remove(users.size() - 1);
        }

        if (users.isEmpty()) {
            return new PageResponse<>(List.of(), page, size, false);
        }

        List<Long> pageUserIds = users.stream().map(u -> u.id).toList();
        Map<Long, String> avatarMap = userAvatarService.getAvatarUrlsByIds(pageUserIds);
        Map<Long, String> languageMap = fetchLanguageMap(pageUserIds);
        Map<Long, Long> mutualFriendsMap = fetchMutualFriendsMap(currentUserId, pageUserIds);
        List<Friendship> relations = fetchFriendshipRelations(currentUserId, pageUserIds);

        List<UserSearchDTO> dtoList = users.stream()
                .map(user -> mapToDTO(user, currentUserId, languageMap, mutualFriendsMap, relations, avatarMap))
                .toList();

        return new PageResponse<>(dtoList, page, size, hasMore);
    }


    private PanacheQuery<User> buildSearchQuery(Long currentUserId, String searchQuery, String location, String language, String sortBy, String sortDir) {
        StringBuilder hql = new StringBuilder("FROM User u WHERE u.id != :currentUserId ");
        Map<String, Object> params = new HashMap<>();
        params.put("currentUserId", currentUserId);

        applyFilters(hql, params, searchQuery, location, language);
        return applySorting(hql, params, currentUserId, sortBy, sortDir);
    }

    private void applyFilters(StringBuilder hql, Map<String, Object> params, String searchQuery, String location, String language) {
        if (searchQuery != null && !searchQuery.isBlank()) {
            hql.append("AND (cast(function('f_unaccent', u.name) as string) ILIKE cast(function('f_unaccent', :search) as string) ")
                    .append("OR u.username ILIKE :search ")
                    .append("OR cast(function('f_unaccent', u.biography) as string) ILIKE cast(function('f_unaccent', :search) as string)) ");
            params.put("search", "%" + searchQuery + "%");
        }

        if (location != null && !location.isBlank()) {
            hql.append("AND cast(function('f_unaccent', u.location) as string) ILIKE cast(function('f_unaccent', :location) as string) ");
            params.put("location", "%" + location + "%");
        }

        if (language != null && !language.isBlank() && !language.equals("all")) {
            hql.append("AND u.id IN (SELECT p.user.id FROM UserPreference p WHERE p.language = :language) ");
            params.put("language", language);
        }
    }

    private PanacheQuery<User> applySorting(StringBuilder hql, Map<String, Object> params, Long currentUserId, String sortBy, String sortDir) {
        if ("mutualfriends".equalsIgnoreCase(sortBy)) {
            String dir = "desc".equalsIgnoreCase(sortDir) ? "DESC" : "ASC";
            hql.append(" ORDER BY (")
                    .append("SELECT COUNT(f2.friendId) FROM Friendship f1 JOIN Friendship f2 ON f1.friendId = f2.friendId ")
                    .append("WHERE f1.userId = :currentUserId AND f1.status = 'ACCEPTED' ")
                    .append("AND f2.userId = u.id AND f2.status = 'ACCEPTED'")
                    .append(") ").append(dir)
                    .append(", u.createdAt DESC");

            return User.find(hql.toString(), params);
        }

        String safeSortField = validateSortField(sortBy);
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.Descending : Sort.Direction.Ascending;
        return User.find(hql.toString(), Sort.by(safeSortField, direction), params);
    }

    private String validateSortField(String sortBy) {
        if (sortBy == null) return "u.createdAt";
        return switch (sortBy.toLowerCase()) {
            case "name" -> "u.name";
            case "username" -> "u.username";
            case "lastlogin" -> "u.lastLogin";
            case "mutualfriends" -> "mutualfriends";
            default -> "u.createdAt";
        };
    }


    private Map<Long, String> fetchLanguageMap(List<Long> userIds) {
        List<UserPreference> preferences = UserPreference.find("user.id IN ?1", userIds).list();
        return preferences.stream()
                .collect(Collectors.toMap(p -> p.user.id, p -> p.language));
    }

    private Map<Long, Long> fetchMutualFriendsMap(Long currentUserId, List<Long> userIds) {
        String hql = "SELECT f2.userId, COUNT(f2.friendId) " +
                "FROM Friendship f1 " +
                "JOIN Friendship f2 ON f1.friendId = f2.friendId " +
                "WHERE f1.userId = ?1 AND f1.status = 'ACCEPTED' " +
                "AND f2.userId IN ?2 AND f2.status = 'ACCEPTED' " +
                "GROUP BY f2.userId";

        List<Object[]> results = Friendship.find(hql, currentUserId, userIds).project(Object[].class).list();
        return results.stream()
                .collect(Collectors.toMap(row -> (Long) row[0], row -> (Long) row[1]));
    }

    private List<Friendship> fetchFriendshipRelations(Long currentUserId, List<Long> userIds) {
        return Friendship.find(
                "(userId = ?1 AND friendId IN ?2) OR (userId IN ?2 AND friendId = ?1)",
                currentUserId, userIds
        ).list();
    }


    private UserSearchDTO mapToDTO(User user, Long currentUserId, Map<Long, String> languageMap, Map<Long, Long> mutualFriendsMap, List<Friendship> relations, Map<Long, String> avatarMap) {
        String status = "NONE";
        Long currentFriendshipId = null;

        for (Friendship f : relations) {
            if ((f.userId.equals(currentUserId) && f.friendId.equals(user.id)) ||
                    (f.userId.equals(user.id) && f.friendId.equals(currentUserId))) {

                currentFriendshipId = f.id;
                if (f.status.equals(FriendshipStatus.ACCEPTED)) {
                    status = "ACCEPTED";
                } else if (f.status.equals(FriendshipStatus.PENDING)) {
                    status = f.userId.equals(currentUserId) ? "PENDING_SENT" : "PENDING_RECEIVED";
                }
                break;
            }
        }

        Long mutualCount = mutualFriendsMap.getOrDefault(user.id, 0L);
        String userLang = languageMap.getOrDefault(user.id, null);

        return new UserSearchDTO(
                user.id, user.name, user.username, avatarMap.getOrDefault(user.id, null),
                user.biography, user.location, userLang,
                status, currentFriendshipId, mutualCount
        );
    }
}