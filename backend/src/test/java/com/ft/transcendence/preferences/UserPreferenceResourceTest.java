package com.ft.transcendence.preferences;

import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.user.UserTestContext;
import io.quarkus.test.junit.QuarkusTest;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

@QuarkusTest
public class UserPreferenceResourceTest extends BaseApiTest {
    @Test
    public void testGetUserPreferences() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .when()
                .get("/preferences")
                .then()
                .statusCode(200)
                .body("theme", Matchers.equalTo("light"))
                .body("language", Matchers.equalTo("pt-BR"));
    }

    @Test
    public void testUpdateLanguagePreference() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("application/json")
                .body("""
                        {
                          "language": "en-US"
                        }
                        """)
                .when()
                .patch("/preferences/language")
                .then()
                .statusCode(200)
                .body("language", Matchers.equalTo("en-US"));

        given()
                .header("Authorization", "Bearer " + user.token)
                .when()
                .get("/preferences")
                .then()
                .statusCode(200)
                .body("language", Matchers.equalTo("en-US"));
    }

    @Test
    public void testUpdateThemePreference() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("application/json")
                .body("""
                        {
                          "theme": "dark"
                        }
                        """)
                .when()
                .patch("/preferences/theme")
                .then()
                .statusCode(200)
                .body("theme", Matchers.equalTo("dark"));

        given()
                .header("Authorization", "Bearer " + user.token)
                .when()
                .get("/preferences")
                .then()
                .statusCode(200)
                .body("theme", Matchers.equalTo("dark"));
    }

    @Test
    public void testUpdateBothPreferences() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("application/json")
                .body("""
                        {
                          "theme": "dark",
                          "language": "en-US"
                        }
                        """)
                .when()
                .put("/preferences")
                .then()
                .statusCode(200)
                .body("theme", Matchers.equalTo("dark"))
                .body("language", Matchers.equalTo("en-US"));

        given()
                .header("Authorization", "Bearer " + user.token)
                .when()
                .get("/preferences")
                .then()
                .statusCode(200)
                .body("theme", Matchers.equalTo("dark"))
                .body("language", Matchers.equalTo("en-US"));
    }

    @Test
    public void testUpdateLanguageWithBlankValueShouldFail() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("application/json")
                .body("""
                        {
                          "language": ""
                        }
                        """)
                .when()
                .patch("/preferences/language")
                .then()
                .statusCode(400);
    }

    @Test
    public void testUpdateThemeWithBlankValueShouldFail() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("application/json")
                .body("""
                        {
                          "theme": ""
                        }
                        """)
                .when()
                .patch("/preferences/theme")
                .then()
                .statusCode(400);
    }

    @Test
    public void testUpdateBothWithBlankValuesShouldFail() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("application/json")
                .body("""
                        {
                          "theme": "",
                          "language": ""
                        }
                        """)
                .when()
                .put("/preferences")
                .then()
                .statusCode(400);
    }
}
