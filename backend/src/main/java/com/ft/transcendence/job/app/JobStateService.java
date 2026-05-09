package com.ft.transcendence.job.app;

import com.ft.transcendence.job.domain.Job;
import com.ft.transcendence.job.enums.JobStatus;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.time.OffsetDateTime;

@ApplicationScoped
public class JobStateService {

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void markRetry(Long jobId, String error, int attempts, OffsetDateTime nextAttemptAt) {
        Job job = Job.findById(jobId);
        job.attempts = attempts;
        job.lastError = error;
        job.status = JobStatus.PENDING;
        job.availableAt = nextAttemptAt;
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void markFailed(Long jobId, String error, int attempts) {
        Job job = Job.findById(jobId);
        job.attempts = attempts;
        job.lastError = error;
        job.status = JobStatus.FAILED;
        job.finishedAt = OffsetDateTime.now();
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void markDone(Long jobId) {
        Job job = Job.findById(jobId);
        job.status = JobStatus.DONE;
        job.finishedAt = OffsetDateTime.now();
        job.lastError = null;
    }
}
