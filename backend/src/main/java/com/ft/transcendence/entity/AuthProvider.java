package com.ft.transcendence.entity;

import java.time.OffsetDateTime;
import jakarta.persistence.*;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "auth_provider")
public class AuthProvider extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "provider_type", nullable = false, columnDefinition = "auth_provider_type")
    public AuthProviderType providerType;

    @Column(name = "provider_user_id")
    public String providerUserId;

    @Column(name = "password_hash")
    public String passwordHash;

    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    public static AuthProvider findLocalByUserId(Long userId) {
        return find("user.id = ?1 AND providerType = ?2", userId, AuthProviderType.LOCAL).firstResult();
    }
}
