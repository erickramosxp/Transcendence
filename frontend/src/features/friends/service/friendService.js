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

export async function getListFriends(currentPage, size, searchQuery) {
    const result = await api.get(`${baseRoute}?page=${currentPage}&size=${size}&q=${searchQuery}`)

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

export async function searchFriends(page = 0, size = 6, q = '', location, language = 'pt-BR', sortBy = 'createdAt', sortDir = 'desc') {

    const response = await api.get('/user/search', {
        params: {
            q,          // Termo de busca
            page,       // Página atual
            size,       // Quantidade por página
            location,   // Filtro de localização (se undefined, o Axios ignora)
            language,   // Idioma
            sortBy,     // Campo de ordenação
            sortDir     // Direção da ordenação (asc/desc)
        }
    });

    return response.data;
}


