package com.ft.transcendence.auth.dto;

import com.ft.transcendence.entity.User;

public class UserResponse {
    public Long id;
    public String email;
    public String username;
    public String name;

    public static UserResponse fromEntity(User u) {
        var r = new UserResponse();
        r.id = u.id;
        r.email = u.email;
        r.username = u.username;
        r.name = u.name;
        return r;
    }
}
