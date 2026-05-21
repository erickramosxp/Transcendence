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
    void findEditorialUser_returnsSeededVideaUser() {
        ensureVideaUserExists();

        Optional<User> user = editorialUserService.findEditorialUser();

        assertTrue(user.isPresent());
        assertEquals("videa", user.get().username);
        assertEquals("Videa Notícias", user.get().name);
    }

    private void ensureVideaUserExists() {
        if (User.find("username", "videa").firstResult() != null) {
            return;
        }
        var now = OffsetDateTime.now();
        var user = new User();
        user.email = "editorial@videa.local";
        user.username = "videa";
        user.name = "Videa Notícias";
        user.active = true;
        user.biography = "Manchetes do momento no Brasil.";
        user.createdAt = now;
        user.updatedAt = now;
        user.persist();
    }
}
