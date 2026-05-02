package com.ft.transcendence.notification.domain;

import com.ft.transcendence.notification.dto.NotificationContent;
import com.ft.transcendence.user.domain.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

@Entity
@Table(name = "notifications")
public class Notification extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    public User receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    public User sender;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    public NotificationType type;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content")
    public NotificationContent content;

    @Column(name = "is_read", nullable = false)
    public boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    public OffsetDateTime createdAt;
}
