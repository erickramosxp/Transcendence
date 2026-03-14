package com.ft.transcendence.base;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.BeforeEach;

import static io.restassured.RestAssured.given;

@QuarkusTest
public abstract class BaseApiTest {

    protected String token;

    @BeforeEach
    void setupUser() {

        String unique = String.valueOf(System.currentTimeMillis());

        String email = "test" + unique + "@example.com";
        String username = "user" + unique;

        given()
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
                .statusCode(200);

        token =
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
    }
}
