package com.ft.transcendence.user.api;

import com.ft.transcendence.common.security.CurrentUser;
import com.ft.transcendence.user.app.UserService;
import com.ft.transcendence.user.domain.User;
import com.ft.transcendence.user.dto.*;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/user")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class UserResource {
    @Inject
    UserService userService;
    @Inject
    CurrentUser currentUser;

    @GET
    @Path("/{username}")
    @Authenticated
    public UserPageResponse getUser(@PathParam("username") String username) {
        return userService.getUserPage(username);
    }

    @PATCH
    @Path("/profile")
    @Authenticated
    public UpdateUserProfileResponse updateProfile(UpdateUserProfileRequest req) {
        long userId = currentUser.id();
        return userService.updateProfile(userId, req);
    }

    @GET
    @Path("/{username}/likes")
    @Authenticated
    public UserPostsResponse postsLikedByUser(@PathParam("username") String username,
                                              @QueryParam("page") @DefaultValue("0") int page,
                                              @QueryParam("size") @DefaultValue("20") int size) {
        User user = User.findByEmailOrUsername(username);
        if (user == null)
            throw new NotFoundException("User not found");
        return userService.getPostsLikedByUser(user.id, page, size);
    }

    @GET
    @Path("/{username}/posts")
    @Authenticated
    public UserPostsResponse userPosts(@PathParam("username") String username,
                                       @QueryParam("page") @DefaultValue("0") int page,
                                       @QueryParam("size") @DefaultValue("20") int size) {
        User user = User.findByEmailOrUsername(username);
        if (user == null)
            throw new NotFoundException("User not found");
        return userService.getUserPosts(user.id, page, size);
    }

    @GET
    @Path("/{username}/media")
    @Authenticated
    public UserMediaResponse userMedia(@PathParam("username") String username,
                                       @QueryParam("page") @DefaultValue("0") int page,
                                       @QueryParam("size") @DefaultValue("20") int size) {
        User user = User.findByEmailOrUsername(username);
        if (user == null)
            throw new NotFoundException("User not found");
        return userService.getUserMedia(user.id, page, size);
    }

    @PATCH
    @Path("/avatar")
    @Authenticated
    public Response updateAvatar(UpdateAvatarRequest req) {
        long userId = currentUser.id();
        return userService.updateAvatar(userId, req);
    }

    @PATCH
    @Path("/banner")
    @Authenticated
    public Response updateBanner(UpdateBannerRequest req) {
        long userId = currentUser.id();
        return userService.updateBanner(userId, req);
    }

    @POST
    @Path("/{username}/follow")
    @Authenticated
    public Response follow(@PathParam("username") String username) {
        User followedUser = User.findByEmailOrUsername(username);
        if (followedUser == null)
            throw new NotFoundException("User not found");
        long currentUserId = currentUser.id();
        userService.followUser(currentUserId, followedUser);
        return Response.status(200).build();
    }

    @POST
    @Path("/{username}/unfollow")
    @Authenticated
    public Response unfollow(@PathParam("username") String username) {
        User followedUser = User.findByEmailOrUsername(username);
        if (followedUser == null)
            throw new NotFoundException("User not found");
        long currentUserId = currentUser.id();
        userService.unfollowUser(currentUserId, followedUser);
        return Response.status(200).build();
    }

    @GET
    @Path("/{username}/followers")
    @Authenticated
    public UserFollowListResponse followers(@PathParam("username") String username) {
        User user = User.findByEmailOrUsername(username);
        if (user == null)
            throw new NotFoundException("User not found");
        return userService.getFollowers(user.id);
    }

    @GET
    @Path("/{username}/following")
    @Authenticated
    public UserFollowListResponse following(@PathParam("username") String username) {
        User user = User.findByEmailOrUsername(username);
        if (user == null)
            throw new NotFoundException("User not found");
        return userService.getFollowing(user.id);
    }
}
