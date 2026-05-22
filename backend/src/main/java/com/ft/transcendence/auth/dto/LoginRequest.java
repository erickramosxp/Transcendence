package com.ft.transcendence.auth.dto;

import jakarta.validation.constraints.Size;

public class LoginRequest {
    public String username; // email OU username
    @Size(max = 30)
    public String password;
}
