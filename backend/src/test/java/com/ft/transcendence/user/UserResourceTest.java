package com.ft.transcendence.user;

import com.ft.transcendence.base.BaseApiTest;
import io.quarkus.test.junit.QuarkusTest;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

@QuarkusTest
public class UserResourceTest extends BaseApiTest {

    @Test
    public void testGetUserPage() {

        String username = "user" + System.currentTimeMillis();
        String email = "test" + System.currentTimeMillis() + "@example.com";

        // cria usuário
        given()
                .contentType("application/json")
                .body("""
        {
          "email": "%s",
          "username": "%s",
          "name": "Post Test",
          "password": "123456"
        }
        """.formatted(email, username))
                .post("/auth/register")
                .then()
                .statusCode(200);

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get("/user/" + username)
                .then()
                .statusCode(200)
                .body("username", Matchers.equalTo(username));
    }
}
