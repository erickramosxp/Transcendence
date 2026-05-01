package com.ft.transcendence.auth;

import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.user.UserTestContext;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.ValidatableResponse;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

@QuarkusTest
public class AuthResourceTest extends BaseApiTest {

    @Test
    public void testRegisterLoginAndMe() {
        UserTestContext user = createUser();

        auth(user)
                .when()
                .get("/me")
                .then()
                .statusCode(200)
                .body("email", Matchers.equalTo(user.email))
                .body("username", Matchers.equalTo(user.username));
    }

    @Test
    public void testRegisterDuplicateEmail() {

        String unique = String.valueOf(System.currentTimeMillis());
        String email = "dup-" + unique + "@example.com";

        given()
                .contentType("application/json")
                .body("""
                {
                  "email": "%s",
                  "username": "user1-%s",
                  "name": "User One",
                  "password": "123456"
                }
                """.formatted(email, unique))
                .post("/auth/register")
                .then()
                .statusCode(200);

        given()
                .contentType("application/json")
                .body("""
                {
                  "email": "%s",
                  "username": "user2-%s",
                  "name": "User Two",
                  "password": "123456"
                }
                """.formatted(email, unique))
                .post("/auth/register")
                .then()
                .statusCode(400);
    }

    @Test
    public void testRegisterDuplicateUsername() {

        String unique = String.valueOf(System.currentTimeMillis());
        String username = "dup-" + unique;

        given()
                .contentType("application/json")
                .body("""
                {
                  "email": "user1-%s@example.com",
                  "username": "%s",
                  "name": "User One",
                  "password": "123456"
                }
                """.formatted(unique, username))
                .post("/auth/register")
                .then()
                .statusCode(200);

        given()
                .contentType("application/json")
                .body("""
                {
                  "email": "user2-%s@example.com",
                  "username": "%s",
                  "name": "User Two",
                  "password": "123456"
                }
                """.formatted(unique, username))
                .post("/auth/register")
                .then()
                .statusCode(400);
    }

    @Test
    public void testLoginBlankCredentials() {
        given()
                .contentType("application/json")
                .body("""
                {
                  "username": "",
                  "password": ""
                }
                """)
                .when()
                .post("/auth/login")
                .then()
                .statusCode(401);
    }

    @Test
    public void testLoginUserNotFound() {
        given()
                .contentType("application/json")
                .body("""
                {
                  "username": "naoexiste@example.com",
                  "password": "123456"
                }
                """)
                .when()
                .post("/auth/login")
                .then()
                .statusCode(401);
    }

    @Test
    public void testLoginIncorrectPassword() {

        UserTestContext user = createUser();

        given()
                .contentType("application/json")
                .body("""
                {
                  "username": "%s",
                  "password": "errada"
                }
                """.formatted(user.email))
                .post("/auth/login")
                .then()
                .statusCode(401);
    }

    @Test
    public void testChangePasswordSuccess() {
        UserTestContext user = createUser();

        auth(user)
                .body("""
                {
                  "currentPassword": "123456",
                  "newPassword": "newpassword123"
                }
                """)
                .when()
                .patch("/auth/password")
                .then()
                .statusCode(204);

        given()
                .contentType("application/json")
                .body("""
                {
                  "username": "%s",
                  "password": "newpassword123"
                }
                """.formatted(user.email))
                .post("/auth/login")
                .then()
                .statusCode(200);
    }

    @Test
    public void testChangePasswordWrongCurrentPassword() {
        UserTestContext user = createUser();

        auth(user)
                .body("""
                {
                  "currentPassword": "wrongpassword",
                  "newPassword": "newpassword123"
                }
                """)
                .when()
                .patch("/auth/password")
                .then()
                .statusCode(401);
    }

    @Test
    public void testChangePasswordTooShort() {
        UserTestContext user = createUser();

        auth(user)
                .body("""
                {
                  "currentPassword": "123456",
                  "newPassword": "short"
                }
                """)
                .when()
                .patch("/auth/password")
                .then()
                .statusCode(400);
    }

    @Test
    public void testChangePasswordRequiresAuth() {
        given()
                .contentType("application/json")
                .body("""
                {
                  "currentPassword": "123456",
                  "newPassword": "newpassword123"
                }
                """)
                .when()
                .patch("/auth/password")
                .then()
                .statusCode(401);
    }
}
