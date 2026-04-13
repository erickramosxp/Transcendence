package com.ft.transcendence.realtime.presence;

import com.ft.transcendence.realtime.ws.RealtimeConnection;
import com.ft.transcendence.realtime.ws.RealtimeSessionRegistry;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class PresenceService {

    @Inject
    RealtimeSessionRegistry registry;

    private final Map<Long, Set<String>> watchersByTargetUser = new ConcurrentHashMap<>();

    public void subscribePresence(RealtimeConnection watcher, Set<Long> targetUserIds) {
        for (Long targetUserId : targetUserIds) {
            watcher.subscribedPresenceUserIds.add(targetUserId);
            watchersByTargetUser.computeIfAbsent(targetUserId, k -> ConcurrentHashMap.newKeySet()).add(watcher.connectionId);
        }
    }

    public void unsubscribePresence(RealtimeConnection watcher, Set<Long> targetUserIds) {
        for (Long targetUserId : targetUserIds) {
            watcher.subscribedPresenceUserIds.remove(targetUserId);

            Set<String> watchers = watchersByTargetUser.get(targetUserId);
            if (watchers != null) {
                watchers.remove(watcher.connectionId);
                if (watchers.isEmpty())
                    watchersByTargetUser.remove(targetUserId);
            }
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
        for (Long targetUserId : watcher.subscribedPresenceUserIds) {
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
