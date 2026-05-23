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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class UserDiscoveryService {


    public PageResponse<UserSearchDTO> searchUsers(Long currentUserId, int page, int size, String searchQuery, String location, String language, String sortBy, String sortDir) {

        System.out.println(page + " " +  size + " " + searchQuery + " " + location + " " + language + " " + sortBy + " " + sortDir);
        // 1. Ocultar o próprio usuário logado
        StringBuilder hql = new StringBuilder("FROM User u WHERE u.id != :currentUserId ");
        Map<String, Object> params = new HashMap<>();
        params.put("currentUserId", currentUserId);


        // 2. Filtros Dinâmicos
        if (searchQuery != null && !searchQuery.isBlank()) {
            // Usamos function('f_unaccent', campo) para bater com o índice do banco
            // E aplicamos a função também no texto digitado pelo usuário para comparar corretamente
            hql.append("AND (cast(function('f_unaccent', u.name) as string) ILIKE cast(function('f_unaccent', :search) as string) ");

            // Username não tem unaccent no seu índice, então fica normal
            hql.append("OR u.username ILIKE :search ");

            // Bio tem unaccent
            hql.append("OR cast(function('f_unaccent', u.biography) as string) ILIKE cast(function('f_unaccent', :search) as string)) ");

            params.put("search", "%" + searchQuery + "%");
        }

        if (location != null && !location.isBlank()) {
            // Location também tem unaccent no índice
            hql.append("AND cast(function('f_unaccent', u.location) as string) ILIKE cast(function('f_unaccent', :location) as string) ");
            params.put("location", "%" + location + "%");
        }

        if (language != null && !language.isBlank()  && !language.equals("all")) {
            hql.append("AND u.id IN (SELECT p.user.id FROM UserPreference p WHERE p.language = :language) ");
            params.put("language", language);
        }


        // 3. Ordenação e Busca Paginada

        PanacheQuery<User> query;

        if ("mutualfriends".equalsIgnoreCase(sortBy)) {
            // Ordenação complexa: Subquery de contagem diretamente no ORDER BY do banco de dados
            String dir = "desc".equalsIgnoreCase(sortDir) ? "DESC" : "ASC";

            hql.append(" ORDER BY (")
                    .append("SELECT COUNT(f2.friendId) FROM Friendship f1 JOIN Friendship f2 ON f1.friendId = f2.friendId ")
                    .append("WHERE f1.userId = :currentUserId AND f1.status = 'ACCEPTED' ")
                    .append("AND f2.userId = u.id AND f2.status = 'ACCEPTED'") // 'id' aqui é o ID do usuário da tabela principal
                    .append(") ").append(dir)
                    .append(", u.createdAt DESC"); // Desempate: Se tiverem a mesma quantidade de amigos em comum (ex: 0), ordena por mais recente

            query = User.find(hql.toString(), params);
        } else {
            // Ordenação padrão usando colunas normais (name, createdAt, etc)
            String safeSortField = validateSortField(sortBy);
            Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.Descending : Sort.Direction.Ascending;
            Sort sort = Sort.by(safeSortField, direction);

            query = User.find(hql.toString(), sort, params);
        }

        // O TRUQUE: Buscamos (size + 1) para saber se tem mais páginas
        int startIndex = page * size;
        int endIndex = startIndex + size; // O .range() no Panache é inclusivo, então isso busca 1 a mais

        List<User> users = new ArrayList<>(query.range(startIndex, endIndex).list());

        // Verificamos se veio 1 a mais
        boolean hasMore = users.size() > size;

        // Se tem mais, removemos aquele 1 extra que buscamos só para testar
        if (hasMore) {
            users.remove(users.size() - 1);
        }

        // Se a lista estiver vazia, retornamos
        if (users.isEmpty()) {
            // Seu PageResponse agora não precisa mais do "totalElements"
            return new PageResponse<>(List.of(), page, size, hasMore);
        }

        List<Long> pageUserIds = users.stream().map(u -> u.id).toList();

        List<UserPreference> preferences = UserPreference.find("user.id IN ?1", pageUserIds).list();
        Map<Long, String> languageMap = new HashMap<>();
        for (UserPreference pref : preferences) {
            languageMap.put(pref.user.id, pref.language);
        }

        List<Friendship> relations = Friendship.find(
                "(userId = ?1 AND friendId IN ?2) OR (userId IN ?2 AND friendId = ?1)",
                currentUserId, pageUserIds
        ).list();

        String mutualFriendsHql =
                "SELECT f2.userId, COUNT(f2.friendId) " +
                        "FROM Friendship f1 " +
                        "JOIN Friendship f2 ON f1.friendId = f2.friendId " + // O elo de ligação (o amigo em comum)
                        "WHERE f1.userId = ?1 AND f1.status = 'ACCEPTED' " + // Meus amigos
                        "AND f2.userId IN ?2 AND f2.status = 'ACCEPTED' " +  // Amigos dos caras da página
                        "GROUP BY f2.userId";

        List<Object[]> mutualResults = Friendship.find(mutualFriendsHql, currentUserId, pageUserIds).project(Object[].class).list();

        Map<Long, Long> mutualFriendsMap = new HashMap<>();
        for (Object[] row : mutualResults) {
            Long targetUserId = (Long) row[0];
            Long count = (Long) row[1];
            mutualFriendsMap.put(targetUserId, count);
        }


        List<UserSearchDTO> dtoList = users.stream().map(user -> {
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
            return new UserSearchDTO(user.id, user.name, user.username, user.avatarUrl, user.biography, user.location, userLang, status, currentFriendshipId, mutualCount);
        }).toList();

        return new PageResponse<>(dtoList, page, size, hasMore);
    }

    private String validateSortField(String sortBy) {
        if (sortBy == null) return "u.createdAt"; // Ordenação padrão
        return switch (sortBy.toLowerCase()) {
            case "name" -> "u.name";
            case "username" -> "u.username";
            case "lastlogin" -> "u.lastLogin";
            case "mutualfriends" -> "mutualfriends";
            default -> "u.createdAt";
        };
    }
}
