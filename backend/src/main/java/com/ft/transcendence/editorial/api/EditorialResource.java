package com.ft.transcendence.editorial.api;

import com.ft.transcendence.editorial.app.NewsIngestionResult;
import com.ft.transcendence.editorial.app.NewsIngestionService;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/editorial")
@Produces(MediaType.APPLICATION_JSON)
public class EditorialResource {

    @Inject
    NewsIngestionService newsIngestionService;

    @POST
    @Path("/ingest")
    public Response ingestNow() {
        NewsIngestionResult result = newsIngestionService.ingest();
        return Response.ok(result).build();
    }
}
