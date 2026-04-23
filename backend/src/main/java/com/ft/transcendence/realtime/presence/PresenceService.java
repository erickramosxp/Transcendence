package com.ft.transcendence.realtime.presence;

import com.ft.transcendence.follow.domain.Follow;
import com.ft.transcendence.realtime.ws.domain.RealtimeConnection;
import com.ft.transcendence.realtime.ws.app.RealtimeSessionRegistry;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class PresenceService {

    @Inject
    RealtimeSessionRegistry registry;

    private final Map<Long, Set<String>> watchersByTargetUser = new ConcurrentHashMap<>();

    public Set<Long> resolveDefaultTargetUserIds(Long userId) {
        List<Long> ids = Follow.find(
                """
                select f.followee.id
                from Follow f
                where f.follower.id = ?1
                  and exists (
                      select 1
                      from Follow reverse
                      where reverse.follower.id = f.followee.id
                        and reverse.followee.id = ?1
                  )
                """,
                userId
        ).project(Long.class).list();

        return new HashSet<>(ids);
    }

    public void subscribePresence(RealtimeConnection watcher, Set<Long> targetUserIds) {
        removeWatcher(watcher);

        for (Long targetUserId : targetUserIds) {
            if (targetUserId == null || targetUserId.equals(watcher.userId))
                continue;

            watcher.subscribedPresenceUserIds.add(targetUserId);
            watchersByTargetUser.computeIfAbsent(targetUserId, k -> ConcurrentHashMap.newKeySet()).add(watcher.connectionId);
        }
    }

    public boolean isOnline(Long userId) {
        return registry.isUserOnline(userId);
    }

    public Set<RealtimeConnection> getWatchers(Long targetUserId) {
        Set<String> watcherIds = watchersByTargetUser.getOrDefault(targetUserId, Set.of());
        Set<RealtimeConnection> result = ConcurrentHashMap.newKeySet();

        for (String watcherId : watcherIds) {
            RealtimeConnection connection = registry.get(watcherId);
            if (connection != null)
                result.add(connection);
        }

        return result;
    }

    public void removeWatcher(RealtimeConnection watcher) {
        for (Long targetUserId : Set.copyOf(watcher.subscribedPresenceUserIds)) {
            Set<String> watchers = watchersByTargetUser.get(targetUserId);
            if (watchers != null) {
                watchers.remove(watcher.connectionId);
                if (watchers.isEmpty())
                    watchersByTargetUser.remove(targetUserId);
            }
        }
        watcher.subscribedPresenceUserIds.clear();
    }
}
