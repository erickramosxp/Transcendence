package com.ft.transcendence.common.config;


import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection(
    targets = {

        // --- Validação & Processamento de Mídia ---
        com.ft.transcendence.common.media.MediaAnalysis.class,
        com.ft.transcendence.common.media.MediaKind.class,

        // --- Realtime WebSocket Core ---
        com.ft.transcendence.realtime.ws.dto.RealtimeIncomingEvent.class,
        com.ft.transcendence.realtime.ws.dto.RealtimeOutgoingEvent.class,
        com.ft.transcendence.realtime.ws.dto.RealtimeErrorPayload.class,
        com.ft.transcendence.notification.dto.NotificationResponse.class,
        com.ft.transcendence.realtime.ws.dto.AuthenticatedSocketUser.class,

        // --- Realtime Chat ---
        com.ft.transcendence.realtime.chat.dto.ChatSubscribePayload.class,
        com.ft.transcendence.realtime.chat.dto.ChatSubscribedPayload.class,
        com.ft.transcendence.realtime.chat.dto.SendMessagePayload.class,
        com.ft.transcendence.realtime.chat.dto.TypingEventPayload.class,
        com.ft.transcendence.realtime.chat.dto.TypingPayload.class,

        // --- Presença ---
        com.ft.transcendence.realtime.presence.dto.PresenceUpdatePayload.class,

        // --- Notificações & Amizades ---
        com.ft.transcendence.notification.dto.NotificationContent.class,
        com.ft.transcendence.notification.dto.UnreadCountResponse.class,
        com.ft.transcendence.friendship.dto.FriendshipDTO.class
    },
    // Plugins internos do ImageIO para decodificar imagens no Linux
    classNames = {
        // Passar como texto burla a trava de módulos do Java
        "com.sun.imageio.plugins.jpeg.JPEGImageReader",
        "com.sun.imageio.plugins.jpeg.JPEGImageWriter",
        "com.sun.imageio.plugins.png.PNGImageReader",
        "com.sun.imageio.plugins.png.PNGImageWriter"
    },
    registerFullHierarchy = true
)
public class NativeReflectionConfig {
}