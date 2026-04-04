package com.ft.transcendence.preferences.api;

import com.ft.transcendence.common.security.CurrentUser;
import com.ft.transcendence.preferences.app.UserPreferenceService;
import com.ft.transcendence.preferences.dto.LanguagePreferenceDTO;
import com.ft.transcendence.preferences.dto.ThemePreferenceDTO;
import com.ft.transcendence.preferences.dto.UserPreferenceRequest;
import com.ft.transcendence.preferences.dto.UserPreferenceResponse;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

@Path("/preferences")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class UserPreferenceResource {
    @Inject
    CurrentUser currentUser;
    @Inject
    UserPreferenceService userPreferenceService;

    @GET
    @Authenticated
    public UserPreferenceResponse getUserPreferences() {
        Long currentUserId = currentUser.id();
        return userPreferenceService.getUserPreferences(currentUserId);
    }

    @PATCH
    @Path("/language")
    @Authenticated
    public LanguagePreferenceDTO getLanguagePreference(LanguagePreferenceDTO req) {
        if(req.language == null || req.language.isBlank())
            throw new BadRequestException("Language cannot be null or blank");
        Long currentUserId = currentUser.id();
        return userPreferenceService.updateLanguagePreference(currentUserId, req);
    }

    @PATCH
    @Path("/theme")
    @Authenticated
    public ThemePreferenceDTO getLanguagePreference(ThemePreferenceDTO req) {
        if(req.theme == null || req.theme.isBlank())
            throw new BadRequestException("Theme cannot be null or blank");
        Long currentUserId = currentUser.id();
        return userPreferenceService.updateThemePreference(currentUserId, req);
    }

    @PUT
    @Authenticated
    public UserPreferenceResponse updatePreferences(UserPreferenceRequest req) {
        if ((req.theme == null || req.theme.isBlank()) || (req.language == null || req.language.isBlank()))
            throw new BadRequestException("Theme or language cannot be null or blank");
        Long currentUserId = currentUser.id();
        return userPreferenceService.updateUserPreferences(currentUserId, req);
    }
}
