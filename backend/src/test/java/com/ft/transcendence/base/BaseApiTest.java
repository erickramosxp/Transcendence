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
                  "password": "123456"
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
                          "password": "123456"
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

    protected RequestSpecification auth(UserTestContext user) {
        return given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("application/json");
    }
}
