package com.ft.transcendence.job.app;

import com.ft.transcendence.common.utils.JsonService;
import com.ft.transcendence.job.JobPayloads.DeletePostMediaPayload;
import com.ft.transcendence.job.domain.Job;
import com.ft.transcendence.job.handlers.DeletePostMediaHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class JobProcessor {

    @Inject
    DeletePostMediaHandler deleteHandler;

    @Inject
    JsonService jsonService;


    public void process(Job job) {

        switch (job.type) {

            case DELETE_POST_MEDIA:
                DeletePostMediaPayload payload = jsonService.deserialize(job.payload, DeletePostMediaPayload.class);
                deleteHandler.handle(payload);
                break;
            default:
                break;
        }
    }
}
