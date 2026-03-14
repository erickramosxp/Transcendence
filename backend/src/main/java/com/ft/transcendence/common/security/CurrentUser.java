package com.ft.transcendence.common.security;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.json.JsonNumber;
import org.eclipse.microprofile.jwt.JsonWebToken;

@ApplicationScoped
public class CurrentUser {
    @Inject
    JsonWebToken jwt;

    public long id() {
        Object uid = jwt.getClaim("uid");

        return switch (uid) {
            case null -> throw new IllegalStateException("JWT without claim uid");
            case JsonNumber jn -> jn.longValue();
            case Number n -> n.longValue();
            default -> Long.parseLong(uid.toString());
        };
    }

    public String email() {
        return jwt.getName();
    }
}
