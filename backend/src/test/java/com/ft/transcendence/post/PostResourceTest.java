package com.ft.transcendence.post;

import com.ft.transcendence.base.BaseApiTest;
import io.quarkus.test.junit.QuarkusTest;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

@QuarkusTest
public class PostResourceTest extends BaseApiTest {

    @Test
    public void testCreatePost() {

        given()
                .header("Authorization", "Bearer " + token)
                .contentType("application/json")
                .body("""
                {
                  "text": "Post de teste",
                  "mediaUrl": null
                }
                """)
                .when()
                .post("/posts")
                .then()
                .statusCode(200)
                .body("contents", Matchers.equalTo("Post de teste"));
    }

    @Test
    public void testFeed() {

        given()
                .header("Authorization", "Bearer " + token)
                .contentType("application/json")
                .when()
                .get("/posts")
                .then()
                .statusCode(200);
    }

    @Test
    public void testLikePost() {
        Long postId =
                ((Number) given()
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .body("""
                {
                  "text": "Post para like",
                  "mediaUrl": null
                }
                """)
                        .when()
                        .post("/posts")
                        .then()
                        .statusCode(200)
                        .extract()
                        .path("id"))
                        .longValue();

        given()
                .header("Authorization", "Bearer " + token)
                .contentType("application/json")
                .when()
                .post("/posts/" + postId + "/like")
                .then()
                .statusCode(204);
    }
}
