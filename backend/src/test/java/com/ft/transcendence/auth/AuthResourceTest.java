package com.ft.transcendence.auth;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.ValidatableResponse;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

@QuarkusTest
public class AuthResourceTest {

    @Test
    public void testRegisterLoginAndMe() {
        // email/username únicos por teste
        String email = "alice-ci@example.com";
        String username = "alice-ci";

        // 1) /auth/register
        ValidatableResponse registerResp =
                given()
                        .contentType("application/json")
                        .body("""
                    {
                      "email": "%s",
                      "username": "%s",
                      "name": "Alice CI",
                      "password": "123456"
                    }
                    """.formatted(email, username))
                        .when()
                        .post("/auth/register")
                        .then()
                        .statusCode(200)
                        .body("token", Matchers.notNullValue())
                        .body("user.email", Matchers.equalTo(email))
                        .body("user.username", Matchers.equalTo(username));

        // 2) /auth/login com email
        ValidatableResponse loginResp =
                given()
                        .contentType("application/json")
                        .body("""
                    {
                      "username": "%s",
                      "password": "123456"
                    }
                    """.formatted(email))
                        .when()
                        .post("/auth/login")
                        .then()
                        .statusCode(200)
                        .body("token", Matchers.notNullValue())
                        .body("user.email", Matchers.equalTo(email));

        String token = loginResp.extract().path("token");

        // 3) /me
        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get("/me")
                .then()
                .statusCode(200)
                .body("email", Matchers.equalTo(email));
    }

    @Test
    public void testRegisterDuplicateEmail() {
        String email = "dup-email@example.com";

        // 1º registro OK
        given()
                .contentType("application/json")
                .body("""
                {
                  "email": "%s",
                  "username": "dup1",
                  "name": "Dup One",
                  "password": "123456"
                }
                """.formatted(email))
                .when()
                .post("/auth/register")
                .then()
                .statusCode(200);

        // 2º com mesmo email deve falhar
        given()
                .contentType("application/json")
                .body("""
                {
                  "email": "%s",
                  "username": "dup2",
                  "name": "Dup Two",
                  "password": "123456"
                }
                """.formatted(email))
                .when()
                .post("/auth/register")
                .then()
                .statusCode(400); // BadRequestException -> 400
    }

    @Test
    public void testRegisterDuplicateUsername() {
        String username = "dup-username";

        // 1º registro OK
        given()
                .contentType("application/json")
                .body("""
                {
                  "email": "user1-%s@example.com",
                  "username": "%s",
                  "name": "User One",
                  "password": "123456"
                }
                """.formatted(username, username))
                .when()
                .post("/auth/register")
                .then()
                .statusCode(200);

        // 2º com mesmo username deve falhar
        given()
                .contentType("application/json")
                .body("""
                {
                  "email": "user2-%s@example.com",
                  "username": "%s",
                  "name": "User Two",
                  "password": "123456"
                }
                """.formatted(username, username))
                .when()
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
        String email = "login-incorreto@example.com";

        // cria usuário
        given()
                .contentType("application/json")
                .body("""
                {
                  "email": "%s",
                  "username": "login-incorreto",
                  "name": "Login Incorreto",
                  "password": "123456"
                }
                """.formatted(email))
                .when()
                .post("/auth/register")
                .then()
                .statusCode(200);

        // tenta logar com senha errada
        given()
                .contentType("application/json")
                .body("""
                {
                  "username": "%s",
                  "password": "errada"
                }
                """.formatted(email))
                .when()
                .post("/auth/login")
                .then()
                .statusCode(401);
    }

}
