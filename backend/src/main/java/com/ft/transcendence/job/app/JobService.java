package com.ft.transcendence.job.app;

import com.ft.transcendence.common.utils.JsonService;
import com.ft.transcendence.job.JobPayloads.DeleteMediaPayload;
import com.ft.transcendence.job.JobPayloads.ProcessVideoPayload;
import com.ft.transcendence.job.domain.Job;
import com.ft.transcendence.job.enums.JobStatus;
import com.ft.transcendence.job.enums.JobType;
import com.ft.transcendence.media.domain.Media;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.OffsetDateTime;
import java.util.List;


@ApplicationScoped
public class JobService {

    @Inject
    JsonService jsonService;

    @Transactional
    public void createDeleteMediaJob(List<String> pathsToDelete, long userId) {

        if (pathsToDelete == null || pathsToDelete.isEmpty()) {
            return;
        }

        DeleteMediaPayload payload = new DeleteMediaPayload();
        payload.pathsToDelete = pathsToDelete;
        payload.requestedByUserId = userId;

        String payloadJson = jsonService.serialize(payload);

        Job job = new Job();
        job.type = JobType.DELETE_S3_MEDIA;
        job.status = JobStatus.PENDING;
        job.payload = payloadJson;
        job.attempts = 0;
        job.maxAttempts = 5;
        job.availableAt = OffsetDateTime.now();
        job.createdAt =  OffsetDateTime.now();

        job.persist();
    }

    @Transactional
    public void createProcessVideoJob(Media media,  long userId) {

        if (media == null || media.id == null) {
            return;
        }

        ProcessVideoPayload payload = new ProcessVideoPayload();
        payload.mediaId = media.id;
        payload.path = media.pathOriginal;
        payload.requestedByUserId = userId;

        String payloadJson = jsonService.serialize(payload);

        Job job = new Job();
        job.type = JobType.PROCESS_VIDEO;
        job.status = JobStatus.PENDING;
        job.payload = payloadJson;
        job.attempts = 0;
        job.maxAttempts = 5;
        job.availableAt = OffsetDateTime.now();
        job.createdAt = OffsetDateTime.now();

        job.persist();
    }
}
