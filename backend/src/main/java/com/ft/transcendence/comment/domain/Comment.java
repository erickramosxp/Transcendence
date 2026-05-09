package com.ft.transcendence.comment.domain;

import com.ft.transcendence.user.domain.User;
import com.ft.transcendence.post.domain.Post;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "comments")
public class Comment extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    public Post post;

    @Column(name = "text", nullable = false)
    public String text;

    @Column(name = "like_count", nullable = false)
    public Long likeCount = 0L;

    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    public OffsetDateTime deletedAt;

    public static Comment findById(Long id) {
        return find("id", id).firstResult();
    }
}
