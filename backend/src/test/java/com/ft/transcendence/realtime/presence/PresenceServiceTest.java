package com.ft.transcendence.realtime.presence;

import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.realtime.ws.RealtimeConnection;
import com.ft.transcendence.realtime.ws.RealtimeSessionRegistry;
import com.ft.transcendence.user.UserTestContext;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class PresenceServiceTest extends BaseApiTest {

    @Inject
    PresenceService presenceService;

    @Inject
    RealtimeSessionRegistry registry;

    @Test
    public void testResolveDefaultTargetUserIdsReturnsOnlyMutualFriends() {
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

        Set<Long> ids = presenceService.resolveDefaultTargetUserIds(user1.id);

        assertTrue(ids.contains(user2.id));
        assertFalse(ids.contains(user3.id));
        assertFalse(ids.contains(user1.id));
        assertEquals(1, ids.size());
    }

    @Test
    public void testSubscribePresenceReplacesPreviousSubscriptions() {
        RealtimeConnection watcher = new RealtimeConnection("conn-1", 10L, "Watcher", "watcher", null);
        registry.add(watcher);

        presenceService.subscribePresence(watcher, Set.of(20L, 30L));

        assertEquals(Set.of(20L, 30L), watcher.subscribedPresenceUserIds);
        assertEquals(1, presenceService.getWatchers(20L).size());
        assertEquals(1, presenceService.getWatchers(30L).size());

        presenceService.subscribePresence(watcher, Set.of(40L));

        assertEquals(Set.of(40L), watcher.subscribedPresenceUserIds);
        assertTrue(presenceService.getWatchers(20L).isEmpty());
        assertTrue(presenceService.getWatchers(30L).isEmpty());
        assertEquals(1, presenceService.getWatchers(40L).size());
    }

    @Test
    public void testSubscribePresenceIgnoresNullAndSelf() {
        Long watcherUserId = 6001L;
        Long targetUserId = 6002L;

        RealtimeConnection watcher = new RealtimeConnection("conn-" + System.nanoTime(), watcherUserId, "Watcher", "watcher", null);
        registry.add(watcher);

        Set<Long> targetUserIds = new java.util.HashSet<>();
        targetUserIds.add(null);
        targetUserIds.add(watcherUserId);
        targetUserIds.add(targetUserId);

        presenceService.subscribePresence(watcher, targetUserIds);

        assertEquals(Set.of(targetUserId), watcher.subscribedPresenceUserIds);
        assertTrue(presenceService.getWatchers(watcherUserId).isEmpty());
        assertEquals(1, presenceService.getWatchers(targetUserId).size());
    }

    @Test
    public void testRemoveWatcherRemovesAllPresenceSubscriptions() {
        RealtimeConnection watcher = new RealtimeConnection("conn-3", 70L, "Watcher", "watcher", null);
        registry.add(watcher);

        presenceService.subscribePresence(watcher, Set.of(80L, 90L));

        presenceService.removeWatcher(watcher);

        assertTrue(watcher.subscribedPresenceUserIds.isEmpty());
        assertTrue(presenceService.getWatchers(80L).isEmpty());
        assertTrue(presenceService.getWatchers(90L).isEmpty());
    }
}