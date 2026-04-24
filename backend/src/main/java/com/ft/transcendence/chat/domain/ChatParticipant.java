package com.ft.transcendence.chat.domain;

import com.ft.transcendence.user.domain.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.Optional;

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
    public String role;

    @Column(name = "joined_at", nullable = false, updatable = false)
    public OffsetDateTime joinedAt;

    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;

    public static ChatParticipant create(Chat chat, User user, String role) {
        OffsetDateTime now = OffsetDateTime.now();
        ChatParticipant cp = new ChatParticipant();
        cp.chat = chat;
        cp.user = user;
        cp.role = role;
        cp.joinedAt = now;
        cp.updatedAt = now;
        cp.persist();
        return cp;
    }

    public static Optional<Chat> findDirectChatId(Long user1Id, Long user2Id) {
        return find("""
            SELECT c
            FROM Chat c
            WHERE c.type = 'direct'
              AND (SELECT COUNT(p.id) FROM ChatParticipant p WHERE p.chat.id = c.id) = 2
              AND EXISTS (
                  SELECT 1 FROM ChatParticipant p1
                  WHERE p1.chat.id = c.id AND p1.user.id = ?1
              )
              AND EXISTS (
                  SELECT 1 FROM ChatParticipant p2
                  WHERE p2.chat.id = c.id AND p2.user.id = ?2
              )
            """, user1Id, user2Id).firstResultOptional();
    }
}
