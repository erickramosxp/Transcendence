package com.ft.transcendence.realtime.ws.app;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ft.transcendence.realtime.ws.dto.RealtimeOutgoingEvent;
import io.quarkus.websockets.next.OpenConnections;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class RealtimeEventSender {

    @Inject
    ObjectMapper objectMapper;
    @Inject
    OpenConnections openConnections;

    public void send(String connectionId, String type, Object payload) {
        JsonNode jsonPayload = objectMapper.valueToTree(payload);

        openConnections.stream()
                .filter(c -> !c.isClosed())
                .filter(c -> c.id().equals(connectionId))
                .findFirst()
                .ifPresent(c -> c.sendTextAndAwait(RealtimeOutgoingEvent.of(type, jsonPayload)));
    }
}
