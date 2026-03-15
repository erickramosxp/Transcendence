package com.ft.transcendence.user.dto;

import java.time.OffsetDateTime;

public class UserPageResponse {
    public Long id;
    public String avatarUrl;
    public String bannerImgUrl;
    public String username;
    public String name;
    public Long followers;
    public Long following;
    public OffsetDateTime registerDate;
}
