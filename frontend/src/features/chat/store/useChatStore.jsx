import { create } from 'zustand'
import { readCurrentUserId } from '@/features/chat/utils/currentUser'

function sameMessageId(a, b) {
	if (a == null || b == null) return false
	return Number(a) === Number(b)
}

export const useChatStore = create((set) => ({

    activeChatId: null,
    subscribeAccessDeniedSeq: 0,
    messages: [],
    typingUsers: [],
    listBumpQueue: [],
    listBumpSeq: 0,
    dispatchListBump: (payload) =>
        set((s) => ({
            listBumpQueue: [...(s.listBumpQueue ?? []), payload],
            listBumpSeq: (s.listBumpSeq ?? 0) + 1,
        })),

    drainListBumpQueue: () => {
        let batch = []
        set((s) => {
            const q = s.listBumpQueue ?? []
            if (!q.length) return {}
            batch = [...q]
            return { listBumpQueue: [] }
        })
        return batch
    },

    setActiveChat: (chatId) =>
        set({
            activeChatId: chatId,
            typingUsers: [],
            messages: []
        }),

    setMessages: (messages) =>
        set({
            messages
        }),

    addMessage: (message) =>

        set((state) => {
            if (
                state.activeChatId != null &&
                message.chatId != null &&
                Number(message.chatId) !== Number(state.activeChatId)
            ) {
                return state;
            }
            const alreadyExists = state.messages.some((msg) =>
                sameMessageId(msg.id, message.id),
            )

            if (alreadyExists) {
                return state
            }

            return {
                messages: [...state.messages, message]
            }
        }),

    clearCurrentChat: () =>
        set({
            activeChatId: null,
            messages: [],
            typingUsers: []
        }),

    resetActiveChatAfterWsAccessDenied: () =>
        set((s) => ({
            activeChatId: null,
            messages: [],
            typingUsers: [],
            subscribeAccessDeniedSeq: (s.subscribeAccessDeniedSeq ?? 0) + 1,
        })),

    prependMessages: (olderMessages) =>
        set((state) => ({
            messages: [...olderMessages, ...state.messages],
        })),

    applyTypingStart: (payload) =>
        set((state) => {
            if (payload?.chatId == null || payload?.userId == null) return state
            if (state.activeChatId == null) return state
            if (Number(payload.chatId) !== Number(state.activeChatId)) return state
            if (Number(payload.userId) === Number(readCurrentUserId())) return state

            const nextUser = {
                userId: payload.userId,
                username:
                    (payload.username ?? '').trim() ||
                    String(payload.userId),
            }

            const without = state.typingUsers.filter(
                (u) => Number(u.userId) !== Number(nextUser.userId),
            )

            return {
                typingUsers: [...without, nextUser],
            }
        }),

    applyTypingStop: (payload) =>
        set((state) => {
            if (payload?.chatId == null || payload?.userId == null) return state
            if (state.activeChatId == null) return state
            if (Number(payload.chatId) !== Number(state.activeChatId)) return state

            return {
                typingUsers: state.typingUsers.filter(
                    (u) => Number(u.userId) !== Number(payload.userId),
                ),
            }
        }),

    removeUserFromTyping: (userId) =>
        set((state) => {
            if (userId == null) return state
            return {
                typingUsers: state.typingUsers.filter(
                    (u) => Number(u.userId) !== Number(userId),
                ),
            }
        }),
}))
