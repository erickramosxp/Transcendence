package com.ft.transcendence.preferences.dto;

public class ThemePreferenceDTO {
    public String theme;

    public static ThemePreferenceDTO of(String theme) {
        ThemePreferenceDTO tp = new ThemePreferenceDTO();
        tp.theme = theme;
        return tp;
    }
}
