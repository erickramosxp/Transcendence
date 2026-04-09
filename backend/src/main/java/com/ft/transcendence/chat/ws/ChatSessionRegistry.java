package com.ft.transcendence.chat.ws;

import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class ChatSessionRegistry {

    private final ConcurrentHashMap<Long, Set<WebSocketConnection>> sessionsByChat = new ConcurrentHashMap<>();

    public void add(Long chatId, WebSocketConnection connection) {
        sessionsByChat.computeIfAbsent(chatId, id -> ConcurrentHashMap.newKeySet()).add(connection);
    }

    public void remove(Long chatId, WebSocketConnection connection) {
        sessionsByChat.computeIfPresent(chatId, (id, sessions) -> {
            sessions.remove(connection);
            return sessions.isEmpty() ? null : sessions;
        });
    }

    public Set<WebSocketConnection> getConnections(Long chatId) {
        return sessionsByChat.getOrDefault(chatId, Set.of());
    }
}
