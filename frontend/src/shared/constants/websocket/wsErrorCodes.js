/**
 * Error codes returned inside ERROR event payload returned by backend.
 * @enum {string}
 */

export const WS_ERROR_CODES = {
    UNKNOWN_EVENT_TYPE: 'UNKNOWN_EVENT_TYPE',
    INVALID_PAYLOAD: 'INVALID_PAYLOAD',
    UNAUTHORIZED_CHAT_ACCESS: 'UNAUTHORIZED_CHAT_ACCESS',
}