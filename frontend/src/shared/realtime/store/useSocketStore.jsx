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
import { usePresenceStore } from '@/features/friends/store/usePresenceStore'

import {
    WS_SEND_EVENTS,
    WS_INCOMING_EVENTS,
    WS_ERROR_CODES
} from '@/shared/constants/websocket'

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

        const ws = new WebSocket(
            `${import.meta.env.VITE_BACKEND_URL}/ws/realtime?token=${token}`
        )

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

        const handleMessageCreated = (message) => {
            if (!message.id) return;
            useChatStore
                .getState()
                .addMessage(message)
        }

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)

            // console.log("evento chegando");
            // console.log(event);


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
                    console.log("presença atualizada ", data);
                    usePresenceStore
                        .getState()
                        .updatePresence(data.payload)
                    break;
                case "LIST_PRESENCE":
                    console.log("lista inicial de onlines", data);
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
