package com.ft.transcendence.job.handlers;

import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.job.JobPayloads.DeletePostMediaPayload;
import com.ft.transcendence.post.domain.Post;
import io.quarkus.logging.Log;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DeletePostMediaHandler {

    @Inject
    StorageService storageService;

    @Transactional
    public void handle(DeletePostMediaPayload payload) {

        try {

            Long postId = payload.postId;
            String mediaUrl = payload.mediaUrl;

            Post post = Post.findById(postId);

            storageService.delete(mediaUrl);

            if (post != null && mediaUrl.equals(post.mediaUrl)) {
                post.mediaUrl = null;
                Log.infof("mediaUrl removed from post %d after deletion from storage", postId);
            }

        } catch (Exception e) {
            Log.error("Error processing payload", e);
            throw new RuntimeException(e);
        }
    }
}
