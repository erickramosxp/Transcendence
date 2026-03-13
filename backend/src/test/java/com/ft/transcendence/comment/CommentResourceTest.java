package com.ft.transcendence.comment;

import com.ft.transcendence.base.BaseApiTest;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.ValidatableResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.hamcrest.Matchers;

import static io.restassured.RestAssured.given;

@QuarkusTest
public class CommentResourceTest extends BaseApiTest {

    @Test
    public void testCreateComment() {
        Long postId =
                ((Number) given()
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .body("""
            {
              "text": "Post para comentário",
              "mediaUrl": null
            }
            """)
                        .when()
                        .post("/posts")
                        .then()
                        .extract()
                        .path("id"))
                        .longValue();

        given()
                .header("Authorization", "Bearer " + token)
                .contentType("application/json")
                .body("""
        {
          "text": "Meu comentário",
          "postId": %d
        }
        """.formatted(postId))
                .when()
                .post("/comment")
                .then()
                .statusCode(200)
                .body("contents", Matchers.equalTo("Meu comentário"));
    }

    @Test
    public void testGetCommentsFromPost() {
        Long postId =
                ((Number) given()
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .body("""
            {
              "text": "Post com comentários",
              "mediaUrl": null
            }
            """)
                        .when()
                        .post("/posts")
                        .then()
                        .extract()
                        .path("id"))
                        .longValue();

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get("/comment/" + postId)
                .then()
                .statusCode(200);
    }
}
