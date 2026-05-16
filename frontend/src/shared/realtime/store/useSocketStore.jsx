import { create } from 'zustand'
import { toast } from 'react-toastify'
import i18n from '@/i18n'
import { useChatStore } from '@/features/chat/store/useChatStore'
import { mapMessageSenderData } from '@/features/chat/utils/mapMessageSenderData'
import { readCurrentUserId } from '@/features/chat/utils/currentUser'
import { useFriendStore } from '@/features/friends/store/useFriendStore'
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore'
import { usePresenceStore } from '@/features/friends/store/usePresenceStore'

import {
    WS_SEND_EVENTS,
    WS_INCOMING_EVENTS,
    WS_ERROR_CODES
} from '@/shared/constants/websocket'
import { resolveRealtimeWebSocketUrl } from '@/shared/realtime/resolveRealtimeWebSocketUrl'

const WS_CONNECT_TIMEOUT_MS = 10000
const WS_HEARTBEAT_MS = 15000
const WS_PONG_TIMEOUT_MS = 8000

export const useSocketStore = create((set, get) => ({
    socket: null,
    connected: false,
    connecting: false,
    reconnectAttempts: 0,
    intentionalDisconnect: false,
    reconnectTimeoutId: null,
    pendingChatSubscribeId: null,
    navigatorOnline:
        typeof navigator !== "undefined" ? navigator.onLine : true,

    connect: () => {
        const token = localStorage.getItem('@trascendence:token')

        if (!token) {
            set({ connecting: false })
            return;
        }

        clearTimeout(get().reconnectTimeoutId)
        set({ reconnectTimeoutId: null })

        const { socket } = get();

        if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
            return;
        }
        set({ connecting: true })
        const ws = new WebSocket(resolveRealtimeWebSocketUrl(token))
        let connectTimeoutId = null
        let heartbeatIntervalId = null
        let pongTimeoutId = null

        const sendOnWire = (sock, type, payload = {}) => {
            if (sock.readyState !== WebSocket.OPEN) return
            sock.send(JSON.stringify({ type, payload }))
        }

        const clearWsTimers = () => {
            clearTimeout(connectTimeoutId)
            clearInterval(heartbeatIntervalId)
            clearTimeout(pongTimeoutId)
            connectTimeoutId = null
            heartbeatIntervalId = null
            pongTimeoutId = null
        }

        const handleIncomingWsError = (payload) => {
            const code = payload?.code
            const originalType = payload?.originalType
            const pendingId = get().pendingChatSubscribeId
            const chatState = useChatStore.getState()

            if (originalType === WS_SEND_EVENTS.CHAT_SUBSCRIBE) {
                set({ pendingChatSubscribeId: null })

                const activeId = chatState.activeChatId
                const sameChat =
                    pendingId != null &&
                    activeId != null &&
                    Number(pendingId) === Number(activeId)

                if (code === WS_ERROR_CODES.FORBIDDEN && sameChat) {
                    chatState.resetActiveChatAfterWsAccessDenied()
                    toast.error(
                        i18n.t('chat:realtime.wsErrors.forbiddenSubscribe'),
                    )
                    return
                }

                if (sameChat) {
                    toast.warning(
                        i18n.t('chat:realtime.wsErrors.subscribeFailed'),
                    )
                    return
                }
                return
            }

            if (
                code === WS_ERROR_CODES.NOT_SUBSCRIBED &&
                (originalType === WS_SEND_EVENTS.TYPING_START ||
                    originalType === WS_SEND_EVENTS.TYPING_STOP)
            ) {
                const chatId = chatState.activeChatId
                if (chatId != null) {
                    get().send(WS_SEND_EVENTS.CHAT_SUBSCRIBE, {
                        chatId,
                    })
                }
                return
            }

            if (originalType === WS_SEND_EVENTS.SEND_MESSAGE) {
                const activeId = chatState.activeChatId
                if (activeId != null) {
                    chatState.markLatestSendingOutboundFailed(activeId)
                }
                if (code === WS_ERROR_CODES.NON_PARTICIPANT) {
                    toast.error(
                        i18n.t('chat:realtime.wsErrors.sendNotParticipant'),
                    )
                    return
                }
                if (code === WS_ERROR_CODES.INTERNAL_ERROR) {
                    toast.error(i18n.t('chat:realtime.wsErrors.sendFailed'))
                    return
                }
                console.warn('[WS] ERROR', payload)
                return
            }

            console.warn('[WS] ERROR', payload)
        }

        const schedulePongTimeout = () => {
            clearTimeout(pongTimeoutId)
            pongTimeoutId = setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    console.warn('[WS] PONG timeout, fechando conexão para reconectar')
                    ws.close()
                }
            }, WS_PONG_TIMEOUT_MS)
        }

        const startHeartbeat = () => {
            clearInterval(heartbeatIntervalId)
            heartbeatIntervalId = setInterval(() => {
                if (ws.readyState !== WebSocket.OPEN) return
                sendOnWire(ws, WS_SEND_EVENTS.PING)
                schedulePongTimeout()
            }, WS_HEARTBEAT_MS)
        }

        connectTimeoutId = setTimeout(() => {
            if (ws.readyState === WebSocket.CONNECTING) {
                console.warn('[WS] Timeout ao conectar, forçando fechamento para nova tentativa')
                ws.close()
            }
        }, WS_CONNECT_TIMEOUT_MS)

        ws.onopen = () => {
            clearTimeout(connectTimeoutId)
            clearTimeout(get().reconnectTimeoutId)
            set({
                socket: ws,
                connected: true,
                connecting: false,
                reconnectAttempts: 0,
                reconnectTimeoutId: null,
            })

            // Handshake desta ligação: servidor não herda subscrições do socket anterior.
            sendOnWire(ws, 'LIST_PRESENCE')
            void useNotificationStore.getState().refreshUnreadCount()
            const activeChatId = useChatStore.getState().activeChatId
            if (activeChatId != null) {
                sendOnWire(ws, WS_SEND_EVENTS.CHAT_SUBSCRIBE, {
                    chatId: activeChatId,
                })
                set({
                    pendingChatSubscribeId: Number(activeChatId),
                })
            }
            startHeartbeat()
        }

        ws.onclose = () => {
            const intentional = get().intentionalDisconnect

            clearWsTimers()
            clearTimeout(get().reconnectTimeoutId)

            set({
                socket: null,
                connected: false,
                connecting: false,
                intentionalDisconnect: false,
                reconnectTimeoutId: null,
            })

            if (intentional) return

            const attempts = get().reconnectAttempts
            const timeout = Math.min(1000 * Math.pow(2, attempts), 30000); // Max 30s
            console.log(`Reconectando em ${timeout / 1000}s...`);

            const id = setTimeout(() => {
                set((s) => ({
                    reconnectAttempts: s.reconnectAttempts + 1,
                    reconnectTimeoutId: null,
                }))
                get().connect()
            }, timeout)
            set({ reconnectTimeoutId: id })
        }

        ws.onerror = () => {
            console.error('WebSocket error')
            ws.close();
        }

        const handleMessageCreated = (payload) => {
            if (!payload?.id) return

            const peerFallback =
                payload.user?.name?.trim() ||
                (payload.user?.username
                    ? `@${payload.user.username}`
                    : 'User')

            const chat = useChatStore.getState()
            const resolved = chat.completeOutboundWithServerPayload(
                payload,
                peerFallback,
            )

            if (!resolved) {
                const ui = mapMessageSenderData(
                    payload,
                    readCurrentUserId(),
                    peerFallback,
                )

                chat.addMessage({
                    ...ui,
                    chatId: payload.chatId,
                })
            }

            if (payload.senderId != null) {
                chat.removeUserFromTyping(payload.senderId)
            }

            if (payload.chatId != null) {
                const createdAt =
                    payload.createdAt != null
                        ? String(payload.createdAt)
                        : new Date().toISOString()
                chat.dispatchListBump({
                    chatId: payload.chatId,
                    lastMessage: {
                        text: payload.text ?? '',
                        createdAt,
                    },
                })
            }
        }

        ws.onmessage = (event) => {
            let data
            try {
                data = JSON.parse(event.data)
            } catch (e) {
                console.error('[WS] JSON inválido', e)
                return
            }

            switch (data.type) {
                case WS_INCOMING_EVENTS.PONG:
                    clearTimeout(pongTimeoutId)
                    break;
                case WS_SEND_EVENTS.PING:
                    clearTimeout(pongTimeoutId)
                    get().send(WS_INCOMING_EVENTS.PONG);
                    break;
                case WS_INCOMING_EVENTS.MESSAGE_CREATED: {
                    const payload = data.payload ?? data;
                    handleMessageCreated(payload);
                    break;
                }
                case WS_INCOMING_EVENTS.NOTIFICATION_RECEIVED: {
                    const payload = data.payload ?? data;
                    void useNotificationStore
                        .getState()
                        .prependIncomingNotification(payload);
                    break;
                }
                case WS_INCOMING_EVENTS.PRESENCE_UPDATED:
                    usePresenceStore
                        .getState()
                        .updatePresence(data.payload)
                    break;
                case WS_INCOMING_EVENTS.TYPING_START:{
                    const payload = data.payload ?? data;
                    useChatStore.getState().applyTypingStart(payload);
                    break;
                }
                case WS_INCOMING_EVENTS.TYPING_STOP:{
                    const payload = data.payload ?? data;
                    useChatStore.getState().applyTypingStop(payload);
                    break;
                }
                case "LIST_PRESENCE":
                    console.log("lista inicial de onlines", data);
                    break;
                case WS_INCOMING_EVENTS.ERROR:
                    handleIncomingWsError(data.payload ?? {})
                    break;
            }
        }
    },

    disconnect: () => {
        clearTimeout(get().reconnectTimeoutId)

        const socket = get().socket

        if (socket) {
            set({
                intentionalDisconnect: true,
                reconnectTimeoutId: null,
             })
            socket.close()
            return
        }

        set({
            socket: null,
            connected: false,
            connecting: false,
            intentionalDisconnect: false,
            reconnectTimeoutId: null,
        })
    },

    send: (type, payload = {}) => {
        const socket = get().socket

        if (!socket) return false

        if (socket.readyState !== WebSocket.OPEN) {
            return false
        }

        socket.send(
            JSON.stringify({
                type,
                payload
            })
        )

        if (
            type === WS_SEND_EVENTS.CHAT_SUBSCRIBE &&
            payload?.chatId != null
        ) {
            set({
                pendingChatSubscribeId: Number(payload.chatId),
            })
        }

        return true
    },

    retryNow: () => {
        clearTimeout(get().reconnectTimeoutId)
        set({
            reconnectTimeoutId: null,
            reconnectAttempts: 0,
        })
        get().connect()
    },
}))

if (import.meta.env.DEV && typeof window !== 'undefined') {
    window.__chatRealtimeDebug = {
        disconnect: () => useSocketStore.getState().disconnect(),
        reconnect: () => useSocketStore.getState().retryNow(),
        getState: () => useSocketStore.getState(),
    }
}
