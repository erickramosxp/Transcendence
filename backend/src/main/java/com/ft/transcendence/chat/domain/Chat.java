package com.ft.transcendence.chat.domain;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
public class Chat extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "chat_name")
    public String chatName;

    @Column(name = "type", nullable = false)
    public OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;

    @Column(name = "last_message_at")
    public OffsetDateTime lastMessageAt;
}
