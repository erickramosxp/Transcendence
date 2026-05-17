import { create } from 'zustand'
import { readCurrentUserId } from '@/features/chat/utils/currentUser'
import { mapMessageSenderData } from '@/features/chat/utils/mapMessageSenderData'

function sameMessageId(a, b) {
	if (a == null || b == null) return false
	return Number(a) === Number(b)
}

function findPendingOutboundIndex(messages, { chatId, text, replyToId }) {
	const textT = String(text ?? '').trim()
	const replyToN = Number(replyToId ?? 0)
	return messages.findIndex(
		(m) =>
			m.deliveryStatus === 'sending' &&
			Number(m.chatId) === Number(chatId) &&
			String(m.text ?? '').trim() === textT &&
			Number(m.replyToId ?? 0) === replyToN,
	)
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
            if (message.id != null) {
                const alreadyExists = state.messages.some((msg) =>
                    sameMessageId(msg.id, message.id),
                )

                if (alreadyExists) {
                    return state
                }
            }

            const me = readCurrentUserId()
            const isOwn =
                message.senderId != null &&
                String(message.senderId) === String(me)
            if (isOwn && message.id != null) {
                const pendingIdx = findPendingOutboundIndex(state.messages, {
                    chatId: message.chatId,
                    text: message.text,
                    replyToId: message.replyToId,
                })
                if (pendingIdx !== -1) {
                    const prev = state.messages[pendingIdx]
                    const next = [...state.messages]
                    next[pendingIdx] = {
                        ...message,
                        clientMessageId: prev.clientMessageId,
                    }
                    return { messages: next }
                }
            }

            return {
                messages: [...state.messages, message]
            }
        }),

    addOptimisticOutbound: ({
        clientMessageId,
        chatId,
        text,
        peerName,
        replyToId,
        replyQuote,
    }) =>
        set((state) => {
            if (
                state.activeChatId == null ||
                Number(state.activeChatId) !== Number(chatId)
            ) {
                return state
            }
            const me = readCurrentUserId()
            const now = new Date().toISOString()
            const ui = mapMessageSenderData(
                {
                    id: null,
                    senderId: me,
                    text,
                    createdAt: now,
                    replyToId: replyToId ?? undefined,
                    user: {
                        id: me,
                        name: null,
                        username: null,
                    },
                },
                me,
                peerName,
            )
            return {
                messages: [
                    ...state.messages,
                    {
                        ...ui,
                        chatId,
                        clientMessageId,
                        deliveryStatus: 'sending',
                        ...(replyQuote ? { replyQuote } : {}),
                    },
                ],
            }
        }),

    /**
     * Substitui a primeira bolha "enviando" que coincide com chat + texto pela mensagem persistida.
     * @returns {boolean} true se houve substituição
     */
    completeOutboundWithServerPayload: (payload, peerFallback) => {
        const me = readCurrentUserId()
        if (String(payload.senderId) !== String(me)) return false

        let replaced = false
        set((state) => {
            const textT = String(payload.text ?? '').trim()
            const chatId = payload.chatId
            const replyToPayload = payload.replyToId ?? payload.reply_to_id
            const pendingIdx = findPendingOutboundIndex(state.messages, {
                chatId,
                text: textT,
                replyToId: replyToPayload,
            })

            const existingIdx = state.messages.findIndex((m) =>
                sameMessageId(m.id, payload.id),
            )

            if (existingIdx !== -1) {
                if (pendingIdx === -1) return state
                replaced = true
                return {
                    messages: state.messages.filter((_, i) => i !== pendingIdx),
                }
            }

            if (pendingIdx === -1) return state

            const ui = mapMessageSenderData(payload, me, peerFallback)
            const prev = state.messages[pendingIdx]
            const next = [...state.messages]
            next[pendingIdx] = {
                ...ui,
                chatId,
                clientMessageId: prev.clientMessageId,
            }
            replaced = true
            return { messages: next }
        })
        return replaced
    },

    /** Confirma envio HTTP: localiza a bolha otimista pelo id gerado no cliente. */
    completeOutboundWithClientToken: (clientMessageId, payload, peerFallback) => {
        const me = readCurrentUserId()
        if (String(payload.senderId) !== String(me)) return false

        let replaced = false
        set((state) => {
            const idx = state.messages.findIndex(
                (m) =>
                    m.clientMessageId === clientMessageId &&
                    m.deliveryStatus === 'sending',
            )
            if (idx === -1) return state

            const ui = mapMessageSenderData(payload, me, peerFallback)
            const next = [...state.messages]
            next[idx] = {
                ...ui,
                chatId: payload.chatId,
                clientMessageId,
            }
            replaced = true
            return { messages: next }
        })
        return replaced
    },

    removeOptimisticByClientId: (clientMessageId) =>
        set((state) => ({
            messages: state.messages.filter(
                (m) => m.clientMessageId !== clientMessageId,
            ),
        })),

    markOutboundFailedByClientId: (clientMessageId) =>
        set((state) => ({
            messages: state.messages.map((m) =>
                m.clientMessageId === clientMessageId
                    ? { ...m, deliveryStatus: 'failed' }
                    : m,
            ),
        })),

    markLatestSendingOutboundFailed: (chatId) =>
        set((state) => {
            if (chatId == null) return state
            let lastIdx = -1
            for (let i = state.messages.length - 1; i >= 0; i--) {
                const m = state.messages[i]
                if (
                    m.deliveryStatus === 'sending' &&
                    Number(m.chatId) === Number(chatId)
                ) {
                    lastIdx = i
                    break
                }
            }
            if (lastIdx === -1) return state
            const next = [...state.messages]
            next[lastIdx] = { ...next[lastIdx], deliveryStatus: 'failed' }
            return { messages: next }
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
