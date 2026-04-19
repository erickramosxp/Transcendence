package com.ft.transcendence.realtime.presence;

import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.realtime.ws.RealtimeConnection;
import com.ft.transcendence.realtime.ws.RealtimeEventSender;
import com.ft.transcendence.realtime.ws.RealtimeSessionRegistry;
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
    public void testSubscribeUsesMutualFriendsAndSendsInitialSnapshot() {
        UserTestContext user1 = createUser();
        UserTestContext user2 = createUser();
        UserTestContext user3 = createUser();

        auth(user1)
                .post("/user/{username}/follow", user2.username)
                .then()
                .statusCode(200);

        auth(user2)
                .post("/user/{username}/follow", user1.username)
                .then()
                .statusCode(200);

        auth(user1)
                .post("/user/{username}/follow", user3.username)
                .then()
                .statusCode(200);

        RealtimeConnection watcher = new RealtimeConnection("conn-user1", user1.id, user1.name, user1.username, null);
        registry.add(watcher);

        handler.subscribe("conn-user1");

        assertTrue(watcher.subscribedPresenceUserIds.contains(user2.id));
        assertFalse(watcher.subscribedPresenceUserIds.contains(user3.id));
        verify(sender, atLeastOnce()).send(eq("conn-user1"), eq(RealtimeEventType.PRESENCE_UPDATED), any());
    }

    @Test
    public void testUnsubscribeRemovesAllSubscriptions() {
        Long watcherUserId = 7001L;
        Long target1 = 7002L;
        Long target2 = 7003L;

        RealtimeConnection watcher = new RealtimeConnection("conn-unsub-" + System.nanoTime(), watcherUserId, "Watcher", "watcher", null);
        registry.add(watcher);

        presenceService.subscribePresence(watcher, Set.of(target1, target2));

        assertEquals(Set.of(target1, target2), watcher.subscribedPresenceUserIds);

        handler.unsubscribe(watcher.connectionId, null);

        assertTrue(watcher.subscribedPresenceUserIds.isEmpty());
        assertTrue(presenceService.getWatchers(target1).isEmpty());
        assertTrue(presenceService.getWatchers(target2).isEmpty());
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