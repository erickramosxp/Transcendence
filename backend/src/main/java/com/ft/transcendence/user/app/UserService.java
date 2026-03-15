package com.ft.transcendence.user.app;

import com.ft.transcendence.follow.domain.Follow;
import com.ft.transcendence.user.domain.User;
import com.ft.transcendence.user.dto.UpdateUserProfileRequest;
import com.ft.transcendence.user.dto.UpdateUserProfileResponse;
import com.ft.transcendence.user.dto.UserPageResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class UserService {

    public UserPageResponse getUserPage(String username) {
        User user = User.findByEmailOrUsername(username);
        if (user == null)
            throw new NotFoundException("User not found");

        UserPageResponse resp = new UserPageResponse();

        resp.id = user.id;
        resp.username = user.username;
        resp.name = user.name;
        resp.avatarUrl = user.avatarUrl;
        resp.bannerImgUrl = user.bannerImgUrl;
        resp.biography = user.biography;
        resp.websiteUrl = user.websiteUrl;
        resp.location = user.location;
        resp.registerDate = user.createdAt;

        resp.followers = Follow.count("followee.id = ?1", user.id);
        resp.following = Follow.count("follower.id = ?1", user.id);

        return resp;
    }

    private String normalize(String s) {
        if (s == null || s.isBlank())
            return null;
        return s;
    }

    @Transactional
    public UpdateUserProfileResponse updateProfile(long userId, UpdateUserProfileRequest req) {
        User user = User.findById(userId);

        if (req.name != null && !req.name.isBlank())
            user.name = req.name;
        user.biography = normalize(req.biography);
        user.location = normalize(req.location);
        user.websiteUrl = normalize(req.websiteUrl);

        return UpdateUserProfileResponse.of(user);
    }
}
