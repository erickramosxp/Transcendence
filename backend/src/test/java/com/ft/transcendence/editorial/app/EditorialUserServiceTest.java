package com.ft.transcendence.editorial.app;

import com.ft.transcendence.user.domain.User;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
class EditorialUserServiceTest {

    @Inject
    EditorialUserService editorialUserService;

    @Test
    @Transactional
    void findEditorialUser_returnsSeededEditorialUser() {
        ensureEditorialUserExists();

        Optional<User> user = editorialUserService.findEditorialUser();

        assertTrue(user.isPresent());
        assertEquals("videanews", user.get().username);
        assertEquals("Videa News", user.get().name);
    }

    private void ensureEditorialUserExists() {
        if (User.find("username", "videanews").firstResult() != null) {
            return;
        }
        var now = OffsetDateTime.now();
        var user = new User();
        user.email = "editorial@videanews.local";
        user.username = "videanews";
        user.name = "Videa News";
        user.active = true;
        user.biography = "Noticias do momento no Brasil.";
        user.createdAt = now;
        user.updatedAt = now;
        user.persist();
    }
}
