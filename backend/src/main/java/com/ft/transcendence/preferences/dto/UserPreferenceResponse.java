package com.ft.transcendence.preferences.dto;

import com.ft.transcendence.preferences.domain.UserPreference;

public class UserPreferenceResponse {
    public String theme;
    public String language;

    public static UserPreferenceResponse of(UserPreference up) {
        UserPreferenceResponse r = new UserPreferenceResponse();
        r.language = up.language;
        r.theme = up.theme;
        return r;
    }
}
