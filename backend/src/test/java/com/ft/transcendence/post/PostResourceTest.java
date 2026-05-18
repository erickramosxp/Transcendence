package com.ft.transcendence.post;

import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.job.domain.Job;
import com.ft.transcendence.job.enums.JobStatus;
import com.ft.transcendence.job.enums.JobType;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.user.UserTestContext;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import io.restassured.config.HttpClientConfig;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static io.restassured.RestAssured.given;
import static org.codehaus.plexus.PlexusTestCase.getTestFile;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@QuarkusTest
@DisplayName("Post Integration Tests")
public class PostResourceTest extends BaseApiTest {

    @InjectMock
    StorageService storageService;

    @BeforeEach
    void setup() {

        when(storageService.upload(anyString(), ArgumentMatchers.any(), anyLong(), anyString())).
                thenReturn("http://mock-url.com/file.jpg");

        Mockito.when(storageService.generateUrl(Mockito.anyString()))
                .thenReturn("http://mock-url.com/file.jpg");
    }

    @Test
    public void testCreatePost() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("multipart/form-data")
                .multiPart("text", "Post de teste")
                .when()
                .post("/posts")
                .then()
                .statusCode(200)
                .body("contents", Matchers.equalTo("Post de teste"));
    }
    @Test
    @DisplayName("Should return error 200 when upload a valid image")
    public void testUploadValidImage() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .multiPart("file", new File("src/test/resources/test-image.jpg"),"image/jpeg")
                .multiPart("previewFile", new File("src/test/resources/test-image.jpg"), "image/jpeg")
                .multiPart("blurFile", new File("src/test/resources/test-image.jpg"), "image/jpeg")
                .multiPart("text", "Imagem valida")
                .multiPart("width", 1080)
                .multiPart("height", 1080)
                .when()
                .post("/posts")
                .then()
                .statusCode(200);
    }

    @Test
    @DisplayName("Should return error 200 when upload a valid video")
    public void testUploadValidVideo() {
        UserTestContext user = createUser();

        var videoResource = getClass().getClassLoader().getResource("test-video.mp4");

        assertNotNull(videoResource, "O vídeo de teste não foi encontrado no src/test/resources");

        File videoFile = new File(videoResource.getFile());

        given()
                .header("Authorization", "Bearer " + user.token)
                .multiPart("file", videoFile)
                .multiPart("text", "Video valido")
                .when()
                .post("/posts")
                .then()
                .statusCode(200);
    }

    @Test
    @DisplayName("Should return error 400 when trying upload a corrupted image")
    public void testUploadCorruptedImage() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .multiPart("file", new File("src/test/resources/corrupted.jpg"), "image/jpeg")
                .multiPart("previewFile", new File("src/test/resources/corrupted.jpg"), "image/jpeg")
                .multiPart("blurFile", new File("src/test/resources/corrupted.jpg"), "image/jpeg")
                .multiPart("text", "Imagem inválida")
                .when()
                .post("/posts")
                .then()
                .statusCode(422);
    }

    @Test
    @DisplayName("Should return error 400 when trying upload a fake image")
    public void testUploadFakeImage() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .multiPart("file", new File("src/test/resources/fake.jpg"), "image/jpeg")
                .multiPart("previewFile", new File("src/test/resources/fake.jpg"), "image/jpeg")
                .multiPart("blurFile", new File("src/test/resources/fake.jpg"), "image/jpeg")
                .multiPart("text", "Imagem fake")
                .when()
                .post("/posts")
                .then()
                .statusCode(415);
    }

    @Test
    @DisplayName("Should return error 400 when trying upload a currupted video")
    public void testUploadCorruptedVideo() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .multiPart("file", new File("src/test/resources/corrupted.mp4"), "video/mp4")
                .multiPart("text", "Currupted video")
                .when()
                .post("/posts")
                .then()
                .statusCode(422);
    }

    @Test
    @DisplayName("Should return error 400 when trying upload a fake video")
    public void testUploadFakeVideo() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .multiPart("file", new File("src/test/resources/fake-video.mp4"), "video/mp4")
                .multiPart("text", "Fake video")
                .when()
                .post("/posts")
                .then()
                .statusCode(415);
    }

    @Test
    @DisplayName("Should return 400 when uploading an invalid file type")
    public void testUploadInvalidType() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .multiPart("file", getTestFile("src/test/resources/file.txt"))
                .multiPart("text", "Invalid file")
                .when()
                .post("/posts")
                .then()
                .statusCode(415);
    }

    @Test
    public void testInvalidVideoTooLarge() throws IOException {

        UserTestContext user = createUser();
        Path resourcePath = Paths.get("src/test/resources/test-video.mp4");
        byte[] originalVideo = Files.readAllBytes(resourcePath);

        byte[] inflatedVideo = new byte[1024 * 1024 * 21];
        System.arraycopy(originalVideo, 0, inflatedVideo, 0, originalVideo.length);

        given()
                .header("Authorization", "Bearer " + user.token)
                .multiPart("file", "big-video.mp4", inflatedVideo, "video/mp4")
                .when()
                .post("/posts")
                .then()
                .statusCode(413);
    }

    @Test
    @DisplayName("Should block upload of a valid image that exceeds 5MB")
    public void testInvalidImageTooLarge() throws IOException {

        UserTestContext user = createUser();
        Path path = Paths.get("src/test/resources/test-image.jpg");
        byte[] realImageBytes = Files.readAllBytes(path);

        int mbs = (int) (1024 * 1024 * 5.1);
        byte[] inflatedImage = new byte[mbs];
        System.arraycopy(realImageBytes, 0, inflatedImage, 0, realImageBytes.length);

        given()
                .header("Authorization", "Bearer " + user.token)
                .multiPart("file", "too-large-imagem.jpg", inflatedImage, "image/jpeg")
                .multiPart("previewFile", "too-large-imagem.jpg", inflatedImage, "image/jpeg")
                .multiPart("blurFile", "too-large-imagem.jpg", inflatedImage, "image/jpeg")
                .when()
                .post("/posts")
                .then()
                .statusCode(413);
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
                        .contentType("multipart/form-data")
                        .multiPart("text", "Post de teste")
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

    @Test
    @DisplayName("Should soft delete post and create delete media job")
    void testDeletePostCreatesDeleteMediaJob() {
        UserTestContext user = createUser();

        Long postId =
                ((Number) given()
                        .header("Authorization", "Bearer " + user.token)
                        .contentType("multipart/form-data")
                        .multiPart("file", new File("src/test/resources/test-image.jpg"), "image/jpeg")
                        .multiPart("previewFile", new File("src/test/resources/test-image.jpg"), "image/jpeg")
                        .multiPart("blurFile", new File("src/test/resources/test-image.jpg"), "image/jpeg")
                        .multiPart("text", "Post com imagem")
                        .when()
                        .post("/posts")
                        .then()
                        .statusCode(200)
                        .extract()
                        .path("id"))
                        .longValue();

        given()
                .header("Authorization", "Bearer " + user.token)
                .when()
                .delete("/posts/" + postId)
                .then()
                .statusCode(204);

        Post post = Post.findById(postId);
        assertNotNull(post.deletedAt);

        Job job = Job.find("type = ?1 and status = ?2", JobType.DELETE_S3_MEDIA, JobStatus.PENDING)
                .firstResult();

        assertNotNull(job);
    }

    @Test
    @DisplayName("Should not delete media synchronously on post delete")
    void testDeletePostDoesNotCallStorageDirectly() {
        UserTestContext user = createUser();

        Long postId =
                ((Number) given()
                        .header("Authorization", "Bearer " + user.token)
                        .contentType("multipart/form-data")
                        .multiPart("file", new File("src/test/resources/test-image.jpg"), "image/jpeg")
                        .multiPart("previewFile", new File("src/test/resources/test-image.jpg"), "image/jpeg")
                        .multiPart("blurFile", new File("src/test/resources/test-image.jpg"), "image/jpeg")
                        .multiPart("text", "Post com imagem")
                        .when()
                        .post("/posts")
                        .then()
                        .statusCode(200)
                        .extract()
                        .path("id"))
                        .longValue();

        given()
                .header("Authorization", "Bearer " + user.token)
                .when()
                .delete("/posts/" + postId)
                .then()
                .statusCode(204);

        Mockito.verify(storageService, Mockito.never()).delete(Mockito.anyString());
    }
}
