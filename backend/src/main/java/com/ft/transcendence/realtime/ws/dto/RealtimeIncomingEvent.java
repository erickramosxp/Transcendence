package com.ft.transcendence.realtime.ws.dto;

import com.fasterxml.jackson.databind.JsonNode;

public class RealtimeIncomingEvent {
    public String type;
    public JsonNode payload;
}
