package com.ft.transcendence.job.app;

import com.ft.transcendence.common.utils.JsonService;
import com.ft.transcendence.job.JobPayloads.DeletePostMediaPayload;
import com.ft.transcendence.job.domain.Job;
import com.ft.transcendence.job.enums.JobStatus;
import com.ft.transcendence.job.enums.JobType;
import com.ft.transcendence.post.domain.Post;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.OffsetDateTime;


@ApplicationScoped
public class JobService {

    @Inject
    JsonService jsonService;

    @Transactional
    public void createDeletePostMediaJob(long postId, long userId) {

        Post post = Post.findById(postId);

        if (post == null) {
            throw new IllegalStateException("Post not founded on create delete media job");
        }

        if (post.mediaUrl == null || post.mediaUrl.isBlank()) {
            return;
        }

        DeletePostMediaPayload payload = new DeletePostMediaPayload();
        payload.postId = postId;
        payload.mediaUrl = post.mediaUrl;
        payload.requestedByUserId = userId;

        String payloadJson = jsonService.serialize(payload);

        Job job = new Job();
        job.type = JobType.DELETE_POST_MEDIA;
        job.status = JobStatus.PENDING;
        job.payload = payloadJson;
        job.attempts = 0;
        job.maxAttempts = 5;
        job.availableAt = OffsetDateTime.now();
        job.createdAt =  OffsetDateTime.now();

        job.persist();
    }
}
