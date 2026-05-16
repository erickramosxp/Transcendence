package com.ft.transcendence.notification;

import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.notification.app.NotificationDispatcher;
import com.ft.transcendence.notification.app.NotificationService;
import com.ft.transcendence.notification.domain.Notification;
import com.ft.transcendence.realtime.ws.app.RealtimeEventSender;
import com.ft.transcendence.realtime.ws.app.RealtimeSessionRegistry;
import com.ft.transcendence.realtime.ws.domain.RealtimeConnection;
import com.ft.transcendence.user.UserTestContext;
import com.ft.transcendence.user.domain.User;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@QuarkusTest
public class NotificationDispatcherTest  extends BaseApiTest {

    @Inject
    NotificationDispatcher dispatcher;

    @InjectMock
    NotificationService notificationService;

    @InjectMock
    RealtimeSessionRegistry sessionRegistry;

    @InjectMock
    RealtimeEventSender eventSender;

    @InjectMock
    StorageService storageService;

    @Test
    public void testDispatchSendsWebSocketWhenUserIsOnline() {
        User actor = new User();
        actor.id = 1L;
        actor.name = "Actor";
        actor.username = "actor";
        actor.avatarUrl = null; // null para simplificar (sem chamada ao storageService)

        Notification saved = new Notification();
        saved.id = 99L;

        when(notificationService.create(any(), any(), any(), any(), any())).thenReturn(saved);

        when(sessionRegistry.isUserOnline(2L)).thenReturn(true);

        when(sessionRegistry.getAnyConnectionByUserId(2L))
                .thenReturn(new RealtimeConnection("conn-test", 2L, "Test", "test", null));

        dispatcher.onFriendRequest(actor, 2L, 10L);

        verify(eventSender).send(eq("conn-test"), eq("NOTIFICATION_RECEIVED"), any());
    }

    @Test
    public void testDoesNotSendsWebSocketWhenUserIsOffline() {
        User actor = new User();
        actor.id = 1L;
        actor.name = "Actor";
        actor.username = "actor";
        actor.avatarUrl = null; // null para simplificar (sem chamada ao storageService)

        Notification saved = new Notification();
        saved.id = 99L;

        when(notificationService.create(any(), any(), any(), any(), any())).thenReturn(saved);

        when(sessionRegistry.isUserOnline(2L)).thenReturn(false);

        dispatcher.onFriendRequest(actor, 2L, 10L);

        verify(eventSender, never()).send(eq("conn-test"), eq("NOTIFICATION_RECEIVED"), any());
    }

    @Test
    public void testDoesNotEmitWhenDedupReturnsNull() {
        User actor = new User();
        actor.id = 1L;
        actor.name = "Actor";
        actor.username = "actor";
        actor.avatarUrl = null;

        // Simula que o NotificationService deduplicou (retornou null)
        when(notificationService.create(any(), any(), any(), any(), any())).thenReturn(null);

        when(sessionRegistry.isUserOnline(any())).thenReturn(true);
        when(sessionRegistry.getAnyConnectionByUserId(any()))
                .thenReturn(new RealtimeConnection("conn-test", 2L, "Test", "test", null));

        dispatcher.onFriendRequest(actor, 2L, 10L);

        verify(eventSender, never()).send(any(), any(), any());
    }
}