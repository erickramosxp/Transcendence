package com.ft.transcendence.media.domain;
import com.ft.transcendence.media.enums.MediaStatus;
import com.ft.transcendence.media.enums.MediaType;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "media")
public class Media extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "model_type", nullable = false)
    public String modelType;

    @Column(name = "model_id", nullable = false)
    public Long modelId;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    public MediaType mediaType;

    @Column(name = "path_original", nullable = false)
    public String pathOriginal;

    @Column(name = "path_preview")
    public String pathPreview;

    @Column(name = "path_blur")
    public String pathBlur;

    public Integer width;
    public Integer height;

    @Column(precision = 10, scale = 2)
    public BigDecimal duration;

    @Enumerated(EnumType.STRING)
    public MediaStatus status;

    @Column(name = "created_at", insertable = false, updatable = false)
    public OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    public OffsetDateTime updatedAt;

    // Método utilitário para facilitar a busca
    public static List<Media> findByModel(String modelType, Long modelId) {
        return find("modelType = ?1 and modelId = ?2", modelType, modelId).list();
    }
}