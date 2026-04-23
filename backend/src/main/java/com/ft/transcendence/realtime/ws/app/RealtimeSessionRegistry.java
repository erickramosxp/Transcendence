package com.ft.transcendence.realtime.ws.app;

import com.ft.transcendence.realtime.ws.domain.RealtimeConnection;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class RealtimeSessionRegistry {
    private final Map<String, RealtimeConnection> byConnectionId = new ConcurrentHashMap<>();
    private final Map<Long, Set<String>> connectionIdsByUser = new ConcurrentHashMap<>();
    private final Map<Long, Set<String>> connectionIdsByChat = new ConcurrentHashMap<>();

    public void add(RealtimeConnection connection) {
        byConnectionId.put(connection.connectionId, connection);
        connectionIdsByUser.computeIfAbsent(connection.userId, k -> ConcurrentHashMap.newKeySet()).add(connection.connectionId);
    }

    public RealtimeConnection get(String connectionId) {
        return byConnectionId.get(connectionId);
    }

    public void subscribeChat(RealtimeConnection connection, Long chatId) {
        connection.subscribedChatIds.add(chatId);
        connectionIdsByChat.computeIfAbsent(chatId, k -> ConcurrentHashMap.newKeySet()).add(connection.connectionId);
    }

    public void unsubscribeChat(String connectionId, Long chatId) {
        RealtimeConnection connection = byConnectionId.get(connectionId);
        if (connection != null)
            connection.subscribedChatIds.remove(chatId);

        Set<String> ids = connectionIdsByChat.get(chatId);
        if (ids != null) {
            ids.remove(connectionId);
            if (ids.isEmpty())
                connectionIdsByChat.remove(chatId);
        }
    }

    public Set<RealtimeConnection> getConnectionsByChat(Long chatId) {
        Set<String> ids = connectionIdsByChat.getOrDefault(chatId, Set.of());
        Set<RealtimeConnection> result = ConcurrentHashMap.newKeySet();

        for (String id : ids) {
            RealtimeConnection connection = byConnectionId.get(id);
            if (connection != null)
                result.add(connection);
        }

        return result;
    }

    public boolean isUserOnline(Long userId) {
        Set<String> ids = connectionIdsByUser.get(userId);
        return ids != null && !ids.isEmpty();
    }

    public void remove(RealtimeConnection connection) {
        for (Long chatId : Set.copyOf(connection.subscribedChatIds)) {
            unsubscribeChat(connection.connectionId, chatId);
        }

        byConnectionId.remove(connection.connectionId);

        Set<String> userConnections = connectionIdsByUser.get(connection.userId);
        if (userConnections != null) {
            userConnections.remove(connection.connectionId);
            if (userConnections.isEmpty())
                connectionIdsByUser.remove(connection.userId);
        }
    }

    public int getUserConnectionCount(Long userId) {
        Set<String> ids = connectionIdsByUser.get(userId);
        return ids == null ? 0 : ids.size();
    }

    public RealtimeConnection getAnyConnectionByUserId(Long userId) {
        Set<String> connectionIds = connectionIdsByUser.get(userId);
        if (connectionIds == null || connectionIds.isEmpty()) {
            return null;
        }

        for (String connectionId : connectionIds) {
            RealtimeConnection connection = byConnectionId.get(connectionId);
            if (connection != null) {
                return connection;
            }
        }

        return null;
    }

    public Set<RealtimeConnection> getConnectionsByUserId(Long userId) {
        Set<String> connectionIds = connectionIdsByUser.getOrDefault(userId, Set.of());
        Set<RealtimeConnection> result = ConcurrentHashMap.newKeySet();

        for (String connectionId : connectionIds) {
            RealtimeConnection connection = byConnectionId.get(connectionId);
            if (connection != null) {
                result.add(connection);
            }
        }

        return result;
    }
}
