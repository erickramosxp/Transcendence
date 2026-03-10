package com.ft.transcendence.comment.api;

import com.ft.transcendence.comment.app.CommentService;
import com.ft.transcendence.comment.dto.CommentRequest;
import com.ft.transcendence.comment.dto.CommentResponse;
import com.ft.transcendence.common.security.CurrentUser;
import com.ft.transcendence.like.app.LikeService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/comment")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class CommentResource {

    @Inject
    CurrentUser currentUser;
    @Inject
    LikeService likeService;
    @Inject
    CommentService commentService;

    @POST
    @Authenticated
    public CommentResponse comment(CommentRequest req) {
        long userId = currentUser.id();
        return commentService.create(userId, req);
    }
}
