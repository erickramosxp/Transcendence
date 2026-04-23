package com.ft.transcendence.realtime.ws.dto;

import com.fasterxml.jackson.databind.JsonNode;

public class RealtimeOutgoingEvent {
    public String type;
    public JsonNode payload;

    public static RealtimeOutgoingEvent of(String type, JsonNode payload) {
        RealtimeOutgoingEvent r = new RealtimeOutgoingEvent();
        r.type = type;
        r.payload = payload;
        return r;
    }
}
