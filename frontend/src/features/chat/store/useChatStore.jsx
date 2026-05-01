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

export const useChatStore = create((set) => ({

    activeChatId: null,
    messages: [],
    typingUsers: [],
    conversations: [],

    setActiveChat: (chatId) =>
        set({
            activeChatId: chatId,
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
            const alreadyExists = state.messages.some(
                (msg) => msg.id === message.id
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
}))

// const messages = useChatStore(...)
// messages: []
// activeConversation: 42
// typingUsers: []
