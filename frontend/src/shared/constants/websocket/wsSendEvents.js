/**
 * Presence realtime events.
 *
 * Presence is based on mutual friendship only.
 * The frontend does not send userIds manually.
 * The backend resolves monitored friends automatically.
 * */
/**
 * WebSocket events sent by frontend to backend.
 * @enum {string}
 */
export const WS_SEND_EVENTS = {
    /**
       * Starts monitoring online/offline status
       * of mutual friends.
       */
    PRESENCE_SUBSCRIBE: 'PRESENCE_SUBSCRIBE',

    /**
     * Stops presence monitoring.
     */
    PRESENCE_UNSUBSCRIBE: 'PRESENCE_UNSUBSCRIBE',

    /**
     * Heartbeat event to keep websocket alive.
     */
    PING: 'PING',

    /**
     * Sent when the user opens a chat conversation.
     *
     * CHAT_SUBSCRIBE means the user currently has
     * the conversation open on screen.
     *
     * It does not grant chat permission.
     * Backend validates access separately.
     * @example
     * {    
     *      "type": "CHAT_SUBSCRIBE",
     *      "payload": {
     *          "chatId":1
     *      }
     * }
     */
    CHAT_SUBSCRIBE: 'CHAT_SUBSCRIBE',

    /**
     * Sent when the user leaves the conversation.
     * Removes realtime subscription for this chat.
     * @example
     * {    
     *      "type": "CHAT_UNSUBSCRIBE",
     *      "payload": {
     *          "chatId":1
     *      }
     * }
     */
    CHAT_UNSUBSCRIBE: 'CHAT_UNSUBSCRIBE',

    /**
     * Sent to create and persist a new message.
     * Backend saves first, then broadcasts MESSAGE_CREATED.
     * * @example
     * // Expected payload:
     *  {
     *      chatId: "12345",
     *      text: "Hello world!"
     *  }
     */
    SEND_MESSAGE: 'SEND_MESSAGE',

    /**
     * Indicates the user started typing.
     * @example
     * {    
     *      "type": "TYPING_START",
     *      "payload": {
     *          "chatId":1
     *      }
     * }
     */
    TYPING_START: 'TYPING_START',

    /**
     * Indicates the user stopped typing.
     * @example
     * {    
     *      "type": "TYPING_STOP",
     *      "payload": {
     *          "chatId":1
     *      }
     * }
     */
    TYPING_STOP: 'TYPING_STOP',

}
