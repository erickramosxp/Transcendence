package com.ft.transcendence.user.app;

import com.ft.transcendence.follow.domain.Follow;
import com.ft.transcendence.like.domain.Like;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.post.dto.PostResponse;
import com.ft.transcendence.user.domain.User;
import com.ft.transcendence.user.dto.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;

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

    public PostsByUserResponse getPostsLikedByUser(long userId, int page, int size) {
        if (page < 0 || size <= 0)
            throw new BadRequestException("Invalid page or size");

        int start = page * size;
        int end = start + size;

        List<Like> likes = Like.find("user.id = ?1 and post is not null order by createdAt desc", userId)
                .range(start, end)
                .list();

        boolean hasMore = likes.size() > size;
        if (hasMore)
            likes = likes.subList(0, size);

        List<Post> posts = likes.stream()
                .map(l -> l.post)
                .toList();

        PostsByUserResponse resp = new PostsByUserResponse();
        resp.items = posts.stream().map(p -> PostResponse.of(p, true)).toList();
        resp.page = page;
        resp.size = size;
        resp.hasMore = hasMore;
        return resp;
    }

    public PostsByUserResponse getUserPosts(long userId, int page, int size) {
        if (page < 0 || size <= 0)
            throw new BadRequestException("Invalid page or size");

        int start = page * size;
        int end = start + size;

        List<Post> posts = Post.find("user.id = ?1 order by createdAt desc", userId)
                .range(start, end)
                .list();

        boolean hasMore = posts.size() > size;
        if (hasMore)
            posts = posts.subList(0, size);

        PostsByUserResponse resp = new PostsByUserResponse();
        resp.items = posts.stream().map(p -> PostResponse.of(p, true)).toList();
        resp.page = page;
        resp.size = size;
        resp.hasMore = hasMore;
        return resp;
    }

    public UserMediaResponse getUserMedia(long userId, int page, int size) {
        if (page < 0 || size <= 0)
            throw new BadRequestException("Invalid page or size");

        int start = page * size;
        int end = start + size;

        List<Post> posts = Post.find("user.id = ?1 and mediaUrl is not null order by createdAt desc", userId)
                .range(start, end)
                .list();

        boolean hasMore = posts.size() > size;
        if (hasMore)
            posts = posts.subList(0, size);

        UserMediaResponse resp = new UserMediaResponse();
        resp.items = posts.stream().map(MediaResponse::of).toList();
        resp.page = page;
        resp.size = size;
        resp.hasMore = hasMore;
        return resp;
    }

    @Transactional
    public Response updateAvatar(long userId, AvatarRequest req) {
        User user = User.findById(userId);
        user.avatarUrl = normalize(req.avatarUrl);
        return Response.noContent().build();
    }
}
