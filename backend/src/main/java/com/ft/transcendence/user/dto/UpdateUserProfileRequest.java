package com.ft.transcendence.user.dto;

import jakarta.validation.constraints.Size;

public class UpdateUserProfileRequest {
    @Size(min = 3, max = 30)
    public String name;
    @Size(max = 160)
    public String bio;
    @Size(max = 100)
    public String location;
    @Size(max = 100)
    public String websiteUrl;
}
