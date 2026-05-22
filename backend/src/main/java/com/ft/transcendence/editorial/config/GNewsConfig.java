package com.ft.transcendence.editorial.config;

import io.smallrye.config.ConfigMapping;
import io.smallrye.config.WithDefault;

import java.util.Optional;

@ConfigMapping(prefix = "gnews")
public interface GNewsConfig {

    Optional<String> apiKey();

    @WithDefault("https://gnews.io/api/v4")
    String apiBaseUrl();

    @WithDefault("br")
    String country();

    @WithDefault("pt")
    String lang();

    @WithDefault("10")
    int maxPerRun();
}
