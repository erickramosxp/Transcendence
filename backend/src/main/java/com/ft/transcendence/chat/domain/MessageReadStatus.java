package com.ft.transcendence.chat.domain;

import com.ft.transcendence.user.domain.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(
        name = "message_read_status",
        uniqueConstraints = @UniqueConstraint(columnNames = {"message_id", "user_id"})
)
public class MessageReadStatus extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "message_id", nullable = false)
    public ChatMessage message;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Column(name = "read_at", nullable = false)
    public OffsetDateTime readAt;
}
