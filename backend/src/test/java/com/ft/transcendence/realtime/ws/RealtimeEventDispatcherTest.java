package com.ft.transcendence.realtime.ws;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.realtime.chat.RealtimeChatHandler;
import com.ft.transcendence.realtime.presence.RealtimePresenceHandler;
import com.ft.transcendence.realtime.ws.app.RealtimeEventDispatcher;
import com.ft.transcendence.realtime.ws.app.RealtimeEventSender;
import com.ft.transcendence.realtime.ws.app.RealtimeSessionRegistry;
import com.ft.transcendence.realtime.ws.domain.RealtimeConnection;
import com.ft.transcendence.realtime.ws.dto.RealtimeIncomingEvent;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@QuarkusTest
public class RealtimeEventDispatcherTest extends BaseApiTest {

    @Inject
    RealtimeEventDispatcher dispatcher;

    @Inject
    RealtimeSessionRegistry registry;

    @Inject
    ObjectMapper objectMapper;

    @InjectMock
    RealtimeChatHandler chatHandler;

    @InjectMock
    RealtimePresenceHandler presenceHandler;

    @InjectMock
    RealtimeEventSender sender;

    @BeforeEach
    void setup() {
        reset(chatHandler, presenceHandler, sender);
        registry.add(new RealtimeConnection("conn-1", 1L, "User", "user", null));
    }

    @Test
    public void testDispatchPing() {
        RealtimeIncomingEvent event = new RealtimeIncomingEvent();
        event.type = "PING";

        dispatcher.dispatch("conn-1", event);

        RealtimeConnection connection = registry.get("conn-1");
        verify(presenceHandler).ping(connection);
    }

    @Test
    public void testDispatchChatSubscribe() {
        RealtimeIncomingEvent event = new RealtimeIncomingEvent();
        event.type = "CHAT_SUBSCRIBE";
        event.payload = objectMapper.createObjectNode();

        dispatcher.dispatch("conn-1", event);

        RealtimeConnection connection = registry.get("conn-1");
        verify(chatHandler).subscribe(eq(connection), any());
    }

    @Test
    public void testSendErrorWhenEventTypeMissing() {
        RealtimeIncomingEvent event = new RealtimeIncomingEvent();

        dispatcher.dispatch("conn-1", event);

        verify(sender).send(eq("conn-1"), eq("ERROR"), any());
    }

    @Test
    public void testSendErrorWhenEventIsNull() {
        dispatcher.dispatch("conn-1", null);

        verify(sender).send(eq("conn-1"), eq("ERROR"), any());
    }

    @Test
    public void testSendErrorForUnknownEventType() {
        RealtimeIncomingEvent event = new RealtimeIncomingEvent();
        event.type = "UNKNOWN_EVENT";

        dispatcher.dispatch("conn-1", event);

        verify(sender).send(eq("conn-1"), eq("ERROR"), any());
    }
}