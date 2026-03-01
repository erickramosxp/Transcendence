package com.ft.transcendence.auth.api;

import com.ft.transcendence.auth.app.AuthService;
import com.ft.transcendence.auth.app.GoogleAuthService;
import com.ft.transcendence.auth.dto.GoogleLoginRequest;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import com.ft.transcendence.auth.dto.AuthResponse;
import com.ft.transcendence.auth.dto.LoginRequest;
import com.ft.transcendence.auth.dto.RegisterRequest;

@Path("/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService authService;
    @POST
    @Path("/register")
    public AuthResponse register(RegisterRequest req) {
        return authService.registerLocal(req);
    }

    @POST
    @Path("/login")
    public AuthResponse login(LoginRequest req) {
        return authService.login(req.username, req.password);
    }

    @Inject
    GoogleAuthService googleAuthService;
    @POST
    @Path("/google")
    public AuthResponse loginWithGoogle(GoogleLoginRequest req) {
        return googleAuthService.loginOrRegisterWithGoogleCode(req.code);
    }
}
