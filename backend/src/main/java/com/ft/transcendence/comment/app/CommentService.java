package com.ft.transcendence.comment.app;

import com.ft.transcendence.comment.domain.Comment;
import com.ft.transcendence.comment.dto.CommentRequest;
import com.ft.transcendence.comment.dto.CommentResponse;
import com.ft.transcendence.comment.dto.CommentsByPostResponse;
import com.ft.transcendence.like.domain.Like;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.user.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.time.OffsetDateTime;
import java.util.List;

@ApplicationScoped
public class CommentService {

    @Transactional
    public CommentResponse create(Long userId, CommentRequest req) {
        if (req.text == null || req.text.isBlank())
            throw new BadRequestException("Comment must contain text");

        Post post = Post.findById(req.postId);
        if (post == null)
            throw new NotFoundException("Post not found");

        var now = OffsetDateTime.now();
        Comment comment = new Comment();
        comment.user = User.findById(userId);
        comment.post = post;
        comment.text = req.text;
        comment.likeCount = 0L;
        comment.createdAt = now;
        comment.updatedAt = now;
        comment.persist();

        return CommentResponse.of(comment, false);
    }

    public CommentsByPostResponse commentsByPost(Long userId, Long postId) {
        List<Comment> comments = Comment.find("post.id = ?1 order by createdAt desc", postId).list();

        List<Long> commentsIds = comments.stream().map(c -> c.id).toList();

        List<Like> likes = Like.find("user.id = ?1 and comment.id in ?2", userId, commentsIds).list();

        var likedCommentIds = likes.stream().map(l -> l.comment.id).collect(java.util.stream.Collectors.toSet());

        CommentsByPostResponse resp = new CommentsByPostResponse();
        resp.items = comments.stream().map(c -> CommentResponse.of(c, likedCommentIds.contains(c.id))).toList();
        return resp;
    }
}
