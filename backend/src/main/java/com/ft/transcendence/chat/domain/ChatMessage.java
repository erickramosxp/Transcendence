package com.ft.transcendence.chat.domain;

import com.ft.transcendence.user.domain.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chat_id", nullable = false)
    public Chat chat;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    public User sender;

    @Column(name = "content")
    public String content;

    @Column(name = "media_url")
    public String mediaUrl;

    @Column(name = "type", nullable = false)
    public String type; // 'text', 'image', ...

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_to_id")
    public ChatMessage replyTo;

    @Column(name = "created_at", nullable = false, updatable = false)
    public OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    public OffsetDateTime deletedAt;
}
