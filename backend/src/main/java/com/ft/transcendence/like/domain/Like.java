package com.ft.transcendence.like.domain;

import com.ft.transcendence.comment.domain.Comment;
import com.ft.transcendence.user.domain.User;
import com.ft.transcendence.post.domain.Post;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "likes",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_likes_user_post", columnNames = {"user_id", "post_id"}),
                @UniqueConstraint(name = "uk_likes_user_comment", columnNames = {"user_id", "comment_id"})
        }
)
public class Like extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @ManyToOne
    @JoinColumn(name = "post_id")
    public Post post;

    @ManyToOne
    @JoinColumn(name = "comment_id")
    public Comment comment;

    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;
}
