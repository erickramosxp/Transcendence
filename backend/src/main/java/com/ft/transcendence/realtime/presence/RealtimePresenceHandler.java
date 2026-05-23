package com.ft.transcendence.realtime.presence;

import com.ft.transcendence.realtime.presence.dto.PresenceUpdatePayload;
import com.ft.transcendence.realtime.ws.domain.RealtimeConnection;
import com.ft.transcendence.realtime.ws.app.RealtimeEventSender;
import com.ft.transcendence.realtime.ws.app.RealtimeSessionRegistry;
import com.ft.transcendence.realtime.ws.dto.RealtimeEventType;
import com.ft.transcendence.user.app.UserAvatarService;
import com.ft.transcendence.user.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@ApplicationScoped
public class RealtimePresenceHandler {

    @Inject
    RealtimeSessionRegistry registry;
    @Inject
    PresenceService presenceService;
    @Inject
    RealtimeEventSender sender;
    @Inject
    UserAvatarService userAvatarService;

    public void handleConnected(RealtimeConnection connection) {
        connection.lastSeenAt = OffsetDateTime.now();

        listPresenceFriends(connection);

        notifyWatchers(connection, true, connection.lastSeenAt);
    }

    public void listPresenceFriends(RealtimeConnection connection) {
        connection.lastSeenAt = OffsetDateTime.now();

        Set<Long> targetUserIds = presenceService.resolveDefaultTargetUserIds(connection.userId);
        presenceService.subscribePresence(connection, targetUserIds);

        if (targetUserIds.isEmpty())
            return;

        Map<Long, User> usersById = User.<User>find("id in ?1", targetUserIds)
                .stream()
                .collect(Collectors.toMap(u -> u.id, Function.identity()));

        OffsetDateTime now = OffsetDateTime.now();

        List<Long> orderedUserIds = targetUserIds.stream()
                .sorted(Comparator.comparing((Long id) -> registry.isUserOnline(id)).reversed())
                .toList();

        for (Long userId : orderedUserIds) {
            User user = usersById.get(userId);
            if (user == null)
                continue;

            PresenceUpdatePayload payload = PresenceUpdatePayload.of(
                    userId, user.name, user.username,
                    userAvatarService.getUserAvatarUrl(user),
                    presenceService.isOnline(userId), now);

            sender.send(connection.connectionId, RealtimeEventType.PRESENCE_UPDATED, payload);
        }
    }

    public void handleDisconnected(RealtimeConnection connection) {
        boolean wasLastConnection = registry.isUserOnline(connection.userId) && registry.getUserConnectionCount(connection.userId) == 1;

        connection.lastSeenAt = OffsetDateTime.now();

        presenceService.removeWatcher(connection);

        if (wasLastConnection)
            notifyWatchers(connection, false, connection.lastSeenAt);
    }

    public void ping(RealtimeConnection connection) {
        connection.lastSeenAt = OffsetDateTime.now();
        sender.send(connection.connectionId, RealtimeEventType.PONG, null);
    }

    private void notifyWatchers(RealtimeConnection targetConnection, boolean online, OffsetDateTime lastSeenAt) {
        Set<RealtimeConnection> watchers = presenceService.getWatchers(targetConnection.userId);
        for (RealtimeConnection watcher : watchers) {

            String avatarUrl = userAvatarService.getUserAvatarUrl(targetConnection.userId);
            sender.send(watcher.connectionId, RealtimeEventType.PRESENCE_UPDATED, PresenceUpdatePayload.of(targetConnection.userId,
                    targetConnection.name, targetConnection.username, avatarUrl, online, lastSeenAt));
        }
    }
}