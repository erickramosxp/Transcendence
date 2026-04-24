import { WS_ERROR_CODES } from "./wsErrorCodes"

/**
 * 
 * @typedef {Object} ErrorPayload
 * @property {"ERROR"} type - Always "ERROR".
 * @property {Object} payload - The error details.
 * @property {keyof typeof WS_ERROR_CODES} payload.code
 * @property {string} payload.message
 * @property {string} payload.originalType
 */

/**
 * WebSocket events received from backend.
 * @enum {string}
 */
export const WS_INCOMING_EVENTS = {
    /**
     * Sent when a friend's presence changes.
     * @example
     * // payload
     * {
     *      "type": "PRESENCE_UPDATED",
            "payload": {
                "userId": 12,
                "name": "Maria",
                "username": "maria42",
                "avatarUrl": "https://...",
                "online": true,
                "lastSeenAt": "2026-04-19T06:30:00Z"
            }
     * }
     */
    PRESENCE_UPDATED: 'PRESENCE_UPDATED',

    /**
     * Backend response to heartbeat.
     */
    PONG: 'PONG',

    /**
     * Confirms successful chat subscription.
     */
    CHAT_SUBSCRIBED: 'CHAT_SUBSCRIBED',

    /**
     * Confirms chat unsubscribe.
     */
    CHAT_UNSUBSCRIBED: 'CHAT_UNSUBSCRIBED',

    /**
     * Sent after a message is persisted.
     * 
     */
    MESSAGE_CREATED: 'MESSAGE_CREATED',

    /**
     * Another participant started typing.
     */
    TYPING_START: 'TYPING_START',

    /**
     * Another participant stopped typing.
     */
    TYPING_STOP: 'TYPING_STOP',

    /**
     * Standard websocket error wrapper.
     * @type {ErrorPayload}
     */
    ERROR: 'ERROR',
}