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
import { useFriendStore } from '@/features/friends/store/useFriendStore'
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore'

import {
    WS_SEND_EVENTS,
    WS_INCOMING_EVENTS,
    WS_ERROR_CODES
} from '@/shared/constants/websocket'

export const useSocketStore = create((set, get) => ({
    socket: null,
    connected: false,

    connect: () => {
        const token = localStorage.getItem('@transcendence:token')

        if (!token) return;

        const ws = new WebSocket(
            `${import.meta.env.VITE_BACKEND_URL}/ws/realtime?token=${token}`
        )

        ws.onopen = () => {
            set({
                socket: ws,
                connected: true
            })
        }

        ws.onclose = () => {
            set({
                socket: null,
                connected: false
            })
        }

        ws.onerror = () => {
            console.error('WebSocket error')
        }

        const handleMessageCreated = (message) => {
            useChatStore
                .getState()
                .addMessage(message)
        }

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)

            switch (data.type) {
                case WS_INCOMING_EVENTS.PONG:
                    break;
                case WS_INCOMING_EVENTS.MESSAGE_CREATED:
                    handleMessageCreated(data);
                    break;
                case WS_INCOMING_EVENTS.PRESENCE_UPDATED:
                    break;
                case WS_INCOMING_EVENTS.ERROR:
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