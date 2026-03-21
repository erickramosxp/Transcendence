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

import java.time.OffsetDateTime;
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
        resp.bio = user.biography;
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
        user.biography = normalize(req.bio);
        user.location = normalize(req.location);
        user.websiteUrl = normalize(req.websiteUrl);

        return UpdateUserProfileResponse.of(user);
    }

    public UserPostsResponse getPostsLikedByUser(long userId, int page, int size) {
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

        UserPostsResponse resp = new UserPostsResponse();
        resp.items = posts.stream().map(p -> PostResponse.of(p, true)).toList();
        resp.page = page;
        resp.size = size;
        resp.hasMore = hasMore;
        return resp;
    }

    public UserPostsResponse getUserPosts(long userId, int page, int size) {
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

        UserPostsResponse resp = new UserPostsResponse();
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
    public Response updateAvatar(long userId, UpdateAvatarRequest req) {
        User user = User.findById(userId);
        user.avatarUrl = normalize(req.avatarUrl);
        return Response.noContent().build();
    }

    @Transactional
    public Response updateBanner(long userId, UpdateBannerRequest req) {
        User user = User.findById(userId);
        user.bannerImgUrl = normalize(req.bannerUrl);
        return Response.noContent().build();
    }

    @Transactional
    public void followUser(long currentUserId, User followedUser) {
        if (currentUserId == followedUser.id)
            throw new IllegalArgumentException("Users cannot be the same");

        boolean alreadyFollowing = Follow.find("follower.id = ?1 and followee.id = ?2", currentUserId, followedUser.id)
                .firstResultOptional().isPresent();

        if (alreadyFollowing)
            return;

        Follow follow = new Follow();
        follow.follower = User.findById(currentUserId);
        follow.followee = User.findById(followedUser.id);
        follow.createdAt = OffsetDateTime.now();

        follow.persist();
    }

    @Transactional
    public void unfollowUser(long currentUserId, User followedUser) {
        if (currentUserId == followedUser.id)
            throw new IllegalArgumentException("Users cannot be the same");

        Follow.delete("follower.id = ?1 and followee.id = ?2", currentUserId, followedUser.id);
    }

    public UserFollowListResponse getFollowers(long userId) {
        List<Follow> follows = Follow.find("followee.id = ?1 order by createdAt desc", userId).list();

        UserFollowListResponse list = new UserFollowListResponse();
        list.items = follows.stream().map(UserFollowResponse::ofFollowers).toList();
        return list;
    }

    public UserFollowListResponse getFollowing(long userId) {
        List<Follow> follows = Follow.find("follower.id = ?1 order by createdAt desc", userId).list();

        UserFollowListResponse list = new UserFollowListResponse();
        list.items = follows.stream().map(UserFollowResponse::ofFollowing).toList();
        return list;
    }
}
