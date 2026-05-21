package com.ft.transcendence.editorial.client;

import com.ft.transcendence.editorial.client.dto.GNewsTopHeadlinesResponse;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "gnews")
@Path("/top-headlines")
@Produces(MediaType.APPLICATION_JSON)
public interface GNewsClient {

    @GET
    GNewsTopHeadlinesResponse topHeadlines(
            @QueryParam("country") String country,
            @QueryParam("lang") String lang,
            @QueryParam("max") int max,
            @QueryParam("apikey") String apiKey
    );
}
