package com.ft.transcendence.user;

import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.common.storage.StorageService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;

import java.io.File;
import java.util.Objects;

import static io.restassured.RestAssured.given;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@QuarkusTest
public class UserResourceTest extends BaseApiTest {

    @InjectMock
    StorageService storageService;

    @BeforeEach
    void setup() {
        when(storageService.upload(anyString(), ArgumentMatchers.any(), anyLong(), anyString()))
                .thenReturn("http://mock-url.com/file.jpg");
        Mockito.when(storageService.generateUrl(Mockito.anyString()))
                .thenReturn("http://mock-url.com/file.jpg");
    }

    @Test
    public void testGetUserPage() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .when()
                .get("/user/" + user.username)
                .then()
                .statusCode(200)
                .body("username", Matchers.equalTo(user.username));
    }

    @Test
    public void testUpdateUserProfile() {
        UserTestContext user = createUser();
        String newName = "Novo Nome";
        String newBio = "Minha bio";
        String newLocation = "Rio de Janeiro";
        String newWebsite = "https://meusite.com";

        given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("application/json")
                .body("""
                        {
                          "name": "%s",
                          "bio": "%s",
                          "location": "%s",
                          "websiteUrl": "%s"
                        }
                        """.formatted(newName, newBio, newLocation, newWebsite))
                .when()
                .patch("/user/profile")
                .then()
                .statusCode(200)
                .body("name", Matchers.equalTo(newName))
                .body("bio", Matchers.equalTo(newBio))
                .body("location", Matchers.equalTo(newLocation))
                .body("websiteUrl", Matchers.equalTo(newWebsite));
    }

    @Test
    public void testUpdateAvatarProfile() {
        UserTestContext user = createUser();
        File file = new File(
                Objects.requireNonNull(
                        getClass().getClassLoader().getResource("test-image.jpg")
                ).getFile()
        );

        given()
                .header("Authorization", "Bearer " + user.token)
                .multiPart("file", file)
                .when()
                .patch("/user/avatar")
                .then()
                .statusCode(200);
    }

    @Test
    public void testUploadAvatarWithoutFile() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .when()
                .patch("/user/avatar")
                .then()
                .statusCode(400);
    }

    @Test
    public void testUpdateBannerProfile() {
        UserTestContext user = createUser();
        String newBannerUrl = "https://imgs.search.brave.com/P2uLl-BVn49fNM_CZllrda4s90AJ0N6bpbAphp7e1zc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi90ZXN0/ZS1kZS1lc2NvbGhh/LW0tbHRpcGxhLWNs/b3NlLXVwLXVtLXB3/bmNpbC1lLWV4YW1l/LW0lQzMlQkFsdGlw/bGEtY29tLXRleHRv/LWRvLTE1NDQyMjA2/My5qcGc";

        given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("application/json")
                .body("""
                        {
                            "bannerUrl": "%s"
                        }
                        """.formatted(newBannerUrl))
                .when()
                .patch("/user/banner")
                .then()
                .statusCode(204);
    }

    @Test
    public void testGetPostsLikedByUser() {
        UserTestContext user = createUser();
        long postId = ((Number) given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("multipart/form-data")
                .multiPart("text", "Post de teste")
                .when()
                .post("/posts")
                .then()
                .statusCode(200)
                .extract()
                .path("id")).longValue();

        given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("application/json")
                .when()
                .post("/posts/" + postId + "/like")
                .then()
                .statusCode(200);

        given()
                .header("Authorization", "Bearer " + user.token)
                .when()
                .get("/user/{username}/likes", user.username)
                .then()
                .statusCode(200)
                .body("items.size()", Matchers.greaterThan(0));
    }

    @Test
    public void testGetUserPosts() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("multipart/form-data")
                .multiPart("text", "Post de teste")
                .when()
                .post("/posts")
                .then()
                .statusCode(200);

        given()
                .header("Authorization", "Bearer " + user.token)
                .when()
                .get("/user/{username}/posts", user.username)
                .then()
                .statusCode(200)
                .body("items.size()", Matchers.greaterThan(0));
    }

    @Test
    public void testGetUserMedia() {
        UserTestContext user = createUser();
        File file = new File(
                Objects.requireNonNull(
                        getClass().getClassLoader().getResource("test-image.jpg")
                ).getFile()
        );

        given()
                .header("Authorization", "Bearer " + user.token)
                .multiPart("file", file, "image/jpeg")
                .multiPart("previewFile", file, "image/jpeg")
                .multiPart("blurFile", file, "image/jpeg")
                .when()
                .post("/posts")
                .then()
                .statusCode(200);

        given()
                .header("Authorization", "Bearer " + user.token)
                .when()
                .get("/user/{username}/media", user.username)
                .then()
                .statusCode(200)
                .body("items.size()", Matchers.greaterThan(0));
    }

    @Test
    public void testFollowUser() {
        UserTestContext user1 = createUser();
        UserTestContext user2 = createUser();

        given()
                .header("Authorization", "Bearer " + user1.token)
                .contentType("application/json")
                .when()
                .post("/user/{username}/follow", user2.username)
                .then()
                .statusCode(200);
    }

    @Test
    public void testUnfollowUser() {
        UserTestContext user1 = createUser();
        UserTestContext user2 = createUser();

        given()
                .header("Authorization", "Bearer " + user1.token)
                .contentType("application/json")
                .post("/user/{username}/follow", user2.username);

        given()
                .header("Authorization", "Bearer " + user1.token)
                .contentType("application/json")
                .when()
                .post("/user/{username}/unfollow", user2.username)
                .then()
                .statusCode(200);
    }

    @Test
    public void testGetFollowers() {
        UserTestContext user1 = createUser();
        UserTestContext user2 = createUser();

        given()
                .header("Authorization", "Bearer " + user2.token)
                .contentType("application/json")
                .post("/user/{username}/follow", user1.username);

        given()
                .header("Authorization", "Bearer " + user1.token)
                .when()
                .get("/user/{username}/followers", user1.username)
                .then()
                .statusCode(200)
                .body("items.size()", Matchers.greaterThan(0));
    }

    @Test
    public void testGetFollowing() {
        UserTestContext user1 = createUser();
        UserTestContext user2 = createUser();

        given()
                .header("Authorization", "Bearer " + user1.token)
                .contentType("application/json")
                .post("/user/{username}/follow", user2.username);

        given()
                .header("Authorization", "Bearer " + user1.token)
                .contentType("application/json")
                .when()
                .get("/user/{username}/following", user1.username)
                .then()
                .statusCode(200)
                .body("items.size()", Matchers.greaterThan(0));
    }

    @Test
    public void testGetAuthTypeLocalUser() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .when()
                .get("/user/me/auth-type")
                .then()
                .statusCode(200)
                .body("providers", Matchers.hasItem("LOCAL"));
    }

    @Test
    public void testGetAuthTypeRequiresAuth() {
        given()
                .when()
                .get("/user/me/auth-type")
                .then()
                .statusCode(401);
    }

    @Test
    public void testAdvancedSearchWithDefaultParams() {
        UserTestContext user1 = createUser();
        UserTestContext user2 = createUser(); // Cria um segundo usuário para garantir que a busca retorne algo

        given()
                .header("Authorization", "Bearer " + user1.token)
                .when()
                // Assumindo que a classe Resource base tenha @Path("/user")
                .get("/user/search")
                .then()
                .statusCode(200)
                .body("items", Matchers.notNullValue())
                .body("page", Matchers.equalTo(0))
                .body("size", Matchers.equalTo(6)); // Tamanho default configurado na rota
    }

    @Test
    public void testAdvancedSearchWithValidParams() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .queryParam("page", 0)
                .queryParam("size", 10)
                .queryParam("q", "Maria")
                .queryParam("location", "Rio de Janeiro")
                .queryParam("language", "pt-BR")
                .queryParam("sortBy", "name")
                .queryParam("sortDir", "asc")
                .when()
                .get("/user/search")
                .then()
                .statusCode(200)
                .body("items", Matchers.notNullValue())
                .body("size", Matchers.equalTo(10));
    }

    @Test
    public void testAdvancedSearchInvalidLanguageValidation() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .queryParam("language", "fr-FR") // Idioma fora do regex ^(pt-BR|en-US|es-ES|all)$
                .when()
                .get("/user/search")
                .then()
                .statusCode(400); // Espera um Bad Request devido à falha de validação do Jakarta
    }

    @Test
    public void testAdvancedSearchInvalidPagination() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .queryParam("size", 200)
                .when()
                .get("/user/search")
                .then()
                .statusCode(400);

        given()
                .header("Authorization", "Bearer " + user.token)
                .queryParam("page", -1)
                .when()
                .get("/user/search")
                .then()
                .statusCode(400);
    }

    @Test
    public void testAdvancedSearchRequiresAuth() {
        given()
                .when()
                .get("/user/search")
                .then()
                .statusCode(401);
    }
}
