import api from "@/shared/api/httpClient";

const baseRoute = '/friendships';

export async function sendFriendRequest(targetUserId) {
    
    const result = await api.post(`${baseRoute}/request/${targetUserId}`)

    return result;
}

export async function getFriendPendingRequests() {
    const result = await api.get(`${baseRoute}/requests/pending`)

    return result;
}

export async function acceptFriendRequest(friendshipId) {
    const result = await api.post(`${baseRoute}/accept/${friendshipId}`)

    return result;
}

export async function rejectFriendRequest(friendshipId) {
    const result = await api.delete(`${baseRoute}/reject/${friendshipId}`)

    return result;
}

export async function getListFriends() {
    const result = await api.get(`${baseRoute}`)
    
    return result;
}

export async function getListOnlineFriends() {
    const result = await api.get(`${baseRoute}/online`)
    
    return result;
}


export async function removeFriend(friendshipId) {
    const result = await api.delete(`${baseRoute}/${friendshipId}`)
    
    return result;
}


