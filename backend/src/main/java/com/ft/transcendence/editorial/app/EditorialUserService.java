package com.ft.transcendence.editorial.app;

import com.ft.transcendence.editorial.config.EditorialConfig;
import com.ft.transcendence.user.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.Optional;


@ApplicationScoped
public class EditorialUserService {

    @Inject
    EditorialConfig editorialConfig;

    public User requireEditorialUser() {
        return findEditorialUser()
                .orElseThrow(() -> new NotFoundException(
                        "Editorial user not found: " + editorialConfig.username()
                                + ". Run database migrations (V19__seed_editorial_user)."));
    }

    public Optional<User> findEditorialUser() {
        String username = editorialConfig.username().trim();
        if (username.isBlank()) {
            return Optional.empty();
        }
        User user = User.find("username", username).firstResult();
        return Optional.ofNullable(user);
    }

    public long requireEditorialUserId() {
        return requireEditorialUser().id;
    }
}
