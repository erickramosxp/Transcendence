package com.ft.transcendence.editorial.domain;

import com.ft.transcendence.post.domain.Post;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ingested_news")
public class IngestedNews extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "source_url", nullable = false, unique = true, length = 2048)
    public String sourceUrl;

    @Column(name = "external_id", length = 512)
    public String externalId;

    @Column(nullable = false, length = 500)
    public String title;

    @Column(columnDefinition = "TEXT")
    public String summary;

    @Column(name = "source_name", length = 120)
    public String sourceName;

    @Column(name = "image_url", length = 2048)
    public String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    public Post post;

    @Column(name = "published_at")
    public OffsetDateTime publishedAt;

    @Column(name = "ingested_at", nullable = false)
    public OffsetDateTime ingestedAt;

    public static boolean existsBySourceUrl(String sourceUrl) {
        return count("sourceUrl", sourceUrl) > 0;
    }
}
