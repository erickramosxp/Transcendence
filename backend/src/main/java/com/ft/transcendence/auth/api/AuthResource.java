package com.ft.transcendence.auth.api;

import com.ft.transcendence.auth.app.AuthService;
import com.ft.transcendence.auth.app.GoogleAuthService;
import com.ft.transcendence.auth.dto.*;
import com.ft.transcendence.common.security.CurrentUser;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import jakarta.ws.rs.core.Response;

@Path("/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService authService;
    @Inject
    CurrentUser currentUser;

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

    @PATCH
    @Path("/password")
    @Authenticated
    public Response changePassword(ChangePasswordRequest req) {
        authService.changePassword(currentUser.id(), req);
        return Response.noContent().build();
    }
}
