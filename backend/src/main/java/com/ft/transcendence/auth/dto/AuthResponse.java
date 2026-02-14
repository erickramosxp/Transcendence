package com.ft.transcendence.auth.dto;

import com.ft.transcendence.entity.User;

public class AuthResponse {
    public String token;
    public UserResponse user;

    public static AuthResponse of(String token, User user) {
        var r = new AuthResponse();
        r.token = token;
        r.user = UserResponse.fromEntity(user);
        return r;
    }
}
