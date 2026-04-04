package com.ft.transcendence.preferences.domain;


import com.ft.transcendence.user.domain.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "user_preferences")
public class UserPreference extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Column(name = "theme")
    public String theme;

    @Column(name = "language")
    public String language;

    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;

    public static UserPreference createDefaultPreferences(User user, OffsetDateTime now) {
        var prefs = new UserPreference();
        prefs.user = user;
        prefs.theme = "light";
        prefs.language = "pt-BR";
        prefs.createdAt = now;
        prefs.updatedAt = now;
        prefs.persist();
        return prefs;
    }
}
