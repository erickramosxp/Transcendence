package com.ft.transcendence.user;

import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.job.app.JobWorker;
import com.ft.transcendence.media.domain.Media;
import com.ft.transcendence.media.enums.MediaType;
import com.ft.transcendence.user.domain.User;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.InjectMock;
import io.quarkus.test.TestTransaction;
import io.quarkus.test.junit.QuarkusTest;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.Assertions.assertNull;

@QuarkusTest
@DisplayName("User Avatar Integration Tests")
public class UserAvatarResourceTest extends BaseApiTest {

    @InjectMock
    StorageService storageService;

    @Inject
    JobWorker jobWorker;

    @BeforeEach
    void setup() {
        Mockito.when(storageService.generateUrl(Mockito.anyString()))
                .thenReturn("http://mock-url.com/avatar-presigned.jpg");
    }

    @Test
    @DisplayName("Should return current user avatar")
    void testGetMyAvatar() {
        UserTestContext userContext = createUser();

        QuarkusTransaction.requiringNew().run(() -> {
            User user = User.findById(userContext.id);
            user.avatarUrl = "avatars/user-1.jpg";
        });

        given()
                .header("Authorization", "Bearer " + userContext.token)
                .when()
                .get("/user/me/avatar")
                .then()
                .statusCode(200)
                .body("avatarUrl", equalTo("http://mock-url.com/avatar-presigned.jpg"));

        Mockito.verify(storageService, Mockito.times(1))
                .generateUrl("avatars/user-1.jpg");
    }

    @Test
    @DisplayName("Should delete current user avatar")
    void testDeleteCurrentUserAvatar() {
        UserTestContext userContext = createUser();

        QuarkusTransaction.requiringNew().run(() -> {

            Media media = new Media();
            media.modelType = "USER_PROFILE";
            media.modelId = userContext.id;
            media.mediaType = MediaType.IMAGE;
            media.pathOriginal = "avatar/user-1.jpg";
            media.persist();
        });

        Mockito.doNothing().when(storageService).delete("avatar/user-1.jpg");

        given()
                .header("Authorization", "Bearer " + userContext.token)
                .when()
                .delete("/user/me/avatar")
                .then()
                .statusCode(204);

        jobWorker.processJobs();

        List<Media> medias =
                Media.findByModel("USER_PROFILE", userContext.id);

        Assertions.assertTrue(medias.isEmpty());

        Mockito.verify(storageService, Mockito.times(1))
                .delete("avatar/user-1.jpg");
    }

    @Test
    @DisplayName("Should do nothing when current user has no avatar")
    void testDeleteCurrentUserAvatarWhenAvatarIsNull() {
        UserTestContext userContext = createUser();


        given()
                .header("Authorization", "Bearer " + userContext.token)
                .when()
                .delete("/user/me/avatar")
                .then()
                .statusCode(204);

        Mockito.verify(storageService, Mockito.never()).delete(Mockito.anyString());
    }

    @Test
    @DisplayName("Should return null when current user has no avatar")
    void testGetMyAvatarWhenAvatarIsNull() {
        UserTestContext userContext = createUser();

        given()
                .header("Authorization", "Bearer " + userContext.token)
                .when()
                .get("/user/me/avatar")
                .then()
                .statusCode(200)
                .body("avatarUrl", equalTo(null));

        Mockito.verify(storageService, Mockito.never()).generateUrl(Mockito.anyString());
    }
}
