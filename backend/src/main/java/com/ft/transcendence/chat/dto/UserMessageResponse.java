package com.ft.transcendence.chat.dto;

import com.ft.transcendence.user.domain.User;

public class UserMessageResponse {
    public Long id;
    public String username;
    public String name;
    public String avatarUrl;

    public static UserMessageResponse of(User u) {
        UserMessageResponse r = new UserMessageResponse();
        r.id = u.id;
        r.username = u.username;
        r.name = u.name;
        r.avatarUrl = u.avatarUrl;
        return r;
    }
}
