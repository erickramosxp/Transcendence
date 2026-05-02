package com.ft.transcendence.notification;

import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.user.UserTestContext;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
public class NotificationResourceTest extends BaseApiTest {

    private Long createPost(UserTestContext author) {
        return ((Number) given()
                .header("Authorization", "Bearer " + author.token)
                .contentType("multipart/form-data")
                .multiPart("text", "Post de teste para notificação")
                .when()
                .post("/posts")
                .then()
                .statusCode(200)
                .extract()
                .path("id"))
                .longValue();
    }

    private void likePost(UserTestContext liker, Long postId) {
        given()
                .header("Authorization", "Bearer " + liker.token)
                .when()
                .post("/posts/" + postId + "/like")
                .then()
                .statusCode(200);
    }

    @Test
    public void testLikePostGeneratesNotification() {
        // ARRANGE: dois usuários — dono do post e quem vai curtir
        UserTestContext userA = createUser(); // receberá a notificação
        UserTestContext userB = createUser(); // fará o like

        Long postId = createPost(userA);
        likePost(userB, postId);

        // ACT + ASSERT: userA deve ter 1 notificação não lida do tipo LIKE_POST
        given()
                .header("Authorization", "Bearer " + userA.token)
                .when()
                .get("/notifications")
                .then()
                .statusCode(200)
                .body("items.size()", is(1))
                .body("items[0].type", is("LIKE_POST"))
                .body("items[0].isRead", is(false))
                .body("items[0].postId", is(postId.intValue()));
    }

    @Test
    public void testUnreadCountIncreasesAfterLike() {
        UserTestContext userA = createUser();
        UserTestContext userB = createUser();
        Long postId = createPost(userA);

        // antes do like: 0 não lidas
        given()
                .header("Authorization", "Bearer " + userA.token)
                .when()
                .get("/notifications/unread-count")
                .then()
                .statusCode(200)
                .body("count", is(0));

        likePost(userB, postId);

        // após o like: 1 não lida
        given()
                .header("Authorization", "Bearer " + userA.token)
                .when()
                .get("/notifications/unread-count")
                .then()
                .statusCode(200)
                .body("count", is(1));
    }

    @Test
    public void testMarkNotificationAsRead() {
        UserTestContext userA = createUser();
        UserTestContext userB = createUser();
        Long postId = createPost(userA);
        likePost(userB, postId);

        // pega o ID da notificação
        Long notifId = ((Number) given()
                .header("Authorization", "Bearer " + userA.token)
                .when()
                .get("/notifications")
                .then()
                .statusCode(200)
                .extract()
                .path("items[0].id"))
                .longValue();

        // marca como lida
        given()
                .header("Authorization", "Bearer " + userA.token)
                .when()
                .patch("/notifications/" + notifId + "/read")
                .then()
                .statusCode(204); // noContent

        // confirma que a contagem zerou
        given()
                .header("Authorization", "Bearer " + userA.token)
                .when()
                .get("/notifications/unread-count")
                .then()
                .statusCode(200)
                .body("count", is(0));
    }

    @Test
    public void testSelfLikeDoesNotGenerateNotification() {
        // Um usuário curtir o próprio post não deve gerar notificação
        UserTestContext userA = createUser();
        Long postId = createPost(userA);
        likePost(userA, postId); // userA curte o próprio post

        given()
                .header("Authorization", "Bearer " + userA.token)
                .when()
                .get("/notifications/unread-count")
                .then()
                .statusCode(200)
                .body("count", is(0)); // sem notificação
    }

    @Test
    public void testMarkAllAsRead() {
        UserTestContext userA = createUser();
        UserTestContext userB = createUser();
        UserTestContext userC = createUser();
        Long postId = createPost(userA);
        likePost(userB, postId);
        likePost(userC, postId);

        given()
                .header("Authorization", "Bearer " + userA.token)
                .when()
                .get("/notifications/unread-count")
                .then()
                .statusCode(200)
                .body("count", is(2));

        given()
                .header("Authorization", "Bearer " + userA.token)
                .when()
                .patch("/notifications/read-all")
                .then()
                .statusCode(204);

        given()
                .header("Authorization", "Bearer " + userA.token)
                .when()
                .get("/notifications/unread-count")
                .then()
                .statusCode(200)
                .body("count", is(0));
    }
}