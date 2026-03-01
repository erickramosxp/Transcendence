package com.ft.transcendence.post.api;

import com.ft.transcendence.common.security.CurrentUser;
import com.ft.transcendence.post.app.PostService;
import com.ft.transcendence.post.dto.PostRequest;
import com.ft.transcendence.post.dto.PostResponse;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/posts")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class PostResource {

    @Inject
    PostService postService;
    @Inject
    CurrentUser currentUser;

    @POST
    @Authenticated
    public PostResponse post(PostRequest req) {
        long userId = currentUser.id();
        return postService.create(userId, req);
    }
}
