// lista de conversas
// mensagens da conversa atual
// última mensagem
// unread count
// typing status
// read receipts

// MESSAGE_CREATED
// TYPING_START
// TYPING_STOP
// CHAT_SUBSCRIBED

// activeChatId
// subscribedChats
// messages
// typingUsers

import { create } from 'zustand'
import { readCurrentUserId } from '@/features/chat/utils/currentUser'

function sameMessageId(a, b) {
	if (a == null || b == null) return false
	return Number(a) === Number(b)
}

const updateConversationPreview = (
    conversations,
    message,
    incrementUnread = false
) => {
    const updated = conversations.map((chat) => {
        if (chat.chatId !== message.chatId) {
            return chat
        }

        return {
            ...chat,
            lastMessage: message.text,
            lastMessageAt: message.createdAt,
            unreadCount: incrementUnread
                ? (chat.unreadCount || 0) + 1
                : chat.unreadCount
        }
    })

    return updated.sort(
        (a, b) =>
            new Date(b.lastMessageAt) -
            new Date(a.lastMessageAt)
    )
}

export const useChatStore = create((set, get) => ({

    activeChatId: null,
    messages: [],
    typingUsers: [],
    conversations: [],
    listBumpHandler: null,
    pendingListBumps: [],
    setListBumpHandler: (fn) => {
        const pending = [...(get().pendingListBumps ?? [])]
        set({ listBumpHandler: fn, pendingListBumps: [] })
        if (typeof fn === 'function' && pending.length > 0) {
            queueMicrotask(() => {
                pending.forEach((p) => fn(p))
            })
        }
    },
    dispatchListBump: (payload) => {
        const h = get().listBumpHandler
        if (typeof h === 'function') {
            h(payload)
        } else {
            set((s) => ({
                pendingListBumps: [...(s.pendingListBumps ?? []), payload],
            }))
        }
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
            // evita entrar
            if (
                state.activeChatId != null &&
                message.chatId != null &&
                Number(message.chatId) !== Number(state.activeChatId)
            ) {
                return state;
            }
            // evita duplicata
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

    handleIncomingMessage: (message) =>
        set((state) => {
            const isCurrentChat =
                state.activeChatId === message.chatId

            let updatedMessages = state.messages

            if (isCurrentChat) {
                updatedMessages = [
                    ...state.messages,
                    message
                ]
            }

            const updatedConversations =
                updateConversationPreview(
                    state.conversations,
                    message,
                    !isCurrentChat
                )

            return {
                messages: updatedMessages,
                conversations: updatedConversations
            }
        }),

    clearCurrentChat: () =>
        set({
            activeChatId: null,
            messages: [],
            typingUsers: []
        }),

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
