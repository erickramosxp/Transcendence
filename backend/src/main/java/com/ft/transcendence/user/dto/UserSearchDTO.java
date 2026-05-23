package com.ft.transcendence.user.dto;

public class UserSearchDTO {
    public Long id;
    public String name;
    public String username;
    public String avatarUrl;
    public String bio;
    public String location;
    public String language;
    public String relationStatus; // Pode ser: NONE, PENDING_SENT, PENDING_RECEIVED, FRIEND
    public Long friendshipId;
    public Long mutualFriendsCount;

    public UserSearchDTO(Long id, String name, String username, String avatarUrl, String biography, String location, String language, String relationStatus, Long friendshipId, Long mutualFriendsCount) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.bio = biography;
        this.location = location;
        this.language = language;
        this.relationStatus = relationStatus;
        this.friendshipId = friendshipId;
        this.mutualFriendsCount = mutualFriendsCount;
    }
}
