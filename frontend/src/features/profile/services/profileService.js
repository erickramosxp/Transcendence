import api from "@/shared/api/httpClient";

export async function getUserInfo(username) {
  const response = await api.get(`/user/${username}`);
  return response.data;
}

export async function getUserPosts(username, page, size) {
  const response = await api.get(`/user/${username}/posts`, {
    params: { page, size }
  });
  return response.data;
}

export async function getPostUserDetails(id) {
  const response = await api.get(`/posts/${id}`);
  return response.data;
}

export async function getLikedPosts(username, page, size) {
  const response = await api.get(`/user/${username}/likes`, {
    params: { page, size }
  });
  return response.data;
}

export async function getUserMediaPosts(username, page, size) {

  const response = await api.get(`/user/${username}/media`, {
    params: { page, size }
  });
  return response.data;
}

export async function updateProfileInfo(userInfos) {
  
  const response = await api.patch(`/user/profile`, userInfos, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
  });
  return response.data;
}

export async function getFollowingList(username, page, size) {

  const response = await api.get(`/user/${username}/following`, {
    params: { page, size }
  });
  return response.data;
}

export async function getFollowersList(username, page, size) {

  const response = await api.get(`/user/${username}/followers`, {
    params: { page, size }
  });
  return response.data;
}

export async function followUser(username) {

  const response = await api.post(`/user/${username}/follow`);
  return response.data;
}

export async function unfollowUser(username) {

  const response = await api.post(`/user/${username}/unfollow`);
  return response.data;
}

export async function updateProfileAvatar(formData) {

  const response = await api.patch(`/user/avatar`, formData);
  return response.data;
}

export async function getMyProfileAvatar() {

  const response = await api.get(`/user/me/avatar`);
  return response.data;
}

export async function deleteMyProfileAvatar() {

  const response = await api.delete(`/user/me/avatar`);
  return response.data;
}

export async function changePassword(params) {

  const response = await api.patch(`/auth/password`, params, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
  });
  return response.data;
}

export async function getMyAuthType() {

  const response = await api.get(`/user/me/auth-type`);
  return response.data;
}