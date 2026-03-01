package com.ft.transcendence.auth.dto;

import com.ft.transcendence.user.User;
import com.ft.transcendence.user.dto.UserResponse;

public class LoginResponse {
    public String token;
    public UserResponse user;

    public static LoginResponse of(String token, User u) {
        var r = new LoginResponse();
        r.token = token;
        r.user = UserResponse.fromEntity(u);
        return r;
    }
}
