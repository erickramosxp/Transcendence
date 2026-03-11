package com.ft.transcendence.user.api;

import com.ft.transcendence.common.security.CurrentUser;
import com.ft.transcendence.user.app.UserService;
import com.ft.transcendence.user.dto.UserPageResponse;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

@Path("/user")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class UserResource {
    @Inject
    UserService userService;

    @GET
    @Path("/{username}")
    public UserPageResponse getUser(@PathParam("username") String username) {
        return userService.getUserPage(username);
    }
}
