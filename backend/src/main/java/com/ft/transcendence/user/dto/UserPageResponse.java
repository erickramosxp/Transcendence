package com.ft.transcendence.user.dto;

import com.ft.transcendence.user.domain.User;

import java.time.OffsetDateTime;

public class UserPageResponse {
    public Long id;
    public String avatarUrl;
    public String bannerImgUrl;
    public String username;
    public String name;
    public String relationStatus;
    public Long friendshipId;
    public String bio;
    public String websiteUrl;
    public String location;
    public Long followers;
    public Long following;
    public boolean isFollowing;
    public OffsetDateTime registerDate;

    public static UserPageResponse of(User user, Long followers, Long following, boolean isFollowing, String avatarUrl) {
        UserPageResponse resp = new UserPageResponse();
        resp.id = user.id;
        resp.username = user.username;
        resp.name = user.name;
        resp.avatarUrl = avatarUrl;
        resp.bannerImgUrl = user.bannerImgUrl;
        resp.bio = user.biography;
        resp.websiteUrl = user.websiteUrl;
        resp.location = user.location;
        resp.registerDate = user.createdAt;
        resp.followers = followers;
        resp.following = following;
        resp.isFollowing = isFollowing;
        return resp;
    }
}
