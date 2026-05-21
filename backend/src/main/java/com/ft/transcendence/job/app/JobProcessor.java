package com.ft.transcendence.job.app;

import com.ft.transcendence.common.utils.JsonService;
import com.ft.transcendence.job.JobPayloads.DeleteMediaPayload;
import com.ft.transcendence.job.JobPayloads.ProcessVideoPayload;
import com.ft.transcendence.job.domain.Job;
import com.ft.transcendence.job.handlers.DeletePostMediaHandler;
import com.ft.transcendence.job.handlers.ProcessVideoHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class JobProcessor {

    @Inject
    DeletePostMediaHandler deleteHandler;
    @Inject
    ProcessVideoHandler videoHandler;

    @Inject
    JsonService jsonService;


    public void process(Job job) throws Exception {

        switch (job.type) {

            case DELETE_S3_MEDIA:
                DeleteMediaPayload payloadDelete = jsonService.deserialize(job.payload, DeleteMediaPayload.class);
                deleteHandler.handle(payloadDelete);
                break;
            case PROCESS_VIDEO:
                ProcessVideoPayload payloadVideo = jsonService.deserialize(job.payload, ProcessVideoPayload.class);
                videoHandler.handle(payloadVideo);
                break;
            default:
                break;
        }
    }
}
