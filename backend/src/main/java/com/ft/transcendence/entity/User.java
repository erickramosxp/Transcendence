package com.ft.transcendence.entity;

import java.util.ArrayList;
import java.util.List;

import java.time.OffsetDateTime;
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

    @Column(nullable = false, unique = true)
    public String username;

    public String name;

    @Column(nullable = false)
    public boolean active = true;

    public String roles;

    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;

    @Column(name = "last_login")
    public OffsetDateTime lastLogin;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Post> posts = new ArrayList<>();

    public static User findByEmailOrUsername(String identifier) {
        return find("email = ?1 OR username = ?1", identifier).firstResult();
    }

    public static User findByEmail(String email) {
        return find("email", email).firstResult();
    }
}
