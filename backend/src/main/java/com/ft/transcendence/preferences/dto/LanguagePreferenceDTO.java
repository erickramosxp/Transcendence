package com.ft.transcendence.preferences.dto;

public class LanguagePreferenceDTO {
    public String language;

    public static LanguagePreferenceDTO of(String language) {
        LanguagePreferenceDTO lp = new LanguagePreferenceDTO();
        lp.language = language;
        return lp;
    }
}
