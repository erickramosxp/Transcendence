package com.ft.transcendence.auth.dto;

import jakarta.validation.constraints.Size;

public class RegisterRequest {

    public String email;
    @Size(min = 3, max = 30)
    public String username;
    @Size(min = 3, max = 30)
    public String name;
    @Size(min = 8, max = 30)
    public String password;
}
