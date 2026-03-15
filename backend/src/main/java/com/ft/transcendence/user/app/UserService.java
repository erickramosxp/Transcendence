package com.ft.transcendence.user.app;

import com.ft.transcendence.follow.domain.Follow;
import com.ft.transcendence.like.domain.Like;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.post.dto.PostResponse;
import com.ft.transcendence.user.domain.User;
import com.ft.transcendence.user.dto.PostsLikedByUserResponse;
import com.ft.transcendence.user.dto.UpdateUserProfileRequest;
import com.ft.transcendence.user.dto.UpdateUserProfileResponse;
import com.ft.transcendence.user.dto.UserPageResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

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

    public PostsLikedByUserResponse getPostsLikedByUser(long userId, int page, int size) {
        int start = page * size;
        int end = page + size;

        List<Like> likes = Like.find("user.id = ?1 and post is not null order by createdAt desc", userId)
                .range(start, end)
                .list();

        boolean hasMore = likes.size() > size;
        if (hasMore)
            likes = likes.subList(0, size);

        List<Post> posts = likes.stream()
                .map(l -> l.post)
                .toList();

        PostsLikedByUserResponse resp = new PostsLikedByUserResponse();
        resp.items = posts.stream().map(p -> PostResponse.of(p, true)).toList();
        resp.page = page;
        resp.size = size;
        resp.hasMore = hasMore;
        return resp;
    }
}
