package com.ft.transcendence.post;

import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.user.UserTestContext;
import io.quarkus.test.junit.QuarkusTest;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

@QuarkusTest
public class PostResourceTest extends BaseApiTest {

    @Test
    public void testCreatePost() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("multipart/form-data")
                .multiPart("text", "Post de teste")
                .when()
                .post("/posts")
                .then()
                .statusCode(200)
                .body("contents", Matchers.equalTo("Post de teste"));
    }

    @Test
    public void testFeed() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("application/json")
                .when()
                .get("/posts")
                .then()
                .statusCode(200);
    }

    @Test
    public void testLikePost() {
        UserTestContext user = createUser();

        Long postId =
                ((Number) given()
                        .header("Authorization", "Bearer " + user.token)
                        .contentType("multipart/form-data")
                        .multiPart("text", "Post de teste")
                        .when()
                        .post("/posts")
                        .then()
                        .statusCode(200)
                        .extract()
                        .path("id"))
                        .longValue();

        given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("application/json")
                .when()
                .post("/posts/" + postId + "/like")
                .then()
                .statusCode(200);
    }
}
