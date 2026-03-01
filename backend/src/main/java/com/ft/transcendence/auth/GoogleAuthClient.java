package com.ft.transcendence.auth;

import com.ft.transcendence.auth.dto.GoogleTokenResponse;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.jboss.resteasy.reactive.RestForm;

@Path("/")
@RegisterRestClient(configKey = "google-oauth")
public interface GoogleAuthClient {

    @POST
    @Path("token")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    GoogleTokenResponse token(
            @RestForm("code") String code,
            @RestForm("client_id") String clientId,
            @RestForm("client_secret") String clientSecret,
            @RestForm("redirect_uri") String redirectUri,
            @RestForm("grant_type") String grantType
    );
}
