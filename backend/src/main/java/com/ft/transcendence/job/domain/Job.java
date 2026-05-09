package com.ft.transcendence.job.domain;


import com.ft.transcendence.job.enums.JobStatus;
import com.ft.transcendence.job.enums.JobType;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "jobs")
public class Job extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public JobType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public JobStatus status;

    @Column(nullable = false, columnDefinition = "TEXT")
    public String payload;

    @Column(nullable = false)
    public int attempts;

    @Column(name = "max_attempts", nullable = false)
    public int maxAttempts;

    @Column(name = "last_error", columnDefinition = "TEXT")
    public String lastError;

    @Column(name = "available_at", nullable = false)
    public OffsetDateTime availableAt;

    @Column(name = "processing_started_at")
    public OffsetDateTime processingStartedAt;

    @Column(name = "finished_at")
    public OffsetDateTime finishedAt;

    @Column(name = "created_at", updatable = false)
    public OffsetDateTime createdAt;

    @Column(name = "updated_at")
    public OffsetDateTime updatedAt;

}
