package com.ft.transcendence.realtime.presence;

import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.realtime.ws.domain.RealtimeConnection;
import com.ft.transcendence.realtime.ws.app.RealtimeEventSender;
import com.ft.transcendence.realtime.ws.app.RealtimeSessionRegistry;
import com.ft.transcendence.realtime.ws.dto.RealtimeEventType;
import com.ft.transcendence.user.UserTestContext;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@QuarkusTest
public class RealtimePresenceHandlerTest extends BaseApiTest {

    @Inject
    RealtimePresenceHandler handler;

    @Inject
    PresenceService presenceService;

    @Inject
    RealtimeSessionRegistry registry;

    @InjectMock
    RealtimeEventSender sender;

    @BeforeEach
    void setup() {
        reset(sender);
    }

    @Test
    public void testPingUpdatesLastSeenAndSendsPong() {
        RealtimeConnection connection = new RealtimeConnection("conn-ping", 10L, "User", "user", null);
        registry.add(connection);

        var before = connection.lastSeenAt;

        handler.ping("conn-ping");

        assertTrue(connection.lastSeenAt.isAfter(before) || connection.lastSeenAt.isEqual(before));
        verify(sender).send("conn-ping", RealtimeEventType.PONG, null);
    }

    @Test
    public void testHandleConnectedNotifiesWatchers() {
        RealtimeConnection watcher = new RealtimeConnection("conn-watcher", 1L, "Watcher", "watcher", null);
        RealtimeConnection target = new RealtimeConnection("conn-target", 2L, "Target", "target", null);

        registry.add(watcher);
        registry.add(target);

        presenceService.subscribePresence(watcher, Set.of(2L));

        handler.handleConnected("conn-target");

        verify(sender).send(eq("conn-watcher"), eq(RealtimeEventType.PRESENCE_UPDATED), any());
    }

    @Test
    public void testHandleDisconnectedNotifiesWatchersWhenLastConnection() {
        Long watcherUserId = 8001L;
        Long targetUserId = 8002L;

        RealtimeConnection watcher = new RealtimeConnection("conn-watcher-" + System.nanoTime(), watcherUserId, "Watcher", "watcher", null);
        RealtimeConnection target = new RealtimeConnection("conn-target-" + System.nanoTime(), targetUserId, "Target", "target", null);

        registry.add(watcher);
        registry.add(target);

        assertTrue(registry.isUserOnline(targetUserId));
        assertEquals(1, registry.getUserConnectionCount(targetUserId));

        presenceService.subscribePresence(watcher, Set.of(targetUserId));

        handler.handleDisconnected(target.connectionId);

        verify(sender).send(eq(watcher.connectionId), eq(RealtimeEventType.PRESENCE_UPDATED), any());
    }

    @Test
    public void testHandleDisconnectedDoesNotNotifyOfflineWhenUserStillHasAnotherConnection() {
        RealtimeConnection watcher = new RealtimeConnection("conn-watcher-3", 1L, "Watcher", "watcher", null);
        RealtimeConnection target1 = new RealtimeConnection("conn-target-a", 2L, "Target", "target", null);
        RealtimeConnection target2 = new RealtimeConnection("conn-target-b", 2L, "Target", "target", null);

        registry.add(watcher);
        registry.add(target1);
        registry.add(target2);

        presenceService.subscribePresence(watcher, Set.of(2L));

        handler.handleDisconnected("conn-target-a");

        verify(sender, never()).send(eq("conn-watcher-3"), eq(RealtimeEventType.PRESENCE_UPDATED), any());
    }
}