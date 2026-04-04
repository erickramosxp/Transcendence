package com.ft.transcendence.preferences.app;

import com.ft.transcendence.preferences.domain.UserPreference;
import com.ft.transcendence.preferences.dto.LanguagePreferenceDTO;
import com.ft.transcendence.preferences.dto.ThemePreferenceDTO;
import com.ft.transcendence.preferences.dto.UserPreferenceRequest;
import com.ft.transcendence.preferences.dto.UserPreferenceResponse;
import com.ft.transcendence.user.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class UserPreferenceService {

    public UserPreferenceResponse getUserPreferences(Long currentUserId) {
        UserPreference userPreference = UserPreference.find("user.id = ?1", currentUserId).firstResult();
        return UserPreferenceResponse.of(userPreference);
    }

    @Transactional
    public LanguagePreferenceDTO updateLanguagePreference(Long currentUserId, LanguagePreferenceDTO req) {
        UserPreference userPreference = UserPreference.find("user.id = ?1", currentUserId).firstResult();
        userPreference.language = req.language;
        return LanguagePreferenceDTO.of(req.language);
    }

    @Transactional
    public ThemePreferenceDTO updateThemePreference(Long currentUserId, ThemePreferenceDTO req) {
        UserPreference userPreference = UserPreference.find("user.id = ?1", currentUserId).firstResult();
        userPreference.theme = req.theme;
        return ThemePreferenceDTO.of(req.theme);
    }

    @Transactional
    public UserPreferenceResponse updateUserPreferences(Long currentUserId, UserPreferenceRequest req) {
        UserPreference userPreference = UserPreference.find("user.id = ?1", currentUserId).firstResult();
        userPreference.theme = req.theme;
        userPreference.language = req.language;
        return UserPreferenceResponse.of(userPreference);
    }
}
