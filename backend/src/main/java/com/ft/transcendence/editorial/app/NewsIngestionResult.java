package com.ft.transcendence.editorial.app;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record NewsIngestionResult(int ingested, int skipped, int failed, String message) {

    public static NewsIngestionResult empty() {
        return new NewsIngestionResult(0, 0, 0, null);
    }

    public static NewsIngestionResult noApiKey() {
        return new NewsIngestionResult(0, 0, 0,
                "GNEWS_API_KEY não configurada no backend. Adicione no .env e reinicie o container.");
    }
}
