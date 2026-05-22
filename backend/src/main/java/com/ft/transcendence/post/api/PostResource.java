package com.ft.transcendence.post.api;

import com.ft.transcendence.common.security.CurrentUser;
import com.ft.transcendence.like.app.LikeService;
import com.ft.transcendence.post.app.PostService;
import com.ft.transcendence.post.dto.CreatePostForm;
import com.ft.transcendence.post.dto.FeedResponse;
import com.ft.transcendence.post.dto.PostRequest;
import com.ft.transcendence.post.dto.PostResponse;
import com.ft.transcendence.user.domain.User;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.IOException;

@Path("/posts")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class PostResource {

    @Inject
    PostService postService;
    @Inject
    CurrentUser currentUser;
    @Inject
    LikeService likeService;

    @POST
    @Authenticated
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public PostResponse post(CreatePostForm req) throws IOException {
        long userId = currentUser.id();
        return postService.create(userId, req);
    }

    @GET
    @Path("/{postId}")
    @Authenticated
    public PostResponse postById(@PathParam("postId") Long postId) {
        Long currentUserId = currentUser.id();
        return postService.getPostById(postId, currentUserId);
    }

    @GET
    @Authenticated
    public FeedResponse feed(@QueryParam("page") @DefaultValue("0") int page,
                             @QueryParam("size") @DefaultValue("20") int size,
                             @QueryParam("scope") @DefaultValue("social") String scope) {
        long userId = currentUser.id();
        return postService.feed(page, size, userId, scope);
    }

    @POST
    @Path("/{postId}/like")
    @Authenticated
    public Response like(@PathParam("postId") Long postId) {
        long userId = currentUser.id();
        likeService.likePost(userId, postId);
        return Response.status(200).build();
    }

    @POST
    @Path("/{postId}/unlike")
    @Authenticated
    public Response unlike(@PathParam("postId") Long postId) {
        long userId = currentUser.id();
        likeService.unlikePost(userId, postId);
        return Response.status(200).build();
    }

    @DELETE
    @Path("/{postId}")
    @Authenticated
    public Response deletePost(@PathParam("postId") Long postId) {

        long userId = currentUser.id();
        postService.deletePost(userId, postId);
        return Response.noContent().build();
    }
}
