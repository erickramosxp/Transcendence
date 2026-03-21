package com.ft.transcendence.user.dto;

import com.ft.transcendence.user.domain.User;

public class UpdateUserProfileResponse {
    public String name;
    public String bio;
    public String location;
    public String websiteUrl;

    public static UpdateUserProfileResponse of(User user) {
        var r = new UpdateUserProfileResponse();
        r.name = user.name;
        r.bio = user.biography;
        r.location = user.location;
        r.websiteUrl = user.websiteUrl;
        return r;
    }
}
