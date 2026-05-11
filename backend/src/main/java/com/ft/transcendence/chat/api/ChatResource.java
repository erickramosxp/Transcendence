package com.ft.transcendence.chat.api;

import com.ft.transcendence.chat.app.ChatService;
import com.ft.transcendence.chat.dto.*;
import com.ft.transcendence.common.dto.PageResponse;
import com.ft.transcendence.common.security.CurrentUser;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/chats")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ChatResource {

    @Inject
    ChatService chatService;
    @Inject
    CurrentUser currentUser;

    @GET
    @Authenticated
    public ListChatResponse listMyChats(@QueryParam("page") @DefaultValue("0") int page,
                                        @QueryParam("size") @DefaultValue("20") int size) {
        return chatService.listUserChats(page, size, currentUser.id());
    }

    @POST
    @Path("/direct")
    @Authenticated
    public Response createDirectChat(CreateDirectChatRequest req) {
        Long currentUserId = currentUser.id();
        if (req.directUserId == null)
            throw new IllegalArgumentException("directUserId must not be null");
        ChatResponse chat = chatService.createDirectChat(currentUserId, req);
        return Response.status(Response.Status.CREATED).entity(chat).build();
    }

    @POST
    @Path("/group")
    @Authenticated
    public Response createGroupChat(CreateGroupChatRequest req) {
        if (req.chatName.isBlank())
            throw new IllegalArgumentException("Groups chats need a name");

        if (req.participantIds.isEmpty())
            throw new IllegalArgumentException("List of participants cannot be empty");

        ChatResponse chat = chatService.createGroupChat(currentUser.id(), req);
        return Response.status(Response.Status.CREATED).entity(chat).build();
    }

    @GET
    @Path("/{chatId}/participants")
    @Authenticated
    public PageResponse<ChatParticipantResponse> getGroupParticipants(
            @PathParam("chatId") Long chatId,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return chatService.getGroupParticipants(chatId, currentUser.id(), page, size);
    }

    @POST
    @Path("/{chatId}/participants")
    @Authenticated
    public Response addParticipant(@PathParam("chatId") Long chatId, AddGroupParticipantRequest req) {
        chatService.addParticipant(chatId, currentUser.id(), req);
        return Response.status(Response.Status.CREATED).build();
    }

    @DELETE
    @Path("/{chatId}/participants/{userId}")
    @Authenticated
    public Response removeParticipant(@PathParam("chatId") Long chatId, @PathParam("userId") Long userId) {
        chatService.removeParticipant(chatId, currentUser.id(), userId);
        return Response.noContent().build();
    }
}
