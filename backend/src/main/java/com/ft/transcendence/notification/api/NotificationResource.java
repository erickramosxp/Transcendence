package com.ft.transcendence.notification.api;

import com.ft.transcendence.common.dto.PageResponse;
import com.ft.transcendence.common.security.CurrentUser;
import com.ft.transcendence.notification.app.NotificationService;
import com.ft.transcendence.notification.dto.NotificationResponse;
import com.ft.transcendence.notification.dto.UnreadCountResponse;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/notifications")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
public class NotificationResource {

    @Inject
    NotificationService notificationService;

    @Inject
    CurrentUser currentUser;

    @GET
    public Response list(@QueryParam("page") @DefaultValue("0") int page,
                         @QueryParam("size") @DefaultValue("20") int size,
                         @QueryParam("unreadOnly") @DefaultValue("false") boolean unreadOnly) {
        PageResponse<NotificationResponse> result = notificationService.listByUser(currentUser.id(), page, size, unreadOnly);
        return Response.ok(result).build();
    }

    @GET
    @Path("/unread-count")
    public Response unreadCount() {
        long count = notificationService.countUnread(currentUser.id());
        return Response.ok(UnreadCountResponse.of(count)).build();
    }

    @PATCH
    @Path("/{id}/read")
    public Response markAsRead(@PathParam("id") Long id) {
        notificationService.markAsRead(id, currentUser.id());
        return Response.noContent().build();
    }

    @PATCH
    @Path("/read-all")
    public Response markAllAsRead() {
        notificationService.markAllAsRead(currentUser.id());
        return Response.noContent().build();
    }
}
