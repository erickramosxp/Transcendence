package com.ft.transcendence.friendship.dto;

public class FriendshipDTO {

    public Long friendshipId;
    public Long friendId;
    public String name;
    public String username;
    public String avatarUrl;
    public boolean isOnline;

    public FriendshipDTO(Long friendshipId, Long friendId, String name, String username, String avatarUrl) {
        this.friendshipId = friendshipId;
        this.friendId = friendId;
        this.name = name;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.isOnline = false;
    }
}
