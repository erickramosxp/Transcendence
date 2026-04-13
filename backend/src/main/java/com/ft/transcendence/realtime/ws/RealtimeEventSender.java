package com.ft.transcendence.realtime.ws;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ft.transcendence.realtime.ws.dto.RealtimeOutgoingEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class RealtimeEventSender {

    @Inject
    ObjectMapper objectMapper;

    public void send(RealtimeConnection connection, String type, Object payload) {
        if (connection == null)
            return;

        JsonNode jsonPayload = objectMapper.valueToTree(payload);
        connection.socket.sendTextAndAwait(RealtimeOutgoingEvent.of(type, jsonPayload));
    }
}