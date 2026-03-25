package com.ft.transcendence.chat.domain;

import com.ft.transcendence.user.domain.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(
        name = "chat_participants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"chat_id", "user_id"})
)
public class ChatParticipant extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chat_id", nullable = false)
    public Chat chat;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Column(name = "role")
    public String role; // 'admin', 'member', etc.

    @Column(name = "joined_at", nullable = false, updatable = false)
    public OffsetDateTime joinedAt;

    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;
}
