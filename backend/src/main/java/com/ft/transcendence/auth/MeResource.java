package com.ft.transcendence.auth;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import org.eclipse.microprofile.jwt.JsonWebToken;

import com.ft.transcendence.auth.dto.UserResponse;
import com.ft.transcendence.entity.User;

import io.quarkus.security.Authenticated;

@Path("/me")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MeResource {

    @Inject JsonWebToken jwt;

    @GET
    @Authenticated
    public UserResponse me() {
        String email = jwt.getName();
        User user = User.findByEmail(email);
        if (user == null)
            throw new NotAuthorizedException("Invalid token");
        return UserResponse.fromEntity(user);
    }
}
