package com.ft.transcendence.chat.api;

import com.ft.transcendence.chat.app.ChatService;
import com.ft.transcendence.chat.dto.ChatResponse;
import com.ft.transcendence.chat.dto.CreateDirectChatRequest;
import com.ft.transcendence.chat.dto.ListChatResponse;
import com.ft.transcendence.common.security.CurrentUser;
import com.ft.transcendence.user.domain.User;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
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
    public ListChatResponse listMyChats() {
        return chatService.listUserChats(currentUser.id());
    }

    @POST
    @Path("/direct")
    @Authenticated
    public Response createDirectChat(CreateDirectChatRequest req) {
        if (req.currentUserId == null || req.directUserId == null)
            throw new IllegalArgumentException("currentUserId and directUserId must not be null");
        ChatResponse chat = chatService.createDirectChat(req);
        return Response.status(Response.Status.CREATED).entity(chat).build();
    }
}
