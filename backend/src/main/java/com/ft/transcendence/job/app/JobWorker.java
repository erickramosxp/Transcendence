package com.ft.transcendence.job.app;

import com.ft.transcendence.job.domain.Job;
import com.ft.transcendence.job.enums.JobStatus;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

// faz parte da aplicação, adicionar notação @
@ApplicationScoped
public class JobWorker {

    @Inject
    JobProcessor jobProcessor;

    @Inject
    JobStateService stateService;


    // colocar Scheduled aqui
    @Scheduled(every = "10s", concurrentExecution = Scheduled.ConcurrentExecution.SKIP)
    @Transactional
    public void processJobs() {

        // lógica aqui
        // buscar os jobs
        List<Job> jobs = Job.list(
                "status = ?1 and availableAt <= ?2 order by createdAt",
                JobStatus.PENDING,
                OffsetDateTime.now()
        );
        // jogar para o dispacher

        for (Job job : jobs) {
            try {
                job.status = JobStatus.PROCESSING;
                job.processingStartedAt = OffsetDateTime.now();

                jobProcessor.process(job);

                job.status = JobStatus.DONE;
                job.finishedAt = OffsetDateTime.now();
                job.lastError = null;
            } catch (Exception e) {

                int nextAttempts = job.attempts + 1;
                if (nextAttempts >= job.maxAttempts) {
                    stateService.markFailed(job.id, e.getMessage(), nextAttempts);
                } else {
                    stateService.markRetry(
                            job.id,
                            e.getMessage(),
                            nextAttempts,
                            OffsetDateTime.now().plusSeconds(calculateBackoff(nextAttempts))
                    );
                }
            }
        }
    }

    private long calculateBackoff(int attempts) {
        return Math.min(300, attempts * 30L);
    }
}
