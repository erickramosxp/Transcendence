package com.ft.transcendence.editorial.api;

import com.ft.transcendence.editorial.app.EditorialHeadlinesService;
import com.ft.transcendence.editorial.app.NewsIngestionResult;
import com.ft.transcendence.editorial.app.NewsIngestionService;
import com.ft.transcendence.editorial.dto.HeadlinesResponse;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/editorial")
@Produces(MediaType.APPLICATION_JSON)
public class EditorialResource {

    @Inject
    NewsIngestionService newsIngestionService;

    @Inject
    EditorialHeadlinesService editorialHeadlinesService;

    @GET
    @Path("/headlines")
    @Authenticated
    public HeadlinesResponse headlines(@QueryParam("limit") @DefaultValue("5") Integer limit) {
        return editorialHeadlinesService.getHeadlines(limit);
    }

    @POST
    @Path("/ingest")
    public Response ingestNow() {
        NewsIngestionResult result = newsIngestionService.ingest();
        return Response.ok(result).build();
    }
}
