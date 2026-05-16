package com.ft.transcendence.common.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.concurrent.atomic.AtomicLong;

/**
 * Métricas de negócio da rede social Transcendence.
 *
 * Todas as métricas são agregadas e anônimas — nenhum dado pessoal
 * (ID de usuário, conteúdo de mensagem, e-mail, etc.) é exposto
 * nos labels do Prometheus. Conformidade com LGPD garantida.
 *
 * Uso: injete SocialMetrics no service desejado e chame o método correspondente.
 */
@ApplicationScoped
public class SocialMetrics {

    // -------------------------------------------------------
    //  Gauges — valores instantâneos (usuários online, etc.)
    // -------------------------------------------------------
    private final AtomicLong wsConnections = new AtomicLong(0);

    // -------------------------------------------------------
    //  Auth
    // -------------------------------------------------------
    private final Counter registrations;
    private final Counter loginsSuccess;
    private final Counter loginsFailed;
    private final Counter googleLogins;

    // -------------------------------------------------------
    //  Posts
    // -------------------------------------------------------
    private final Counter postsCreated;
    private final Counter postsDeleted;
    private final Counter postsWithMedia;

    // -------------------------------------------------------
    //  Likes
    // -------------------------------------------------------
    private final Counter postLikes;
    private final Counter postUnlikes;
    private final Counter commentLikes;
    private final Counter commentUnlikes;

    // -------------------------------------------------------
    //  Chat
    // -------------------------------------------------------
    private final Counter directChatsCreated;
    private final Counter groupChatsCreated;
    private final Counter messagesSent;
    private final Counter messagesWithMedia;
    private final Counter messagesWithReply;

    // -------------------------------------------------------
    //  Amizades
    // -------------------------------------------------------
    private final Counter friendRequestsSent;
    private final Counter friendRequestsAccepted;
    private final Counter friendRequestsRejected;
    private final Counter friendshipsRemoved;

    // -------------------------------------------------------
    //  WebSocket / Presença
    // -------------------------------------------------------
    private final Counter wsConnectionsOpened;
    private final Counter wsConnectionsClosed;
    private final Counter wsAuthFailures;

    @Inject
    public SocialMetrics(MeterRegistry registry) {

        // Gauge — conexões WebSocket ativas no momento
        Gauge.builder("social.ws.connections.active", wsConnections, AtomicLong::get)
                .description("Número de conexões WebSocket ativas (usuários online)")
                .register(registry);

        // Auth
        registrations = Counter.builder("social.auth.registrations.total")
                .description("Total de registros locais realizados")
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
                .description("Logins realizados via Google OAuth")
                .register(registry);

        // Posts
        postsCreated = Counter.builder("social.posts.created.total")
                .description("Total de posts criados")
                .register(registry);

        postsDeleted = Counter.builder("social.posts.deleted.total")
                .description("Total de posts deletados")
                .register(registry);

        postsWithMedia = Counter.builder("social.posts.with_media.total")
                .description("Posts criados com imagem ou vídeo")
                .register(registry);

        // Likes
        postLikes = Counter.builder("social.likes.total")
                .tag("target", "post")
                .tag("action", "like")
                .description("Likes em posts")
                .register(registry);

        postUnlikes = Counter.builder("social.likes.total")
                .tag("target", "post")
                .tag("action", "unlike")
                .description("Unlikes em posts")
                .register(registry);

        commentLikes = Counter.builder("social.likes.total")
                .tag("target", "comment")
                .tag("action", "like")
                .description("Likes em comentários")
                .register(registry);

        commentUnlikes = Counter.builder("social.likes.total")
                .tag("target", "comment")
                .tag("action", "unlike")
                .description("Unlikes em comentários")
                .register(registry);

        // Chat
        directChatsCreated = Counter.builder("social.chats.created.total")
                .tag("type", "direct")
                .description("Chats diretos criados")
                .register(registry);

        groupChatsCreated = Counter.builder("social.chats.created.total")
                .tag("type", "group")
                .description("Chats em grupo criados")
                .register(registry);

        messagesSent = Counter.builder("social.messages.sent.total")
                .description("Total de mensagens enviadas")
                .register(registry);

        messagesWithMedia = Counter.builder("social.messages.with_media.total")
                .description("Mensagens enviadas com mídia")
                .register(registry);

        messagesWithReply = Counter.builder("social.messages.with_reply.total")
                .description("Mensagens enviadas como resposta a outra mensagem")
                .register(registry);

        // Amizades
        friendRequestsSent = Counter.builder("social.friendships.total")
                .tag("action", "sent")
                .description("Solicitações de amizade enviadas")
                .register(registry);

        friendRequestsAccepted = Counter.builder("social.friendships.total")
                .tag("action", "accepted")
                .description("Solicitações de amizade aceitas")
                .register(registry);

        friendRequestsRejected = Counter.builder("social.friendships.total")
                .tag("action", "rejected")
                .description("Solicitações de amizade rejeitadas")
                .register(registry);

        friendshipsRemoved = Counter.builder("social.friendships.total")
                .tag("action", "removed")
                .description("Amizades desfeitas")
                .register(registry);

        // WebSocket
        wsConnectionsOpened = Counter.builder("social.ws.connections.total")
                .tag("event", "opened")
                .description("Total de conexões WebSocket abertas")
                .register(registry);

        wsConnectionsClosed = Counter.builder("social.ws.connections.total")
                .tag("event", "closed")
                .description("Total de conexões WebSocket fechadas")
                .register(registry);

        wsAuthFailures = Counter.builder("social.ws.auth.failures.total")
                .description("Tentativas de conexão WebSocket não autorizadas")
                .register(registry);
    }

    // -------------------------------------------------------
    //  Auth
    // -------------------------------------------------------
    public void recordRegistration()      { registrations.increment(); }
    public void recordLoginSuccess()      { loginsSuccess.increment(); }
    public void recordLoginFailed()       { loginsFailed.increment(); }
    public void recordGoogleLogin()       { googleLogins.increment(); }

    // -------------------------------------------------------
    //  Posts
    // -------------------------------------------------------
    public void recordPostCreated(boolean hasMedia) {
        postsCreated.increment();
        if (hasMedia) postsWithMedia.increment();
    }
    public void recordPostDeleted()       { postsDeleted.increment(); }

    // -------------------------------------------------------
    //  Likes
    // -------------------------------------------------------
    public void recordPostLike()          { postLikes.increment(); }
    public void recordPostUnlike()        { postUnlikes.increment(); }
    public void recordCommentLike()       { commentLikes.increment(); }
    public void recordCommentUnlike()     { commentUnlikes.increment(); }

    // -------------------------------------------------------
    //  Chat
    // -------------------------------------------------------
    public void recordDirectChatCreated() { directChatsCreated.increment(); }
    public void recordGroupChatCreated()  { groupChatsCreated.increment(); }
    public void recordMessageSent(boolean hasMedia, boolean isReply) {
        messagesSent.increment();
        if (hasMedia)  messagesWithMedia.increment();
        if (isReply)   messagesWithReply.increment();
    }

    // -------------------------------------------------------
    //  Amizades
    // -------------------------------------------------------
    public void recordFriendRequestSent()     { friendRequestsSent.increment(); }
    public void recordFriendRequestAccepted() { friendRequestsAccepted.increment(); }
    public void recordFriendRequestRejected() { friendRequestsRejected.increment(); }
    public void recordFriendshipRemoved()     { friendshipsRemoved.increment(); }

    // -------------------------------------------------------
    //  WebSocket / Presença
    // -------------------------------------------------------
    public void recordWsConnected()    {
        wsConnections.incrementAndGet();
        wsConnectionsOpened.increment();
    }
    public void recordWsDisconnected() {
        wsConnections.updateAndGet(v -> Math.max(0, v - 1));
        wsConnectionsClosed.increment();
    }
    public void recordWsAuthFailure()  { wsAuthFailures.increment(); }
}
