package com.ft.transcendence.comment.api;

import com.ft.transcendence.comment.app.CommentService;
import com.ft.transcendence.comment.dto.CommentRequest;
import com.ft.transcendence.comment.dto.CommentResponse;
import com.ft.transcendence.comment.dto.CommentsByPostResponse;
import com.ft.transcendence.common.security.CurrentUser;
import com.ft.transcendence.like.app.LikeService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

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
    public CommentResponse comment(@Valid CommentRequest req) {
        long userId = currentUser.id();
        return commentService.create(userId, req);
    }

    @GET
    @Path("/{postId}")
    @Authenticated
    public CommentsByPostResponse commentsOnAPost(@PathParam("postId") Long postId) {
        long userId = currentUser.id();
        return commentService.commentsByPost(userId, postId);
    }

    @POST
    @Path("/{commentId}/like")
    @Authenticated
    public Response like(@PathParam("commentId") Long commentId) {
        long userId = currentUser.id();
        likeService.likeComment(userId, commentId);
        return Response.noContent().build();
    }

    @POST
    @Path("/{commentId}/unlike")
    @Authenticated
    public Response unlike(@PathParam("commentId") Long commentId) {
        long userId = currentUser.id();
        likeService.unlikeComment(userId, commentId);
        return Response.noContent().build();
    }

    @DELETE
    @Path("{commentId}")
    @Authenticated
    public Response deleteComment(@PathParam("commentId") Long commentId) {

        long userId = currentUser.id();
        commentService.deleteComment(userId, commentId);
        return Response.noContent().build();
    }
}
