package com.ft.transcendence.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateDirectChatRequest {
    @NotBlank
    @NotNull
    public Long directUserId;
    @NotBlank
    @NotNull
    public  Long currentUserId;
}
