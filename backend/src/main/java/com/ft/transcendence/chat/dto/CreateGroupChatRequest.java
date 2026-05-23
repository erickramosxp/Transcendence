package com.ft.transcendence.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class CreateGroupChatRequest {
    @NotBlank
    @Size(max = 80)
    public String chatName;
    public List<Long> participantIds;
}
