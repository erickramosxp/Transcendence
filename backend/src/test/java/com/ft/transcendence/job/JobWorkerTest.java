package com.ft.transcendence.job;

import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.job.app.JobWorker;
import com.ft.transcendence.job.domain.Job;
import com.ft.transcendence.job.enums.JobStatus;
import com.ft.transcendence.job.enums.JobType;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.user.UserTestContext;
import com.ft.transcendence.user.domain.User;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;

import java.io.File;
import java.time.OffsetDateTime;

import static io.restassured.RestAssured.given;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@QuarkusTest
@DisplayName("Job Works Tests")
public class JobWorkerTest extends BaseApiTest {

    @Inject
    JobWorker jobWorker;

    @InjectMock
    StorageService storageService;

    @Inject
    EntityManager entityManager;

    @BeforeEach
    void setup() {
        Mockito.when(storageService.upload(anyString(), ArgumentMatchers.any(), anyLong(), anyString()))
                .thenReturn("posts/1/test-file.jpg");
        Mockito.when(storageService.generateUrl(Mockito.anyString()))
                .thenReturn("http://mock-url.com/posts/1/test-file.jpg");
    }

    @Test
    @DisplayName("Should process delete post media job and remove mediaUrl from post")
    void testWorkerProcessesDeletePostMediaJob() {
        UserTestContext user = createUser();

        Long postId =
                ((Number) given()
                        .header("Authorization", "Bearer " + user.token)
                        .contentType("multipart/form-data")
                        .multiPart("file", new File("src/test/resources/test-image.jpg"))
                        .multiPart("text", "Post com imagem")
                        .when()
                        .post("/posts")
                        .then()
                        .statusCode(200)
                        .extract()
                        .path("id"))
                        .longValue();

        Post post = Post.findById(postId);
        String path = post.mediaUrl;

        given()
                .header("Authorization", "Bearer " + user.token)
                .when()
                .delete("/posts/" + postId)
                .then()
                .statusCode(204);


        Mockito.reset(storageService);
        Mockito.doNothing().when(storageService).delete(path);

        jobWorker.processJobs();

        entityManager.clear();

        Mockito.verify(storageService, Mockito.times(1)).delete(path);

        Job job = Job.find("type = ?1 order by id desc", JobType.DELETE_POST_MEDIA).firstResult();
        Post updatedPost = Post.findById(postId);

        Assertions.assertEquals(JobStatus.DONE, job.status);
        Assertions.assertNotNull(job.finishedAt);
        Assertions.assertNull(job.lastError);
        Assertions.assertNull(updatedPost.mediaUrl);
    }

    @Test
    @DisplayName("Should retry job when storage delete fails")
    void testWorkerRetriesWhenDeleteFails() {

        UserTestContext user = createUser();

        Long postId =
                ((Number) given()
                        .header("Authorization", "Bearer " + user.token)
                        .contentType("multipart/form-data")
                        .multiPart("file", new File("src/test/resources/test-image.jpg"))
                        .multiPart("text", "Post com imagem")
                        .when()
                        .post("/posts")
                        .then()
                        .statusCode(200)
                        .extract()
                        .path("id"))
                        .longValue();

        Post post = Post.findById(postId);
        String path = post.mediaUrl;

        given()
                .header("Authorization", "Bearer " + user.token)
                .when()
                .delete("/posts/" + postId)
                .then()
                .statusCode(204);

        Mockito.reset(storageService);
        Mockito.doThrow(new RuntimeException("storage error"))
                .when(storageService).delete(path);

        jobWorker.processJobs();
        entityManager.clear();

        Job job = Job.find("type = ?1 order by id desc", JobType.DELETE_POST_MEDIA).firstResult();

        Assertions.assertEquals(JobStatus.PENDING, job.status);
        Assertions.assertEquals(1, job.attempts);
        Assertions.assertNotNull(job.lastError);
        Assertions.assertNotNull(job.availableAt);
    }

    @Test
    @DisplayName("Should mark job as failed after max attempts")
    void testWorkerMarksJobAsFailedAfterMaxAttempts() {
        UserTestContext user = createUser();

        Long postId =
                ((Number) given()
                        .header("Authorization", "Bearer " + user.token)
                        .contentType("multipart/form-data")
                        .multiPart("file", new File("src/test/resources/test-image.jpg"))
                        .multiPart("text", "Post com imagem")
                        .when()
                        .post("/posts")
                        .then()
                        .statusCode(200)
                        .extract()
                        .path("id"))
                        .longValue();

        Post post = Post.findById(postId);
        String path = post.mediaUrl;

        given()
                .header("Authorization", "Bearer " + user.token)
                .when()
                .delete("/posts/" + postId)
                .then()
                .statusCode(204);

        Mockito.doThrow(new RuntimeException("storage error"))
                .when(storageService).delete(path);

        for (int i = 0; i < 5; i++) {
            jobWorker.processJobs();

            entityManager.clear();


            QuarkusTransaction.requiringNew().run(() -> {
                Job job = Job.find("type = ?1 order by id desc", JobType.DELETE_POST_MEDIA).firstResult();
                if (job.status == JobStatus.PENDING) {
                    job.availableAt = OffsetDateTime.now();
                }
            });
        }

        entityManager.clear();

        Job job = Job.find("type = ?1 order by id desc", JobType.DELETE_POST_MEDIA).firstResult();

        Assertions.assertEquals(JobStatus.FAILED, job.status);
        Assertions.assertEquals(5, job.attempts);
        Assertions.assertNotNull(job.finishedAt);
        Assertions.assertNotNull(job.lastError);
    }
}
