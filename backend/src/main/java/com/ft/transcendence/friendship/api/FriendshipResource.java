package com.ft.transcendence.friendship.api;

import com.ft.transcendence.common.dto.PageResponse;
import com.ft.transcendence.common.security.CurrentUser;
import com.ft.transcendence.friendship.app.FriendshipService;
import com.ft.transcendence.friendship.dto.FriendshipDTO;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/friendships")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
public class FriendshipResource {

    @Inject
    FriendshipService friendshipService;

    @Inject
    CurrentUser currentUser;

    @POST
    @Path("/request/{targetUserId}")
    public Response sendRequest(@PathParam("targetUserId") Long targetUserId) {
        Long currentUserId = currentUser.id();
        friendshipService.sendRequest(currentUserId, targetUserId);
        return Response.status(Response.Status.CREATED).build();
    }

    @GET
    @Path("/requests/pending")
    public Response getPendingRequests() {
        Long currentUserId = currentUser.id();
        List<FriendshipDTO> requests = friendshipService.getPendingRequests(currentUserId);
        return Response.ok(requests).build();
    }

    @POST
    @Path("/accept/{friendshipId}")
    public Response acceptRequest(@PathParam("friendshipId") Long friendshipId) {
        Long currentUserId = currentUser.id();
        friendshipService.acceptRequest(friendshipId, currentUserId);
        return Response.ok().build();
    }

    @DELETE
    @Path("/reject/{friendshipId}")
    public Response rejectRequest(@PathParam("friendshipId") Long friendshipId) {
        Long currentUserId = currentUser.id();
        friendshipService.deleteRequest(friendshipId, currentUserId);
        return Response.noContent().build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getFriends(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size,
            @QueryParam("q") String query
    ) {
        Long currentUserId = currentUser.id();
        PageResponse<FriendshipDTO> friends = friendshipService.getFriendsList(currentUserId, page, size, query);
        return Response.ok(friends).build();
    }

    @GET
    @Path("/online")
    public Response getFriendsOnline() {
        Long currentUserId = currentUser.id();
        PageResponse<FriendshipDTO> friends = friendshipService.getOnlineFriends(currentUserId);
        return Response.ok(friends).build();
    }

    @DELETE
    @Path("/{friendshipId}")
    public Response removeFriend(@PathParam("friendshipId") Long friendshipId) {
        Long currentUserId = currentUser.id();
        friendshipService.removeFriendship(currentUserId, friendshipId);
        return Response.ok().build();
    }
}
