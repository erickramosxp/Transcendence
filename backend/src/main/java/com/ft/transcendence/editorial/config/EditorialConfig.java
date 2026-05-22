package com.ft.transcendence.editorial.config;

import io.smallrye.config.ConfigMapping;
import io.smallrye.config.WithDefault;

@ConfigMapping(prefix = "editorial")
public interface EditorialConfig {

    @WithDefault("videanews")
    String username();

    @WithDefault("/videanews-avatar.png")
    String avatarPath();
}
