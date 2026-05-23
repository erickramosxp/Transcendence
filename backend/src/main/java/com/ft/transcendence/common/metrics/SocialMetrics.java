package com.ft.transcendence.common.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.quarkus.runtime.Startup;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.concurrent.atomic.AtomicLong;

/**
 * Métricas de negócio da rede social Transcendence.
 * Todas as métricas são agregadas e anônimas — nenhum dado pessoal
 * é exposto nos labels do Prometheus. Conformidade com LGPD garantida.
 */
@Startup
@ApplicationScoped
public class SocialMetrics {

    private final AtomicLong wsConnections = new AtomicLong(0);

    private final Counter registrations;
    private final Counter loginsSuccess;
    private final Counter loginsFailed;
    private final Counter googleLogins;

    private final Counter postsCreated;
    private final Counter postsDeleted;
    private final Counter postsWithMedia;

    private final Counter postLikes;
    private final Counter postUnlikes;
    private final Counter commentLikes;
    private final Counter commentUnlikes;

    private final Counter directChatsCreated;
    private final Counter groupChatsCreated;
    private final Counter messagesSent;
    private final Counter messagesWithMedia;
    private final Counter messagesWithReply;

    private final Counter friendRequestsSent;
    private final Counter friendRequestsAccepted;
    private final Counter friendRequestsRejected;
    private final Counter friendshipsRemoved;

    private final Counter wsConnectionsOpened;
    private final Counter wsConnectionsClosed;
    private final Counter wsAuthFailures;

    @Inject
    public SocialMetrics(MeterRegistry registry) {

        Gauge.builder("social.ws.connections.active", wsConnections, AtomicLong::get)
                .description("Conexões WebSocket ativas (usuários online)")
                .register(registry);

        registrations = Counter.builder("social.auth.registrations.total")
                .description("Total de registros locais")
                .register(registry);

        loginsSuccess = Counter.builder("social.auth.logins.total")
                .tag("result", "success")
                .description("Logins bem-sucedidos")
                .register(registry);

        loginsFailed = Counter.builder("social.auth.logins.total")
                .tag("result", "failed")
                .description("Tentativas de login com falha")
                .register(registry);

        googleLogins = Counter.builder("social.auth.google.logins.total")
                .description("Logins via Google OAuth")
                .register(registry);

        postsCreated = Counter.builder("social.posts.created.total")
                .description("Posts criados")
                .register(registry);

        postsDeleted = Counter.builder("social.posts.deleted.total")
                .description("Posts deletados")
                .register(registry);

        postsWithMedia = Counter.builder("social.posts.with_media.total")
                .description("Posts criados com mídia")
                .register(registry);

        postLikes = Counter.builder("social.likes.total")
                .tag("target", "post").tag("action", "like")
                .register(registry);

        postUnlikes = Counter.builder("social.likes.total")
                .tag("target", "post").tag("action", "unlike")
                .register(registry);

        commentLikes = Counter.builder("social.likes.total")
                .tag("target", "comment").tag("action", "like")
                .register(registry);

        commentUnlikes = Counter.builder("social.likes.total")
                .tag("target", "comment").tag("action", "unlike")
                .register(registry);

        directChatsCreated = Counter.builder("social.chats.created.total")
                .tag("type", "direct")
                .register(registry);

        groupChatsCreated = Counter.builder("social.chats.created.total")
                .tag("type", "group")
                .register(registry);

        messagesSent = Counter.builder("social.messages.sent.total")
                .description("Mensagens enviadas")
                .register(registry);

        messagesWithMedia = Counter.builder("social.messages.with_media.total")
                .description("Mensagens com mídia")
                .register(registry);

        messagesWithReply = Counter.builder("social.messages.with_reply.total")
                .description("Mensagens como resposta")
                .register(registry);

        friendRequestsSent = Counter.builder("social.friendships.total")
                .tag("action", "sent").register(registry);

        friendRequestsAccepted = Counter.builder("social.friendships.total")
                .tag("action", "accepted").register(registry);

        friendRequestsRejected = Counter.builder("social.friendships.total")
                .tag("action", "rejected").register(registry);

        friendshipsRemoved = Counter.builder("social.friendships.total")
                .tag("action", "removed").register(registry);

        wsConnectionsOpened = Counter.builder("social.ws.connections.total")
                .tag("event", "opened").register(registry);

        wsConnectionsClosed = Counter.builder("social.ws.connections.total")
                .tag("event", "closed").register(registry);

        wsAuthFailures = Counter.builder("social.ws.auth.failures.total")
                .description("Falhas de auth no WebSocket")
                .register(registry);
    }

    public void recordRegistration()          { registrations.increment(); }
    public void recordLoginSuccess()          { loginsSuccess.increment(); }
    public void recordLoginFailed()           { loginsFailed.increment(); }
    public void recordGoogleLogin()           { googleLogins.increment(); }

    public void recordPostCreated(boolean hasMedia) {
        postsCreated.increment();
        if (hasMedia) postsWithMedia.increment();
    }
    public void recordPostDeleted()           { postsDeleted.increment(); }

    public void recordPostLike()              { postLikes.increment(); }
    public void recordPostUnlike()            { postUnlikes.increment(); }
    public void recordCommentLike()           { commentLikes.increment(); }
    public void recordCommentUnlike()         { commentUnlikes.increment(); }

    public void recordDirectChatCreated()     { directChatsCreated.increment(); }
    public void recordGroupChatCreated()      { groupChatsCreated.increment(); }
    public void recordMessageSent(boolean hasMedia, boolean isReply) {
        messagesSent.increment();
        if (hasMedia) messagesWithMedia.increment();
        if (isReply)  messagesWithReply.increment();
    }

    public void recordFriendRequestSent()     { friendRequestsSent.increment(); }
    public void recordFriendRequestAccepted() { friendRequestsAccepted.increment(); }
    public void recordFriendRequestRejected() { friendRequestsRejected.increment(); }
    public void recordFriendshipRemoved()     { friendshipsRemoved.increment(); }

    public void recordWsConnected() {
        wsConnections.incrementAndGet();
        wsConnectionsOpened.increment();
    }
    public void recordWsDisconnected() {
        wsConnections.updateAndGet(v -> Math.max(0, v - 1));
        wsConnectionsClosed.increment();
    }
    public void recordWsAuthFailure()         { wsAuthFailures.increment(); }
}