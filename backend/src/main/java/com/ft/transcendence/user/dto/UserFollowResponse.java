package com.ft.transcendence.user.dto;

import com.ft.transcendence.follow.domain.Follow;

public class UserFollowResponse {
    public Long id;
    public String username;
    public String name;
    public String avatarUrl;

    public static UserFollowResponse ofFollowers(Follow f) {
        UserFollowResponse r = new UserFollowResponse();
        r.id = f.follower.id;
        r.username = f.follower.username;
        r.name = f.follower.name;
        r.avatarUrl = f.follower.avatarUrl;
        return r;
    }

    public static UserFollowResponse ofFollowing(Follow f) {
        UserFollowResponse r = new UserFollowResponse();
        r.id = f.followee.id;
        r.username = f.followee.username;
        r.name = f.followee.name;
        r.avatarUrl = f.followee.avatarUrl;
        return r;
    }
}
