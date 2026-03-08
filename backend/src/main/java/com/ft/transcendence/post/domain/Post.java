package com.ft.transcendence.post.domain;

import com.ft.transcendence.user.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "posts")
public class Post extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Column(name = "text", nullable = false)
    public String text;

    @Column(name = "image_url")
    public String imageUrl;

    @Column(name = "like_count", nullable = false)
    public Long likeCount = 0L;

    @Column(name = "comment_count", nullable = false)
    public Long commentCount = 0L;

    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;

    public static Post findById(Long id) {
        return find("id", id).firstResult();
    }
}
