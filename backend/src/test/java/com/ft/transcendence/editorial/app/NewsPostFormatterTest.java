package com.ft.transcendence.editorial.app;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
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
    void format_addsPeriodBetweenTitleAndDescription() {
        String result = NewsPostFormatter.format(
                "Piloto morre carbonizado após queda de helicóptero em Pomerode",
                "Acidente aconteceu em uma área de difícil acesso em Pomerode",
                "https://ndmais.com.br/seguranca/piloto"
        );

        assertTrue(result.contains("Pomerode. Acidente aconteceu"));
    }

    @Test
    void format_doesNotDoublePeriodWhenTitleAlreadyEndsWithPunctuation() {
        String result = NewsPostFormatter.format(
                "Inflação estável.",
                "Índice ficou dentro da meta.",
                "https://g1.globo.com/economia/noticia.ghtml"
        );

        assertTrue(result.contains("Inflação estável. Índice ficou"));
        assertFalse(result.contains(".. Índice"));
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
