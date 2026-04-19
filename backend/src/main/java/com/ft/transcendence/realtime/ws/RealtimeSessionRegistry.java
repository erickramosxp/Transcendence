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

        System.out.println("[REGISTRY][ADD] connectionId=" + connection.connectionId
                + " userId=" + connection.userId
                + " userConnections=" + connectionIdsByUser.get(connection.userId));
    }

    public RealtimeConnection get(String connectionId) {
        return byConnectionId.get(connectionId);
    }

    public void subscribeChat(String connectionId, Long chatId) {
        RealtimeConnection connection = byConnectionId.get(connectionId);
        if (connection == null) {
            System.out.println("[REGISTRY][SUB_CHAT][MISS] connectionId=" + connectionId + " chatId=" + chatId);
            return;
        }

        connection.subscribedChatIds.add(chatId);
        connectionIdsByChat.computeIfAbsent(chatId, k -> ConcurrentHashMap.newKeySet()).add(connectionId);
        System.out.println("[REGISTRY][SUB_CHAT] chatId=" + chatId
                + " connectionId=" + connectionId
                + " userId=" + connection.userId
                + " subscribedChatIds=" + connection.subscribedChatIds
                + " chatConnections=" + connectionIdsByChat.get(chatId));
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
        System.out.println("[REGISTRY][UNSUB_CHAT] chatId=" + chatId
                + " connectionId=" + connectionId
                + " userId=" + (connection != null ? connection.userId : null)
                + " remainingChatConnections=" + connectionIdsByChat.get(chatId));
    }

    public Set<RealtimeConnection> getConnectionsByChat(Long chatId) {
        Set<String> ids = connectionIdsByChat.getOrDefault(chatId, Set.of());
        Set<RealtimeConnection> result = ConcurrentHashMap.newKeySet();
        System.out.println("[REGISTRY][GET_BY_CHAT][IDS] chatId=" + chatId + " ids=" + ids);

        for (String id : ids) {
            RealtimeConnection connection = byConnectionId.get(id);
            System.out.println("[REGISTRY][GET_BY_CHAT][RESOLVE] chatId=" + chatId
                    + " requestedId=" + id
                    + " found=" + (connection != null)
                    + (connection != null ? " userId=" + connection.userId + " connObjId=" + System.identityHashCode(connection) : ""));
            if (connection != null)
                result.add(connection);
        }

        System.out.println("[REGISTRY][GET_BY_CHAT][RESULT] chatId=" + chatId
                + " size=" + result.size());

        for (RealtimeConnection c : result) {
            System.out.println("[REGISTRY][GET_BY_CHAT][CONN] chatId=" + chatId
                    + " connectionId=" + c.connectionId
                    + " userId=" + c.userId
                    + " connObjId=" + System.identityHashCode(c));
        }

        return result;
    }

    public boolean isUserOnline(Long userId) {
        Set<String> ids = connectionIdsByUser.get(userId);
        return ids != null && !ids.isEmpty();
    }

    public void remove(String connectionId) {
        RealtimeConnection connection = byConnectionId.remove(connectionId);
        if (connection == null) {
            System.out.println("[REGISTRY][REMOVE][MISS] connectionId=" + connectionId);
            return;
        }

        for (Long chatId : Set.copyOf(connection.subscribedChatIds)) {
            unsubscribeChat(connectionId, chatId);
        }

        byConnectionId.remove(connectionId);

        Set<String> userConnections = connectionIdsByUser.get(connection.userId);
        if (userConnections != null) {
            userConnections.remove(connectionId);
            if (userConnections.isEmpty())
                connectionIdsByUser.remove(connection.userId);
        }

        System.out.println("[REGISTRY][REMOVE][BEFORE_CHAT_CLEANUP] connectionId=" + connectionId
                + " userId=" + connection.userId
                + " subscribedChatIds=" + connection.subscribedChatIds);
    }

    public int getUserConnectionCount(Long userId) {
        Set<String> ids = connectionIdsByUser.get(userId);
        return ids == null ? 0 : ids.size();
    }
}
