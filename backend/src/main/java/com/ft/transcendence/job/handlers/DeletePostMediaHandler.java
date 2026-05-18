package com.ft.transcendence.job.handlers;

import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.job.JobPayloads.DeleteMediaPayload;
import io.quarkus.logging.Log;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DeletePostMediaHandler {

    @Inject
    StorageService storageService;

    @Transactional
    public void handle(DeleteMediaPayload payload) {

        try {

            if (payload.pathsToDelete != null && !payload.pathsToDelete.isEmpty()) {

                for (String path : payload.pathsToDelete) {
                    storageService.delete(path);
                }
            }

        } catch (Exception e) {
            Log.error("Error processing payload", e);
            throw new RuntimeException(e);
        }
    }
}
