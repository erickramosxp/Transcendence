package com.ft.transcendence.base;

import com.ft.transcendence.user.UserTestContext;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.specification.RequestSpecification;
import org.junit.jupiter.api.BeforeEach;

import static io.restassured.RestAssured.given;

@QuarkusTest
public abstract class BaseApiTest {

    protected UserTestContext createUser() {
        String unique = String.valueOf(System.currentTimeMillis());

        String email = "test" + unique + "@example.com";
        String username = "user" + unique;

        // register
        long id = ((Number) given()
                .contentType("application/json")
                .body("""
                {
                  "email": "%s",
                  "username": "%s",
                  "name": "Test",
                  "password": "Test1234"
                }
                """.formatted(email, username))
                .post("/auth/register")
                .then()
                .statusCode(200)
                .extract()
                .path("user.id")).longValue();

        // login
        String token =
                given()
                        .contentType("application/json")
                        .body("""
                        {
                          "username": "%s",
                          "password": "Test1234"
                        }
                        """.formatted(email))
                        .post("/auth/login")
                        .then()
                        .statusCode(200)
                        .extract()
                        .path("token");

        UserTestContext ctx = new UserTestContext();
        ctx.id = id;
        ctx.name = "Test";
        ctx.email = email;
        ctx.username = username;
        ctx.token = token;
        return ctx;
    }

    protected void makeFriends(UserTestContext userA, UserTestContext userB) {
        io.restassured.response.Response response = given()
                .header("Authorization", "Bearer " + userA.token)
                .post("/friendships/request/" + userB.id)
                .then()
                .extract()
                .response();

        if (response.statusCode() == 409)
            return; // amizade já existe e já está aceita

        long friendshipId = ((Number) response.jsonPath().get("friendshipId")).longValue();

        given()
                .header("Authorization", "Bearer " + userB.token)
                .post("/friendships/accept/" + friendshipId)
                .then()
                .statusCode(200);
    }

    protected RequestSpecification auth(UserTestContext user) {
        return given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("application/json");
    }
}
