package com.ft.transcendence.chat.domain;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "chats")
public class Chat extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "chat_name")
    public String chatName;

    @Column(name = "type")
    private String type;

    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;

    @Column(name = "last_message_at")
    public OffsetDateTime lastMessageAt;

    public static Chat createDirectChat() {
        Chat chat = new Chat();
        chat.type = "direct";
        chat.chatName = null;
        chat.createdAt = OffsetDateTime.now();
        chat.updatedAt = OffsetDateTime.now();
        chat.persist();
        return chat;
    }

    public static Chat createGroupChat(String chatName) {
        Chat chat = new Chat();
        chat.type = "group";
        chat.chatName = chatName;
        chat.createdAt = OffsetDateTime.now();
        chat.updatedAt = OffsetDateTime.now();
        chat.persist();
        return chat;
    }

    public String getType() {
        return this.type;
    }
}
