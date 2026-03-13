package com.ft.transcendence.follow.domain;

import com.ft.transcendence.user.domain.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "follows")
public class Follow extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "follower_id")
    public User follower;

    @ManyToOne(optional = false)
    @JoinColumn(name = "followee_id")
    public User followee;

    @Column(name = "created_at")
    public OffsetDateTime createdAt;

    public static long countFollowers(Long userId) {
        return count("followee.id = ?1", userId);
    }

    public static long countFollowing(Long userId) {
        return count("follower.id = ?1", userId);
    }
}
