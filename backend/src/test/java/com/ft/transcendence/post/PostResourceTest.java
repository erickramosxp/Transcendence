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
                        .contentType("application/json")
                        .body("""
                {
                  "text": null,
                  "mediaUrl": "https://imgs.search.brave.com/P2uLl-BVn49fNM_CZllrda4s90AJ0N6bpbAphp7e1zc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi90ZXN0/ZS1kZS1lc2NvbGhh/LW0tbHRpcGxhLWNs/b3NlLXVwLXVtLXB3/bmNpbC1lLWV4YW1l/LW0lQzMlQkFsdGlw/bGEtY29tLXRleHRv/LWRvLTE1NDQyMjA2/My5qcGc"
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
                .header("Authorization", "Bearer " + user.token)
                .contentType("application/json")
                .when()
                .post("/posts/" + postId + "/like")
                .then()
                .statusCode(200);
    }
}
