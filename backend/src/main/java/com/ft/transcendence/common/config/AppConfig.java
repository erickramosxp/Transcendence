package com.ft.transcendence.common.config;

import io.smallrye.config.ConfigMapping;
import io.smallrye.config.WithDefault;

@ConfigMapping(prefix = "app")
public interface AppConfig {

    @WithDefault("http://localhost:5173")
    String frontendOrigin();
}
