package com.ft.transcendence.chat.api;

import com.ft.transcendence.chat.app.ChatMessageService;
import com.ft.transcendence.chat.dto.ChatMessageRequest;
import com.ft.transcendence.chat.dto.ChatMessageResponse;
import com.ft.transcendence.common.security.CurrentUser;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/chats/{chatId}/messages")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ChatMessageResource {

    @Inject
    CurrentUser currentUser;
    @Inject
    ChatMessageService chatMessageService;

    @POST
    @Authenticated
    public Response sendMessage(@PathParam("chatId") Long chatId, ChatMessageRequest req) {
        ChatMessageResponse message = chatMessageService.createMessage(currentUser.id(), chatId, req);
        return Response.status(Response.Status.CREATED).entity(message).build();
    }
}
