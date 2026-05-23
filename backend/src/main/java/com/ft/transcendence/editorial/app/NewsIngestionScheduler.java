package com.ft.transcendence.editorial.app;

import io.quarkus.logging.Log;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class NewsIngestionScheduler {

    @Inject
    NewsIngestionService newsIngestionService;

    @Scheduled(every = "15m", concurrentExecution = Scheduled.ConcurrentExecution.SKIP)
    void ingestTopHeadlines() {
        Log.debug("Starting scheduled news ingestion");
        newsIngestionService.ingest();
    }
}
