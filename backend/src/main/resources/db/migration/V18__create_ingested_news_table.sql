-- V18__create_ingested_news_table.sql

CREATE TABLE ingested_news (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_url      VARCHAR(2048) NOT NULL,
    external_id     VARCHAR(512),
    title           VARCHAR(500) NOT NULL,
    summary         TEXT,
    source_name     VARCHAR(120),
    image_url       VARCHAR(2048),
    post_id         BIGINT REFERENCES posts(id) ON DELETE SET NULL,
    published_at    TIMESTAMPTZ,
    ingested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ingested_news_source_url UNIQUE (source_url)
);

CREATE INDEX idx_ingested_news_ingested_at ON ingested_news (ingested_at DESC);
CREATE INDEX idx_ingested_news_post_id ON ingested_news (post_id);
