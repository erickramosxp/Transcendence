package com.ft.transcendence.user.domain;

import java.util.ArrayList;
import java.util.List;

import java.time.OffsetDateTime;

import com.ft.transcendence.post.domain.Post;
import jakarta.persistence.*;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;

@Entity
@Table(name = "users")
public class User extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, unique = true)
    public String email;

    @Column(name = "avatar_url")
    public String avatarUrl;

    @Column(name = "banner_image_url")
    public String bannerImgUrl;

    @Column(nullable = false, unique = true)
    public String username;

    public String name;

    @Column(nullable = false)
    public boolean active = true;

    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;

    @Column(name = "last_login")
    public OffsetDateTime lastLogin;

    public static User findByEmailOrUsername(String identifier) {
        return find("email = ?1 OR username = ?1", identifier).firstResult();
    }

    public static User findByEmail(String email) {
        return find("email", email).firstResult();
    }

    public static User findById(Long id) {
        return find("id", id).firstResult();
    }
}
