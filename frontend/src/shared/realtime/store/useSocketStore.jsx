// socket atual
// conectado ou não
// reconnect status
// erro de conexão
// talvez lastSeen
// abrir conexão
// fechar conexão
// status connected/disconnected
// send()
// reconnect

import { create } from 'zustand'
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

export const useSocketStore = create((set, get) => ({
    socket: null,
    connected: false,
    reconnectAttempts: 0,

    connect: () => {
        const token = localStorage.getItem('@trascendence:token')

        if (!token) {
            return;
        }

        const { socket } = get();

        if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        const ws = new WebSocket(resolveRealtimeWebSocketUrl(token))

        ws.onopen = () => {
            set({
                socket: ws,
                connected: true,
                reconnectAttempts: 0
            })
            get().send('LIST_PRESENCE')
        }

        ws.onclose = () => {
            set({
                socket: null,
                connected: false
            })

            const attempts = get().reconnectAttempts;
            if (attempts < 10) { // Limite opcional de tentativas
                const timeout = Math.min(1000 * Math.pow(2, attempts), 30000); // Max 30s
                console.log(`Reconectando em ${timeout / 1000}s...`);

                setTimeout(() => {
                    set({ reconnectAttempts: attempts + 1 });
                    get().connect();
                }, timeout);
            }
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

            const ui = mapMessageSenderData(
                payload,
                readCurrentUserId(),
                peerFallback
            )

            useChatStore.getState().addMessage({
                ...ui,
                chatId: payload.chatId
            })

            if (payload.senderId != null) {
                useChatStore.getState().removeUserFromTyping(payload.senderId)
            }

            if (payload.chatId != null) {
                const createdAt =
                    payload.createdAt != null
                        ? String(payload.createdAt)
                        : new Date().toISOString()
                useChatStore.getState().dispatchListBump({
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
                    break;
                case WS_SEND_EVENTS.PING:
                    get().send(WS_INCOMING_EVENTS.PONG);
                    break;
                case WS_INCOMING_EVENTS.MESSAGE_CREATED: {
                    const payload = data.payload ?? data;
                    handleMessageCreated(payload);
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
                    console.warn('[WS] ERROR', data.payload)
                    break;
                // case WS_ERROR_CODES.UNAUTHORIZED_CHAT_ACCESS:
                //     break;
                // case WS_ERROR_CODES.INVALID_PAYLOAD:
                //     break;
                // case WS_ERROR_CODES.UNKNOWN_EVENT_TYPE:
                //     break;
            }
        }
    },

    disconnect: () => {
        const socket = get().socket

        if (socket) {
            socket.close()
        }

        set({
            socket: null,
            connected: false
        })
    },

    send: (type, payload = {}) => {
        const socket = get().socket

        if (!socket) return

        if (socket.readyState !== WebSocket.OPEN) {
            return
        }

        socket.send(
            JSON.stringify({
                type,
                payload
            })
        )
    }
}))
