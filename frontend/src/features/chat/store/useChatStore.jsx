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

export const useChatStore = create((set) => ({

    activeChatId: null,
    messages: [],
    typingUsers: [],

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

    clearCurrentChat: () =>
        set({
            activeChatId: null,
            messages: [],
            typingUsers: []
        })
}))

// const messages = useChatStore(...)
messages: []
activeConversation: 42
typingUsers: []