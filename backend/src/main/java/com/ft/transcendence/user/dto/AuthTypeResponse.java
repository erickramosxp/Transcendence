package com.ft.transcendence.user.dto;

import com.ft.transcendence.auth.domain.AuthProviderType;

import java.util.List;

public class AuthTypeResponse {
    public List<AuthProviderType> providers;

    public static AuthTypeResponse of(List<AuthProviderType> providers) {
        AuthTypeResponse r = new AuthTypeResponse();
        r.providers = providers;
        return r;
    }
}
