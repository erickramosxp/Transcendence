package com.ft.transcendence.editorial.app;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class NewsPostFormatterTest {

    @Test
    void format_respectsMaxLength() {
        String title = "A".repeat(200);
        String description = "B".repeat(400);
        String url = "https://example.com/noticia";

        String result = NewsPostFormatter.format(title, description, url);

        assertTrue(result.length() <= 500);
        assertTrue(result.contains("https://example.com/noticia"));
    }

    @Test
    void format_includesTitleAndLink() {
        String result = NewsPostFormatter.format(
                "Inflação estável",
                "Índice ficou dentro da meta.",
                "https://g1.globo.com/economia/noticia.ghtml"
        );

        assertTrue(result.contains("Inflação estável"));
        assertTrue(result.contains("🔗 https://g1.globo.com"));
    }
}
