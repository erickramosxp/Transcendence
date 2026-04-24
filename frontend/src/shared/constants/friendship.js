/**
 * Enum for the possible friendship states returned by the backend.
 * @readonly
 * @enum {string}
 */
export const FRIENDSHIP_STATUS = Object.freeze({
    /** * There is no friendship between users.
     * Button: "Add Friend"
     */
    NONE: 'NONE',

    /** *The logged in user has sent an invitation and is waiting.
     * Button: "Cancel Request"
     */
    PENDING_SENT: 'PENDING_SENT',

    /** * The logged in user has received an invitation and needs to respond.
     * Button: Dropdown "Accept/Decline"
     */
    PENDING_RECEIVED: 'PENDING_RECEIVED',

    /** * Users are already official friends.
     * Button: "Undo Friendship"
     */
    ACCEPTED: 'ACCEPTED'
});