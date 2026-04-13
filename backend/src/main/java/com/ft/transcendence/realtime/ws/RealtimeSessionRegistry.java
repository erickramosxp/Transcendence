package com.ft.transcendence.realtime.ws;

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

    public void subscribeChat(String connectionId, Long chatId) {
        RealtimeConnection connection = byConnectionId.get(connectionId);
        if (connection == null)
            return;

        connection.subscribedChatIds.add(chatId);
        connectionIdsByChat.computeIfAbsent(chatId, k -> ConcurrentHashMap.newKeySet()).add(connectionId);
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

    public void remove(String connectionId) {
        RealtimeConnection connection = byConnectionId.remove(connectionId);
        if (connection == null)
            return;

        Set<String> userConnections = connectionIdsByUser.get(connection.userId);
        if (userConnections != null) {
            userConnections.remove(connectionId);
            if (userConnections.isEmpty())
                connectionIdsByUser.remove(connection.userId);
        }

        for (Long chatId : connection.subscribedChatIds) {
            unsubscribeChat(connectionId, chatId);
        }
    }

    public int getUserConnectionCount(Long userId) {
        Set<String> ids = connectionIdsByUser.get(userId);
        return ids == null ? 0 : ids.size();
    }
}
