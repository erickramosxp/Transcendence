import api from "@/shared/api/httpClient";

export async function getFeed(page = 0, size = 10, scope = "social") {
    const response = await api.get("/posts", {
        params: { page, size, scope },
    });
    return response;
}

export async function getPostById(postId) {
    const { data } = await api.get(`/posts/${postId}`);
    return data;
}

export async function createPost(data, setLoadingPercent) {
    const response = await api.post("/posts", data, {
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
            );
            setLoadingPercent(percentCompleted);
        }
    });

    return response.data;
}

export async function likePost(postId) {
    const response = await api(`/posts/${postId}/like`, {
        method: "POST"
    });

    return response;
}

// descurtir post
export async function unlikePost(postId) {
    const response = await api(`/posts/${postId}/unlike`, {
        method: "POST"
    });

    return response;
}

export async function getComments(postId) {

    const response = await api(`/comment/${postId}`);
    return response;
}

// comentar
export async function createComment(contents) {

    const response = await api.post(`/comment`, contents ,{
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    });

    return response.data;
}

// curtir comentário
export async function likeComment(commentId) {
    const response = await api(`/comment/${commentId}/like`, {
        method: "POST"
    });

    return response;
}

// descurtir comentário
export async function unlikeComment(commentId) {
    const response = await api(`/comment/${commentId}/unlike`, {
        method: "POST"
    });

    return response;
}

// deletar post
export async function deletePost(postId) {
    const response = await api.delete(`/posts/${postId}`);

    return response;
}
